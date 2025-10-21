import { Moon, Sun } from "lucide-react";

interface Props {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export default function DarkModeToggle({ darkMode, setDarkMode }: Props) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
