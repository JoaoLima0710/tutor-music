import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Home, Play, Compass, Menu, X } from 'lucide-react';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { MobileBottomNav } from './MobileBottomNav';

interface SimplifiedNavProps {
  userName: string;
  userLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  streak: number;
}

export function SimplifiedNav({ userName, userLevel, currentXP, xpToNextLevel, streak }: SimplifiedNavProps) {
  const [location] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const { level } = useGamificationStore();
  
  // Modo simplificado para iniciantes (nível 1-3)
  const isBeginner = level <= 3;
  
  if (!isBeginner) {
    return null; // Usa navegação normal para não-iniciantes
  }
  
  const navItems = [
    { path: '/', label: 'Treinar', icon: Home, description: 'Seu treino do dia' },
    { path: '/songs', label: 'Tocar', icon: Play, description: 'Suas músicas' },
    { path: '/explore', label: 'Explorar', icon: Compass, description: 'Acordes, escalas e mais' },
  ];
  
  const currentNav = navItems.find(item => location === item.path || (item.path === '/' && location === '/'));
  
  return (
    <>
      {/* Mobile Simplified Navigation - Desktop version removed, use Sidebar instead */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path === '/' && location === '/');
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-[#8b5cf6] bg-purple-500/20'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
