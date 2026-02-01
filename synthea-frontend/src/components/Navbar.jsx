import { Link, useLocation } from 'react-router-dom';
import { Database, Users, Stethoscope, ShieldAlert, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Data Generation', href: '/data_generation', icon: Database },
    { name: 'Patients', href: '/patient_dashboard', icon: Users },
    { name: 'Conditions', href: '/conditions_dashboard', icon: Stethoscope },
    { name: 'Allergies', href: '/allergies_dashboard', icon: ShieldAlert },
    { name: 'Encounters', href: '/encounters_dashboard', icon: ClipboardList },
  ];

  return (
    <>
      {/* Spacer for desktop sidebar (prevents content overlap) */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* Spacer for mobile bottom nav (prevents content overlap) */}
      <div className="md:hidden h-20 w-full flex-shrink-0" />

      <div className="fixed bottom-0 left-0 w-full h-auto bg-white border-t md:border-t-0 md:border-r border-gray-200 flex flex-row md:flex-col z-50 md:h-full md:w-64 md:top-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">

        {/* Desktop Header */}
        <div className="hidden md:block p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-teal-600 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-teal-700 text-lg">S</span>
            </div>
            Synthea Analytics
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start p-2 md:p-6 md:space-y-2 overflow-x-auto md:overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col md:flex-row items-center md:gap-4 p-2 md:px-4 md:py-3 rounded-xl transition-all font-medium text-xs md:text-sm ${isActive
                  ? 'text-teal-600 md:bg-teal-50 md:text-teal-700 md:shadow-sm md:border md:border-teal-100'
                  : 'text-gray-400 hover:text-teal-600 md:text-gray-500 md:hover:bg-gray-50'
                  }`}
              >
                <div className={`p-1.5 rounded-lg mb-1 md:mb-0 transition-colors ${isActive ? 'bg-teal-50 md:bg-transparent' : ''}`}>
                  <Icon size={20} className={isActive ? "fill-current md:fill-none" : ""} />
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="hidden md:block p-6 border-t border-gray-100 text-[10px] text-gray-400 font-mono text-center">
          SYSTEM v2.0.4
        </div>
      </div>
    </>
  );
};

export default Navbar;
