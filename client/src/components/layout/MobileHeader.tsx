import { Menu, Bell, Guitar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  userName: string;
  onMenuClick: () => void;
}

export function MobileHeader({ userName, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/10 lg:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-white hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] flex items-center justify-center">
              <Guitar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MusicTutor</h1>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#a855f7] rounded-full border-2 border-[#0f0f1a]"></span>
        </Button>
      </div>
    </header>
  );
}
