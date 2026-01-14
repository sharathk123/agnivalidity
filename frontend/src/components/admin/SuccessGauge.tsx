import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SuccessGaugeProps {
    successRate: number;
    cleanedLines: number;
    errorCount: number;
}

export const SuccessGauge: React.FC<SuccessGaugeProps> = ({ successRate, cleanedLines, errorCount }) => {
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 5000); // Stop animation after 5 seconds
        return () => clearTimeout(timer);
    }, []);

    // Determine color state
    const getColor = (rate: number) => {
        if (rate >= 95) return 'text-emerald-500 stroke-emerald-500';
        if (rate >= 80) return 'text-amber-500 stroke-amber-500';
        return 'text-rose-500 stroke-rose-500';
    };

    const colorClass = getColor(successRate);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (successRate / 100) * circumference;

    return (
        <div className="flex flex-col items-center mt-4 p-4 bg-slate-950/50 border border-slate-800 rounded-lg relative overflow-hidden group">
            {/* Breathing Background Glow */}
            <div className={`absolute inset-0 bg-current opacity-5 ${isAnimating ? 'animate-pulse' : ''} ${colorClass.split(' ')[0]}`}></div>

            <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="stroke-slate-800 fill-none"
                        strokeWidth="6"
                    />
                    {/* Progress Circle with Animation */}
                    <motion.circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className={`fill-none ${colorClass.split(' ')[1]} drop-shadow-[0_0_8px_currentColor]`}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Percentage Text */}
                <div className="absolute flex flex-col items-center">
                    <span className={`text-sm font-bold font-mono ${colorClass.split(' ')[0]}`}>
                        {successRate.toFixed(1)}%
                    </span>
                    <span className="text-[8px] font-black text-slate-500 uppercase">Quality</span>
                </div>
            </div>

            {/* Breathing Animation Wrapper */}
            <motion.div
                animate={isAnimating ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isAnimating ? { repeat: Infinity, duration: 3 } : { duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className={`absolute inset-0 rounded-lg border-2 opacity-10 ${colorClass.split(' ')[0].replace('text-', 'border-')}`}></div>
            </motion.div>

            {/* Mini Stats */}
            <div className="flex gap-4 mt-2 w-full justify-between px-2">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Successes</span>
                    <span className="text-[10px] font-mono font-bold text-white">{cleanedLines.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer hover:bg-rose-900/20 rounded px-1 transition-colors">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Errors</span>
                    <span className={`text-[10px] font-mono font-bold ${errorCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {errorCount}
                    </span>
                </div>
            </div>
        </div>
    );
};
