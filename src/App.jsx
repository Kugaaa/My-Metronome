import Metronome from './components/Metronome';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <main className="app">
      <ThemeToggle themeMode={themeMode} onToggle={toggleTheme} />
      <Metronome />
      <footer className="footer">
        <p>点击开始，跟随节拍练习 ♪</p>
      </footer>
    </main>
  );
}

export default App;
