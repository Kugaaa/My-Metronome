import { useState, useRef, useCallback, useEffect } from 'react';

// 音色配置
export const SOUND_TYPES = {
  click: {
    name: '经典',
    frequency: 1000,
    type: 'square',
    duration: 0.05,
    gain: 0.5,
  },
  beep: {
    name: '电子',
    frequency: 880,
    type: 'sine',
    duration: 0.1,
    gain: 1.0,
  },
  kick: {
    name: '底鼓',
    frequency: 100,
    type: 'sine',
    duration: 0.15,
    gain: 1.5,
  },
  keyboard: {
    name: '气泡',
    frequency: 523.25,
    type: 'sine',
    duration: 0.12,
    gain: 0.9,
    isKeyboard: true,
  },
  whistle: {
    name: '玻璃',
    frequency: 1200,
    type: 'sine',
    duration: 0.15,
    gain: 0.8,
    isWhistle: true,
  },
};

const VOLUME_KEY = 'metronome-volume';

export function useMetronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [soundType, setSoundType] = useState('click');
  const [accentEnabled, setAccentEnabled] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(true); // 节奏闪烁开关
  const [shakeEnabled, setShakeEnabled] = useState(true); // 节奏晃动开关
  // 音量 0-100，默认 60，从 localStorage 读取
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
    return 60;
  });
  
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null); // 主音量节点，用于静音已调度的声音
  const audioSchedulerIdRef = useRef(null);
  const uiSyncerIdRef = useRef(null);
  
  // 用于音频调度的 refs
  const nextNoteTimeRef = useRef(0);
  const schedulerBeatRef = useRef(0);
  
  // 用于 UI 同步的 refs
  const beatTimesRef = useRef([]);
  const displayedBeatRef = useRef(-1);
  const isRunningRef = useRef(false);
  
  // 配置 refs
  const accentEnabledRef = useRef(true);
  const soundTypeRef = useRef('click');
  const bpmRef = useRef(120);
  const beatsPerMeasureRef = useRef(4);
  const volumeRef = useRef(60); // 音量 ref

  // 初始化音频上下文和主音量节点
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // 创建新的主音量节点（用于每次重启时切换）
  const createMasterGain = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return null;
    
    // 断开旧的主音量节点（让已调度的声音静音）
    if (masterGainRef.current) {
      masterGainRef.current.disconnect();
    }
    
    // 创建新的主音量节点
    const newMasterGain = audioContext.createGain();
    newMasterGain.connect(audioContext.destination);
    masterGainRef.current = newMasterGain;
    
    return newMasterGain;
  }, []);

  // 播放节拍音
  const playSound = useCallback((time, isAccent) => {
    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!audioContext || !masterGain) return;

    const sound = SOUND_TYPES[soundTypeRef.current];
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    const baseFreq = isAccent ? sound.frequency * 1.3 : sound.frequency;
    
    oscillator.type = sound.type;
    
    if (sound.isKeyboard) {
      oscillator.frequency.setValueAtTime(baseFreq, time);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.98, time + sound.duration);
    } else if (sound.isWhistle) {
      oscillator.frequency.setValueAtTime(baseFreq * 0.8, time);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq, time + sound.duration * 0.3);
    } else {
      oscillator.frequency.setValueAtTime(baseFreq, time);
    }
    
    // 音量乘数：60 为基准（1.0），0 为静音，100 约为 1.67 倍
    const volumeMultiplier = volumeRef.current / 60;
    const baseGain = sound.gain * (isAccent ? 1.0 : 0.7) * volumeMultiplier;
    gainNode.gain.setValueAtTime(baseGain, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + sound.duration);
    
    // 连接到主音量节点（而不是直接连接到 destination）
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.start(time);
    oscillator.stop(time + sound.duration + 0.01);
  }, []);

  // 音频调度器
  const scheduleAudio = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext || !isRunningRef.current) return;

    const scheduleAheadTime = 0.1;
    const lookahead = 25;

    while (nextNoteTimeRef.current < audioContext.currentTime + scheduleAheadTime) {
      const isAccent = accentEnabledRef.current && schedulerBeatRef.current === 0;
      const beatIndex = schedulerBeatRef.current;
      const noteTime = nextNoteTimeRef.current;
      
      playSound(noteTime, isAccent);
      
      beatTimesRef.current.push({ time: noteTime, beat: beatIndex });
      
      if (beatTimesRef.current.length > 10) {
        beatTimesRef.current.shift();
      }
      
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      schedulerBeatRef.current = (schedulerBeatRef.current + 1) % beatsPerMeasureRef.current;
    }
    
    audioSchedulerIdRef.current = setTimeout(scheduleAudio, lookahead);
  }, [playSound]);

  // UI 同步器
  const syncUI = useCallback(() => {
    if (!isRunningRef.current) return;
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;
    
    let beatToShow = -1;
    for (let i = beatTimesRef.current.length - 1; i >= 0; i--) {
      if (beatTimesRef.current[i].time <= currentTime) {
        beatToShow = beatTimesRef.current[i].beat;
        break;
      }
    }
    
    if (beatToShow !== -1 && beatToShow !== displayedBeatRef.current) {
      displayedBeatRef.current = beatToShow;
      setCurrentBeat(beatToShow);
    }
    
    uiSyncerIdRef.current = setTimeout(syncUI, 4);
  }, []);

  // 停止内部调度器
  const stopSchedulers = useCallback(() => {
    isRunningRef.current = false;
    
    if (audioSchedulerIdRef.current) {
      clearTimeout(audioSchedulerIdRef.current);
      audioSchedulerIdRef.current = null;
    }
    if (uiSyncerIdRef.current) {
      clearTimeout(uiSyncerIdRef.current);
      uiSyncerIdRef.current = null;
    }
    
    beatTimesRef.current = [];
    displayedBeatRef.current = -1;
  }, []);

  // 开始播放（内部实现）
  const startInternal = useCallback(async () => {
    const audioContext = initAudioContext();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // 停止调度器
    stopSchedulers();
    
    // 创建新的主音量节点（这会让之前调度的声音静音）
    createMasterGain();
    
    // 重置状态
    isRunningRef.current = true;
    schedulerBeatRef.current = 0;
    displayedBeatRef.current = 0;
    
    const now = audioContext.currentTime;
    
    // 立即播放第一拍
    const isAccent = accentEnabledRef.current;
    playSound(now, isAccent);
    setCurrentBeat(0);
    
    // 设置下一拍时间
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current = now + secondsPerBeat;
    schedulerBeatRef.current = 1 % beatsPerMeasureRef.current;
    
    // 记录第一拍
    beatTimesRef.current = [{ time: now, beat: 0 }];
    
    // 启动调度器
    scheduleAudio();
    syncUI();
  }, [initAudioContext, stopSchedulers, createMasterGain, playSound, scheduleAudio, syncUI]);

  // 开始播放
  const start = useCallback(() => {
    setIsPlaying(true);
    startInternal();
  }, [startInternal]);

  // 停止播放
  const stop = useCallback(() => {
    stopSchedulers();
    // 断开主音量节点，立即静音
    if (masterGainRef.current) {
      masterGainRef.current.disconnect();
      masterGainRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  }, [stopSchedulers]);

  // 重新开始（如果正在播放的话）
  const restart = useCallback(() => {
    if (isRunningRef.current) {
      startInternal();
    }
  }, [startInternal]);

  // 切换播放状态
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // 当 BPM 改变时重新开始
  useEffect(() => {
    bpmRef.current = bpm;
    restart();
  }, [bpm, restart]);

  // 当拍号改变时重新开始
  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
    restart();
  }, [beatsPerMeasure, restart]);

  // 当音色改变时重新开始
  useEffect(() => {
    soundTypeRef.current = soundType;
    restart();
  }, [soundType, restart]);

  // 当重拍开关改变时重新开始
  useEffect(() => {
    accentEnabledRef.current = accentEnabled;
    restart();
  }, [accentEnabled, restart]);

  // 当音量改变时更新 ref 和 localStorage
  useEffect(() => {
    volumeRef.current = volume;
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  // 设置音量的包装函数
  const setVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      stopSchedulers();
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
      }
    };
  }, [stopSchedulers]);

  return {
    bpm,
    setBpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    setBeatsPerMeasure,
    soundType,
    setSoundType,
    accentEnabled,
    setAccentEnabled,
    flashEnabled,
    setFlashEnabled,
    shakeEnabled,
    setShakeEnabled,
    volume,
    setVolume,
    toggle,
    start,
    stop,
  };
}
