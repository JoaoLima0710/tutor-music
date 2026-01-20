import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f0f1a] p-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse blur-xl" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-7xl font-black text-white mb-2">404</h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Página não encontrada
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
          Desculpe, a página que você está procurando não existe ou foi movida.
          Verifique o endereço ou volte para a página inicial.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] hover:from-[#9333ea] hover:to-[#7c3aed] text-white px-6"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>
        </div>
      </div>
    </div>
  );
}
