import { Home, Guitar, Music2, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function MobileBottomNav() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/chords', label: 'Acordes', icon: Guitar },
    { path: '/scales', label: 'Escalas', icon: Music2 },
    { path: '/profile', label: 'Perfil', icon: User },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-white/10 lg:hidden z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                  ${isActive 
                    ? 'text-[#a855f7]' 
                    : 'text-gray-400'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
