import {useTheme} from './ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  );
}
