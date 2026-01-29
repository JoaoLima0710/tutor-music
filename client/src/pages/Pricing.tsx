import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { toast } from "sonner";
import { authService } from "@/services/AuthService";
import { useLocation } from "wouter";

export default function Pricing() {
    const { user, refreshUser } = useUserStore();
    const [, setLocation] = useLocation();

    const handleSubscribe = async (planType: 'pro' | 'lifetime') => {
        // Mock Payment Process
        const toastId = toast.loading("Processando pagamento securely via Stripe (Mock)...");

        setTimeout(async () => {
            try {
                // Simular sucesso do webhook
                // Em produção, isso seria feito no backend
                const updatedUser = authService.updateProfile({
                    plan: planType,
                    subscriptionStatus: 'active',
                    proFeatures: {
                        unlimitedHearts: true,
                        advancedStats: true
                    }
                });

                refreshUser();
                toast.dismiss(toastId);
                toast.success(`Parabéns! Você agora é ${planType.toUpperCase()}.`, {
                    description: "Todas as funcionalidades foram desbloqueadas."
                });

                // Redirecionar para home ou dashboard
                setTimeout(() => setLocation('/'), 1500);

            } catch (error) {
                toast.error("Erro no processamento. Tente novamente.");
            }
        }, 2000);
    };

    const currentPlan = user?.plan || 'free';

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Invista na sua Jornada Musical
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Desbloqueie todo o potencial do MusicTutor e aprenda violão 3x mais rápido com ferramentas profissionais.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 flex flex-col relative overflow-hidden">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold">Iniciante</h3>
                            <div className="text-3xl font-bold mt-2">Grátis</div>
                            <p className="text-gray-400 mt-2">Para quem está começando agora.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Acesso ao Módulo 1" />
                            <FeatureItem text="Afinador Básico" />
                            <FeatureItem text="Metrônomo Simples" />
                            <FeatureItem text="3 Músicas por Mês" />
                        </ul>
                        <Button disabled={true} className="w-full bg-slate-700 text-slate-300 cursor-not-allowed">
                            Plano Atual
                        </Button>
                    </div>

                    {/* Pro Plan (Monthly) */}
                    <div className="bg-gradient-to-br from-purple-900/80 to-slate-900 rounded-2xl p-8 border border-purple-500 relative flex flex-col shadow-2xl transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white">Pro Mensal</h3>
                            <div className="flex items-end mt-2">
                                <span className="text-4xl font-bold">R$ 29,90</span>
                                <span className="text-gray-400 ml-1 mb-1">/mês</span>
                            </div>
                            <p className="text-purple-200 mt-2">Flexibilidade total. Cancele quando quiser.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Acesso Ilimitado a Todos os Módulos" highlight />
                            <FeatureItem text="Ferramentas de IA (Feedback em Tempo Real)" highlight />
                            <FeatureItem text="Estatísticas Avançadas" />
                            <FeatureItem text="Sem Anúncios" />
                            <FeatureItem text="Suporte Prioritário" />
                        </ul>
                        <Button
                            onClick={() => handleSubscribe('pro')}
                            disabled={currentPlan !== 'free'}
                            className="w-full bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg h-12"
                        >
                            {currentPlan === 'pro' ? 'Plano Ativo' : 'Assinar Agora'}
                        </Button>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-yellow-500/30 flex flex-col relative overflow-hidden">
                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-yellow-500">Lifetime</h3>
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="text-4xl font-bold mt-2">R$ 497,00</div>
                            <p className="text-gray-400 mt-2">Pagamento único. Acesso vitalício.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Tudo do Plano Pro" />
                            <FeatureItem text="Acesso Vitalício" highlight />
                            <FeatureItem text="Badge Exclusiva 'Founder'" />
                            <FeatureItem text="Acesso Antecipado a Novas Features" />
                        </ul>
                        <Button
                            onClick={() => handleSubscribe('lifetime')}
                            disabled={currentPlan === 'lifetime'}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold"
                        >
                            {currentPlan === 'lifetime' ? 'Comprado' : 'Comprar Vitalício'}
                        </Button>
                    </div>
                </div>

                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>Pagamento processado seguramente. Garantia de 7 dias ou seu dinheiro de volta.</p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text, highlight = false }: { text: string, highlight?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            <div className={`rounded-full p-1 ${highlight ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                <Check className="w-4 h-4" />
            </div>
            <span className={highlight ? 'text-white font-medium' : 'text-gray-300'}>{text}</span>
        </li>
    );
}
