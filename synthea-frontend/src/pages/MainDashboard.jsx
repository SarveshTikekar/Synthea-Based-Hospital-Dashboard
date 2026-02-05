import { Users, Bed, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';

const MainDashboard = () => {
    const kpis = [
        { title: 'Total Patients', value: '12,345', icon: Users, change: '+5%', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Bed Occupancy', value: '78%', icon: Bed, change: '+2%', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Avg. Length of Stay', value: '4.2 days', icon: Clock, change: '-1%', color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Monthly Revenue', value: '$1.2M', icon: DollarSign, change: '+8%', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const recentEncounters = [
        { id: 1, patient: 'John Doe', condition: 'Diabetes', date: '2023-10-01', status: 'Admitted' },
        { id: 2, patient: 'Jane Smith', condition: 'Hypertension', date: '2023-10-02', status: 'Discharged' },
        { id: 3, patient: 'Alice Johnson', condition: 'Asthma', date: '2023-10-03', status: 'Admitted' },
    ];

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-5 shadow-sm mb-6 -mx-4 md:-mx-6 lg:-mx-8 mt-[-1rem] md:mt-[-1.5rem] lg:mt-[-2rem]">
                <div className="w-full max-w-[1920px] mx-auto">
                    <h1 className="text-xl font-bold text-slate-900">Hospital Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time insights from Synthea data</p>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="w-full max-w-[1920px] mx-auto space-y-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {kpis.map((kpi, index) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={index} className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 bg-white group`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    <span className={`text-sm font-semibold ${kpi.color} bg-opacity-10 px-2 py-0.5 rounded ${kpi.bg}`}>
                                        {kpi.change}
                                    </span>
                                    <span className="text-slate-400 text-sm ml-2">vs last month</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-teal-600" />
                            Patient Trends
                        </h3>
                        <div className="h-72 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                            [Line Chart Component]
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-purple-600" />
                            Condition Distribution
                        </h3>
                        <div className="h-72 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                            [Bar Chart Component]
                        </div>
                    </div>
                </div>

                {/* Recent Encounters Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Recent Encounters</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Condition</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentEncounters.map((encounter) => (
                                    <tr key={encounter.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{encounter.patient}</td>
                                        <td className="px-6 py-4 text-slate-600">{encounter.condition}</td>
                                        <td className="px-6 py-4 text-slate-500">{encounter.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${encounter.status === 'Admitted'
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {encounter.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
};

export default MainDashboard;
