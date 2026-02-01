import React from 'react';
import { ResponsiveContainer } from 'recharts';

const AdvancedChartCard = ({ title, subtitle, icon: Icon, children, rightElement = null }) => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-teal-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                            <Icon size={20} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                        {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>}
                    </div>
                </div>
                {rightElement}
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdvancedChartCard;
