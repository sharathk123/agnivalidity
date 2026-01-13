import React from 'react';

export const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-white z-50">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                    AGNI EXIM
                </h1>
                <div className="text-xs text-slate-400 mt-1 tracking-wider uppercase">Intelligence Platform</div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem active icon="📊" label="Dashboard" />
                <NavItem icon="🌍" label="Market Intelligence" />
                <NavItem icon="📜" label="Compliance" />
                <NavItem icon="📉" label="Price Analysis" />
                <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4">System</div>
                <NavItem icon="⚙️" label="Settings" />
                <NavItem icon="🔔" label="Alerts" />
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-xs font-bold shadow-lg">
                        JD
                    </div>
                    <div className="text-sm">
                        <div className="font-medium text-slate-200">John Doe</div>
                        <div className="text-xs text-slate-500">Premium Plan</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active }: { icon: string, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <span className="opacity-75 group-hover:opacity-100 transition-opacity">{icon}</span>
        <span className="font-medium">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
    </div>
);
