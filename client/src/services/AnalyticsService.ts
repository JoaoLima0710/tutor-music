
// Definição dos tipos de eventos para type-safety
export type AnalyticEventType =
    | 'app_opened'
    | 'signup'
    | 'login'
    | 'lesson_started'
    | 'lesson_completed'
    | 'exercise_completed'
    | 'level_up'
    | 'badge_unlocked'
    | 'onboarding_started'
    | 'onboarding_completed'
    | 'error_occurred';

interface AnalyticsProvider {
    init: () => void;
    track: (event: AnalyticEventType, properties?: Record<string, any>) => void;
    identify: (userId: string, traits?: Record<string, any>) => void;
}

// Provider de Console para desenvolvimento (ou fallback)
class ConsoleProvider implements AnalyticsProvider {
    init() {
        console.log('[Analytics] Initialized Console Provider');
    }

    track(event: AnalyticEventType, properties?: Record<string, any>) {
        console.groupCollapsed(`[Analytics] Track: ${event}`);
        console.log('Properties:', properties);
        console.groupEnd();
    }

    identify(userId: string, traits?: Record<string, any>) {
        console.log(`[Analytics] Identify User: ${userId}`, traits);
    }
}

// Classe principal do serviço
class AnalyticsService {
    private provider: AnalyticsProvider;
    private isInitialized = false;

    constructor(provider: AnalyticsProvider) {
        this.provider = provider;
    }

    init() {
        if (!this.isInitialized) {
            this.provider.init();
            this.isInitialized = true;
            this.track('app_opened', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        }
    }

    track(event: AnalyticEventType, properties: Record<string, any> = {}) {
        if (!this.isInitialized) {
            console.warn('[Analytics] Service not initialized. Call init() first.');
            return;
        }
        this.provider.track(event, { ...properties, timestamp: new Date().toISOString() });
    }

    identify(userId: string, traits: Record<string, any> = {}) {
        if (!this.isInitialized) return;
        this.provider.identify(userId, traits);
    }
}

// Instância singleton exportada
// No futuro, podemos trocar ConsoleProvider por PostHogProvider
export const analyticsService = new AnalyticsService(new ConsoleProvider());
