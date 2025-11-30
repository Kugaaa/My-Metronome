import { useState, useRef, useEffect } from 'react';
import { useMetronome, SOUND_TYPES } from '../hooks/useMetronome';
import './Metronome.css';

function Metronome() {
  const {
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
  } = useMetronome();

  // 用于输入时的临时值
  const [inputValue, setInputValue] = useState(String(bpm));
  const [isEditing, setIsEditing] = useState(false);
  
  // 节拍计数器，用于触发灯带动画
  const [beatCount, setBeatCount] = useState(0);
  const prevBeatRef = useRef(-1);
  
  // 检测节拍变化，更新计数器以触发灯带动画
  useEffect(() => {
    if (isPlaying && currentBeat !== prevBeatRef.current) {
      setBeatCount(prev => prev + 1);
      prevBeatRef.current = currentBeat;
    }
    if (!isPlaying) {
      prevBeatRef.current = -1;
    }
  }, [isPlaying, currentBeat]);

  const handleBpmChange = (e) => {
    setBpm(Number(e.target.value));
  };

  // 输入框获得焦点
  const handleFocus = (e) => {
    setIsEditing(true);
    setInputValue(String(bpm));
    e.target.select(); // 选中全部文字，方便直接输入
  };

  // 输入时允许自由输入
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 失焦时验证并应用
  const handleBlur = () => {
    setIsEditing(false);
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      const clampedValue = Math.max(20, Math.min(300, value));
      setBpm(clampedValue);
      setInputValue(String(clampedValue));
    } else {
      setInputValue(String(bpm));
    }
  };

  // 键盘事件：回车确认，上下箭头调整
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(300, bpm + 1);
      setBpm(newValue);
      setInputValue(String(newValue));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(20, bpm - 1);
      setBpm(newValue);
      setInputValue(String(newValue));
    } else if (e.key === 'Escape') {
      setInputValue(String(bpm));
      e.target.blur();
    }
  };

  const adjustBpm = (delta) => {
    const newBpm = Math.max(20, Math.min(300, bpm + delta));
    setBpm(newBpm);
    setInputValue(String(newBpm));
  };

  // 检测是否有节拍点亮起（需要开启节奏闪烁功能）
  const isBeatActive = isPlaying && currentBeat !== null && flashEnabled;
  
  // 检测是否需要晃动
  const isShaking = isPlaying && currentBeat !== null && shakeEnabled;

  return (
    <div className="metronome">
      {/* 边缘灯带效果 - 使用 key 强制每次节拍重新渲染以触发动画 */}
      {isBeatActive && (
        <div 
          key={beatCount}
          className={`edge-glow active ${currentBeat === 0 && accentEnabled ? 'accent' : ''}`}
        >
          <div className="edge-glow-top"></div>
          <div className="edge-glow-bottom"></div>
          <div className="edge-glow-left"></div>
          <div className="edge-glow-right"></div>
        </div>
      )}

      {/* 标题（仅移动端显示在顶部） */}
      <div className="header mobile-only">
        <h1 
          key={isShaking ? `title-m-${beatCount}` : 'title-m'}
          className={isShaking ? 'shake' : ''}
        >🎸 节拍器</h1>
        <p 
          key={isShaking ? `subtitle-m-${beatCount}` : 'subtitle-m'}
          className={`subtitle ${isShaking ? 'shake' : ''}`}
        >Metronome</p>
      </div>

      <div className="metronome-layout">
        {/* 左侧：主控制区 */}
        <div className="main-panel">
          {/* 标题（PC端显示在左侧） */}
          <div className="header desktop-only">
            <h1 
              key={isShaking ? `title-d-${beatCount}` : 'title-d'}
              className={isShaking ? 'shake' : ''}
            >🎸  节拍器</h1>
            <p 
              key={isShaking ? `subtitle-d-${beatCount}` : 'subtitle-d'}
              className={`subtitle ${isShaking ? 'shake' : ''}`}
            >Metronome</p>
          </div>

          {/* BPM 显示 */}
          <div className="bpm-display">
            <button 
              className={`bpm-adjust-btn ${isShaking ? 'shake' : ''}`}
              key={isShaking ? `minus-${beatCount}` : 'minus'}
              onClick={() => adjustBpm(-1)}
              aria-label="减少 BPM"
            >
              −
            </button>
            <div 
              key={isShaking ? `bpm-container-${beatCount}` : 'bpm-container'}
              className={`bpm-value-container ${isEditing ? 'editing' : ''} ${isShaking ? 'shake' : ''}`}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="bpm-value"
                value={isEditing ? inputValue : bpm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
              <span className="bpm-label">BPM</span>
              <span className="bpm-hint">点击输入 · ↑↓ 微调</span>
            </div>
            <button 
              className={`bpm-adjust-btn ${isShaking ? 'shake' : ''}`}
              key={isShaking ? `plus-${beatCount}` : 'plus'}
              onClick={() => adjustBpm(1)}
              aria-label="增加 BPM"
            >
              +
            </button>
          </div>

          {/* BPM 滑块 */}
          <div className="slider-container">
            <span 
              key={isShaking ? `slider-20-${beatCount}` : 'slider-20'}
              className={`slider-label ${isShaking ? 'shake' : ''}`}
            >20</span>
            <input
              type="range"
              className="bpm-slider"
              min="20"
              max="300"
              value={bpm}
              onChange={handleBpmChange}
            />
            <span 
              key={isShaking ? `slider-300-${beatCount}` : 'slider-300'}
              className={`slider-label ${isShaking ? 'shake' : ''}`}
            >300</span>
          </div>

          {/* 节拍指示器 */}
          <div className="beat-indicators">
            {Array.from({ length: beatsPerMeasure }, (_, i) => (
              <div
                key={i}
                className={`beat-dot ${
                  isPlaying && currentBeat === i ? 'active' : ''
                } ${i === 0 && accentEnabled ? 'accent' : ''}`}
              />
            ))}
          </div>

          {/* 播放按钮 */}
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''} ${isShaking ? 'shake' : ''}`}
            key={isShaking ? `play-${beatCount}` : 'play'} 
            onClick={toggle}
          >
            <span className="play-icon">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </span>
            <span className="play-text">{isPlaying ? '停止' : '开始'}</span>
          </button>
        </div>

        {/* 右侧：设置区 */}
        <div className="settings-panel">
          {/* 设置区域 */}
          <div className="settings">
            {/* 拍号设置 */}
            <div className="setting-group">
              <label 
                key={isShaking ? `label-ts-${beatCount}` : 'label-ts'}
                className={`setting-label ${isShaking ? 'shake' : ''}`}
              >拍号</label>
              <div className="time-signature-options">
                {[2, 3, 4, 6, 8].map((beats) => (
                  <button
                    key={isShaking ? `ts-${beats}-${beatCount}` : beats}
                    className={`time-sig-btn ${beatsPerMeasure === beats ? 'active' : ''} ${isShaking ? 'shake' : ''}`}
                    onClick={() => setBeatsPerMeasure(beats)}
                  >
                    {beats}/4
                  </button>
                ))}
              </div>
            </div>

            {/* 音色设置 */}
            <div className="setting-group">
              <label 
                key={isShaking ? `label-sound-${beatCount}` : 'label-sound'}
                className={`setting-label ${isShaking ? 'shake' : ''}`}
              >音色</label>
              <div className="sound-options">
                {Object.entries(SOUND_TYPES).map(([key, sound]) => (
                  <button
                    key={isShaking ? `sound-${key}-${beatCount}` : key}
                    className={`sound-btn ${soundType === key ? 'active' : ''} ${isShaking ? 'shake' : ''}`}
                    onClick={() => setSoundType(key)}
                  >
                    {sound.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 功能开关 */}
            <div className="setting-group">
              <label 
                key={isShaking ? `label-feature-${beatCount}` : 'label-feature'}
                className={`setting-label ${isShaking ? 'shake' : ''}`}
              >功能</label>
              <div className="feature-toggles">
                {/* 第一行：重拍开关 */}
                <div className="feature-toggles-row">
                  <button
                    key={isShaking ? `accent-${beatCount}` : 'accent'}
                    className={`toggle-btn ${accentEnabled ? 'active' : ''} ${isShaking ? 'shake' : ''}`}
                    onClick={() => setAccentEnabled(!accentEnabled)}
                    aria-pressed={accentEnabled}
                  >
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                    <span className="toggle-text">重拍</span>
                  </button>
                </div>
                {/* 第二行：节奏开关 */}
                <div className="feature-toggles-row">
                  {/* 节奏闪烁开关 */}
                  <button
                    key={isShaking ? `flash-${beatCount}` : 'flash'}
                    className={`toggle-btn ${flashEnabled ? 'active' : ''} ${isShaking ? 'shake' : ''}`}
                    onClick={() => setFlashEnabled(!flashEnabled)}
                    aria-pressed={flashEnabled}
                  >
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                    <span className="toggle-text">节奏闪烁</span>
                  </button>
                  {/* 节奏晃动开关 */}
                  <button
                    key={isShaking ? `shake-${beatCount}` : 'shake'}
                    className={`toggle-btn ${shakeEnabled ? 'active' : ''} ${isShaking ? 'shake' : ''}`}
                    onClick={() => setShakeEnabled(!shakeEnabled)}
                    aria-pressed={shakeEnabled}
                  >
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                    <span className="toggle-text">节奏晃动</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 常用 BPM 预设 */}
          <div className="presets">
            <span 
              key={isShaking ? `preset-label-${beatCount}` : 'preset-label'}
              className={`preset-label ${isShaking ? 'shake' : ''}`}
            >常用速度：</span>
            <div className="preset-buttons">
              {[
                { bpm: 60, name: 'Largo' },
                { bpm: 80, name: 'Andante' },
                { bpm: 100, name: 'Moderato' },
                { bpm: 120, name: 'Allegro' },
                { bpm: 140, name: 'Vivace' },
                { bpm: 180, name: 'Presto' },
              ].map((preset) => (
                <button
                  key={isShaking ? `preset-${preset.bpm}-${beatCount}` : preset.bpm}
                  className={`preset-btn ${isShaking ? 'shake' : ''}`}
                  onClick={() => setBpm(preset.bpm)}
                >
                  <span className="preset-bpm">{preset.bpm}</span>
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 音量控制 */}
          <div className="volume-control">
            <div className="volume-header">
              <label 
                key={isShaking ? `label-vol-${beatCount}` : 'label-vol'}
                className={`setting-label ${isShaking ? 'shake' : ''}`}
              >音量</label>
              <span 
                key={isShaking ? `vol-val-${beatCount}` : 'vol-val'}
                className={`volume-value ${isShaking ? 'shake' : ''}`}
              >{volume}</span>
            </div>
            <div className="volume-slider-container">
              <svg 
                key={isShaking ? `vol-min-${beatCount}` : 'vol-min'}
                className={`volume-icon ${isShaking ? 'shake' : ''}`} 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                {volume === 0 ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                ) : volume < 50 ? (
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                )}
              </svg>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <svg 
                key={isShaking ? `vol-max-${beatCount}` : 'vol-max'}
                className={`volume-icon volume-icon-max ${isShaking ? 'shake' : ''}`} 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metronome;
