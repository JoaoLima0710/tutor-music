/**
 * Componente de Breadcrumbs
 * Mostra caminho de navegação e botão voltar
 */

import { useLocation } from 'wouter';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/chords': 'Acordes',
  '/scales': 'Escalas',
  '/songs': 'Músicas',
  '/practice': 'Prática',
  '/theory': 'Teoria Musical',
  '/tuner': 'Afinador',
  '/missions': 'Missões',
  '/achievements': 'Conquistas',
  '/profile': 'Perfil',
  '/settings': 'Configurações'
};

export function Breadcrumbs({ items, showBackButton = true, className = '' }: BreadcrumbsProps) {
  const [location, setLocation] = useLocation();

  // Se items não for fornecido, gerar automaticamente baseado na rota
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (location === '/') {
      return [{ label: 'Home', path: '/' }];
    }

    const pathParts = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = ROUTE_LABELS[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Não mostrar breadcrumbs na home
  if (location === '/' && !items) {
    return null;
  }

  const handleBack = () => {
    if (breadcrumbItems.length > 1) {
      const previousPath = breadcrumbItems[breadcrumbItems.length - 2].path;
      setLocation(previousPath);
    } else {
      setLocation('/');
    }
  };

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-white/70 hover:text-white mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      )}

      <div className="flex items-center gap-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <div key={item.path} className="flex items-center gap-2">
              {index === 0 ? (
                <Link href={item.path}>
                  <button className="text-white/70 hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </button>
                </Link>
              ) : (
                <Link href={item.path}>
                  <button
                    className={`transition-colors ${
                      isLast
                        ? 'text-white font-semibold cursor-default'
                        : 'text-white/70 hover:text-white'
                    }`}
                    onClick={(e) => {
                      if (isLast) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.label}
                  </button>
                </Link>
              )}
              
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-white/40" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
