import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'metronome-theme';

export function useTheme() {
  // 获取系统主题偏好
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  // 初始化主题：优先读取本地存储，否则跟随系统
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || 'system';
  });

  // 计算实际主题
  const [actualTheme, setActualTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && saved !== 'system') {
      return saved;
    }
    return getSystemTheme();
  });

  // 应用主题到 document
  const applyTheme = useCallback((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setActualTheme(theme);
  }, []);

  // 切换主题模式
  const setTheme = useCallback((mode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_KEY, mode);
    
    if (mode === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(mode);
    }
  }, [applyTheme]);

  // 循环切换：system -> light -> dark -> system
  const toggleTheme = useCallback(() => {
    if (themeMode === 'system') {
      setTheme('light');
    } else if (themeMode === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  }, [themeMode, setTheme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  // 初始化时应用主题
  useEffect(() => {
    if (themeMode === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(themeMode);
    }
  }, []);

  return {
    themeMode,    // 'system' | 'light' | 'dark'
    actualTheme,  // 'light' | 'dark'
    setTheme,
    toggleTheme,
  };
}

