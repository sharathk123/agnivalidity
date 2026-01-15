import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center w-16 h-8 rounded-full p-1 transition-all duration-300 border
        bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700
        hover:border-indigo-400 dark:hover:border-indigo-500
        shadow-sm dark:shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        >
            {/* Sliding Pill */}
            <div
                className={`absolute w-6 h-6 rounded-full transition-all duration-300 ease-out shadow-md
          ${isLight
                        ? 'left-1 bg-amber-400 shadow-amber-400/40'
                        : 'left-[calc(100%-1.75rem)] bg-slate-600 shadow-slate-500/30'
                    }`}
            />

            {/* Icons */}
            <div className="relative z-10 flex items-center justify-between w-full px-1">
                <Sun className={`w-4 h-4 transition-colors duration-300 ${isLight ? 'text-amber-600' : 'text-slate-500'}`} />
                <Moon className={`w-4 h-4 transition-colors duration-300 ${isLight ? 'text-slate-400' : 'text-slate-300'}`} />
            </div>
        </button>
    );
};
