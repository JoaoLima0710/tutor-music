import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPWA } from '@/components/InstallPWA';
import { UpdateBanner } from '@/components/UpdateBanner';
import { usePWA } from '@/hooks/usePWA';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import { FloatingActionButton } from "./components/layout/FloatingActionButton";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.default })));
const Chords = lazy(() => import("./pages/Chords").then(m => ({ default: m.default })));
const Scales = lazy(() => import("./pages/Scales").then(m => ({ default: m.default })));
const Missions = lazy(() => import("./pages/Missions").then(m => ({ default: m.default })));
const Achievements = lazy(() => import("./pages/Achievements").then(m => ({ default: m.default })));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.default })));
const Tuner = lazy(() => import("./pages/Tuner").then(m => ({ default: m.default })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.default })));
const Songs = lazy(() => import("./pages/Songs").then(m => ({ default: m.default })));
const SongDetail = lazy(() => import("./pages/SongDetail").then(m => ({ default: m.default })));
const Practice = lazy(() => import("./pages/Practice").then(m => ({ default: m.default })));
const ChordPractice = lazy(() => import("./pages/ChordPractice").then(m => ({ default: m.ChordPractice })));
const Theory = lazy(() => import("./pages/Theory").then(m => ({ default: m.default })));
const Explore = lazy(() => import("./pages/Explore").then(m => ({ default: m.default })));
const TrainingDashboard = lazy(() => import("./pages/TrainingDashboard").then(m => ({ default: m.TrainingDashboard })));
const Auth = lazy(() => import("./pages/Auth").then(m => ({ default: m.default })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.default })));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, refreshUser } = useUserStore();

  useEffect(() => {
    // Verificar autenticação ao carregar
    refreshUser();
  }, [refreshUser]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/" component={Home} />
        <Route path="/chords" component={Chords} />
        <Route path="/scales" component={Scales} />
        <Route path="/missions" component={Missions} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/profile" component={Profile} />
        <Route path="/tuner" component={Tuner} />
        <Route path="/settings" component={Settings} />
        <Route path="/songs" component={Songs} />
        <Route path="/song/:id" component={SongDetail} />
        <Route path="/practice" component={Practice} />
        <Route path="/chord-practice/:chord" component={ChordPractice} />
        <Route path="/theory" component={Theory} />
        <Route path="/explore" component={Explore} />
        <Route path="/training" component={TrainingDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { isInstalled } = usePWA();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <UpdateBanner />
            <Router />
            <FloatingActionButton />
            <InstallPWA />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;