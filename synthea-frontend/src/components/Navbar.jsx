import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BarChart3, Settings, Database } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Data Generation', href: '/datageneration', icon: Database },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    // REMOVED 'fixed'. Added 'h-full' and 'flex-shrink-0' so it never squishes.
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm z-10">
      
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-xl font-bold text-teal-600 tracking-tight">Hospital Admin</h2>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-teal-600'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100 text-[10px] text-gray-400 font-mono text-center">
        SYSTEM v2.0.4
      </div>
    </div>
  );
};

export default Navbar;
