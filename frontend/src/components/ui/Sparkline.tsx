import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineProps {
    data: number[]; // Array of values (e.g. 0 or 1 for success/fail, or latency numbers)
    color?: string; // Hex color or Tailwind class logic handled by parent
    height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = "#6366f1", height = 40 }) => {
    // Transform array [1, 0, 1] into object array [{i:0, val:1}, ...] for Recharts
    const chartData = data.map((val, i) => ({ i, val }));

    return (
        <div style={{ height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        fill={`url(#gradient-${color})`}
                        strokeWidth={2}
                        isAnimationActive={false} // Disable animation for performance in lists
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
