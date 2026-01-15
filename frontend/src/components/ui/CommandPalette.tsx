import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Monitor, TrendingUp, Globe, Settings, Sun, Moon, Sidebar, Link, ArrowRight, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CommandItem {
    id: string;
    label: string;
    category: 'Navigation' | 'System' | 'Admin';
    icon: React.ReactNode;
    action: () => void;
    shortcut?: string;
}

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Toggle Sidebar - using a custom event dispatch since sidebar state is in Layout
    const toggleSidebar = () => {
        const event = new CustomEvent('toggle-sidebar');
        window.dispatchEvent(event);
    };

    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-dashboard', label: 'Go to Market Intelligence', category: 'Navigation', icon: <TrendingUp size={16} />, action: () => navigate('/user/market-trends') },
        { id: 'nav-global', label: 'Go to Global Demand', category: 'Navigation', icon: <Globe size={16} />, action: () => navigate('/user/global-demand') },
        { id: 'nav-pricing', label: 'Go to Pricing Engine', category: 'Navigation', icon: <Monitor size={16} />, action: () => navigate('/user/pricing-engine') },
        { id: 'nav-sourcing', label: 'Go to ODOP Sourcing', category: 'Navigation', icon: <Link size={16} />, action: () => navigate('/user/odop-sourcing') },

        // Admin
        { id: 'admin-command', label: 'Go to Command Center', category: 'Admin', icon: <ShieldAlert size={16} />, action: () => navigate('/admin/command-center') },

        // System Actions
        { id: 'sys-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, category: 'System', icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />, action: () => toggleTheme(), shortcut: 'Cmd+J' },
        { id: 'sys-sidebar', label: 'Toggle Sidebar', category: 'System', icon: <Sidebar size={16} />, action: () => toggleSidebar(), shortcut: 'Cmd+B' },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    // Global Keyboard Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }

            if (!isOpen) return;

            if (e.key === 'Escape') {
                setIsOpen(false);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredCommands.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const item = filteredCommands[activeIndex];
                if (item) {
                    item.action();
                    setIsOpen(false);
                    setSearch('');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, filteredCommands, theme]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSearch('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[101] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
                            <Search className="text-slate-400 w-5 h-5" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setActiveIndex(0); }}
                                placeholder="Type a command or search..."
                                className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium"
                            />
                            <div className="flex gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700">ESC</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-xs">No commands found.</div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredCommands.map((item, index) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { item.action(); setIsOpen(false); }}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${index === activeIndex
                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`${index === activeIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className="font-medium">{item.label}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.shortcut && (
                                                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">{item.shortcut}</span>
                                                )}
                                                {index === activeIndex && (
                                                    <ArrowRight size={14} className="text-indigo-500" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-medium">Agni Omni-Search v1.0</span>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><span className="font-bold">↑↓</span> to navigate</span>
                                <span className="flex items-center gap-1"><span className="font-bold">↵</span> to select</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
