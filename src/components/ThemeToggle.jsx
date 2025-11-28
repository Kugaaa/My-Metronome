import './ThemeToggle.css';

function ThemeToggle({ themeMode, onToggle }) {
  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'dark':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        );
      default: // system
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (themeMode) {
      case 'light':
        return '亮色';
      case 'dark':
        return '暗色';
      default:
        return '自动';
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`当前：${getLabel()}模式，点击切换`}
      aria-label={`切换主题，当前${getLabel()}模式`}
    >
      <span className="theme-icon">{getIcon()}</span>
      <span className="theme-label">{getLabel()}</span>
    </button>
  );
}

export default ThemeToggle;

