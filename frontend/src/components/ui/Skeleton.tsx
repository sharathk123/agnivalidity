import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/50 ${className || ''}`}
            {...props}
        />
    );
};
