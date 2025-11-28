import { useState } from 'react';
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
    toggle,
  } = useMetronome();

  // 用于输入时的临时值
  const [inputValue, setInputValue] = useState(String(bpm));
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="metronome">
      {/* 标题（仅移动端显示在顶部） */}
      <div className="header mobile-only">
        <h1>🎸 节拍器</h1>
        <p className="subtitle">Metronome</p>
      </div>

      <div className="metronome-layout">
        {/* 左侧：主控制区 */}
        <div className="main-panel">
          {/* 标题（PC端显示在左侧） */}
          <div className="header desktop-only">
            <h1>🎸  节拍器</h1>
            <p className="subtitle">Metronome</p>
          </div>

          {/* BPM 显示 */}
          <div className="bpm-display">
            <button 
              className="bpm-adjust-btn" 
              onClick={() => adjustBpm(-1)}
              aria-label="减少 BPM"
            >
              −
            </button>
            <div className={`bpm-value-container ${isEditing ? 'editing' : ''}`}>
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
              className="bpm-adjust-btn" 
              onClick={() => adjustBpm(1)}
              aria-label="增加 BPM"
            >
              +
            </button>
          </div>

          {/* BPM 滑块 */}
          <div className="slider-container">
            <span className="slider-label">20</span>
            <input
              type="range"
              className="bpm-slider"
              min="20"
              max="300"
              value={bpm}
              onChange={handleBpmChange}
            />
            <span className="slider-label">300</span>
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
            className={`play-button ${isPlaying ? 'playing' : ''}`} 
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
              <label className="setting-label">拍号</label>
              <div className="time-signature-options">
                {[2, 3, 4, 6, 8].map((beats) => (
                  <button
                    key={beats}
                    className={`time-sig-btn ${beatsPerMeasure === beats ? 'active' : ''}`}
                    onClick={() => setBeatsPerMeasure(beats)}
                  >
                    {beats}/4
                  </button>
                ))}
              </div>
            </div>

            {/* 音色设置 */}
            <div className="setting-group">
              <label className="setting-label">音色</label>
              <div className="sound-options">
                {Object.entries(SOUND_TYPES).map(([key, sound]) => (
                  <button
                    key={key}
                    className={`sound-btn ${soundType === key ? 'active' : ''}`}
                    onClick={() => setSoundType(key)}
                  >
                    {sound.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 重拍开关 */}
            <div className="setting-group">
              <label className="setting-label">重拍</label>
              <button
                className={`toggle-btn ${accentEnabled ? 'active' : ''}`}
                onClick={() => setAccentEnabled(!accentEnabled)}
                aria-pressed={accentEnabled}
              >
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">
                  {accentEnabled ? '开启重拍' : '关闭重拍'}
                </span>
              </button>
            </div>
          </div>

          {/* 常用 BPM 预设 */}
          <div className="presets">
            <span className="preset-label">常用速度：</span>
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
                  key={preset.bpm}
                  className="preset-btn"
                  onClick={() => setBpm(preset.bpm)}
                >
                  <span className="preset-bpm">{preset.bpm}</span>
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metronome;
