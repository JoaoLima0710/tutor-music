import React from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    featureName?: string;
    className?: string;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({
    children,
    fallback,
    featureName = 'Recurso Premium',
    className = ''
}) => {
    const { user } = useUserStore();
    const isPro = user?.plan === 'pro' || user?.plan === 'lifetime';

    const handleUpgradeClick = () => {
        // Navigate to pricing or show modal
        toast.info("Funcionalidade de upgrade em breve!");
        // window.location.href = '/pricing';
    };

    if (isPro) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className={`flex flex-col items-center justify-center p-8 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/5 ${className}`}>
            <div className="bg-purple-500/10 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
                {featureName} Bloqueado
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-sm">
                Faça upgrade para a versão PRO para desbloquear este recurso e muito mais.
            </p>
            <Button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
                Desbloquear Agora
            </Button>
        </div>
    );
};
