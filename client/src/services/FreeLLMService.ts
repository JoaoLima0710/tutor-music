/**
 * Free LLM Service - Integração com LLMs Gratuitos
 * Suporta múltiplos provedores gratuitos para tutoria musical
 */

export type FreeLLMProvider = 'groq' | 'huggingface' | 'gemini' | 'ollama' | 'simulated';

export interface FreeLLMConfig {
  provider: FreeLLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string; // Para Ollama local
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: FreeLLMProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

class FreeLLMService {
  private defaultConfig: FreeLLMConfig = {
    provider: 'groq', // Padrão: Groq (mais rápido e gratuito)
    temperature: 0.7,
    maxTokens: 2000,
  };

  private config: FreeLLMConfig;

  constructor() {
    // Carregar configuração do localStorage
    const savedConfig = localStorage.getItem('musictutor_llm_config');
    if (savedConfig) {
      try {
        this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
      } catch {
        this.config = { ...this.defaultConfig };
      }
    } else {
      this.config = { ...this.defaultConfig };
    }
  }

  /**
   * Atualiza configuração do LLM
   */
  updateConfig(config: Partial<FreeLLMConfig>): void {
    this.config = { ...this.config, ...config };
    localStorage.setItem('musictutor_llm_config', JSON.stringify(this.config));
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): FreeLLMConfig {
    return { ...this.config };
  }

  /**
   * Chama o LLM com fallback automático entre provedores
   */
  async callLLM(
    messages: LLMMessage[],
    options?: Partial<FreeLLMConfig>
  ): Promise<LLMResponse> {
    const config = { ...this.config, ...options };
    const providers: FreeLLMProvider[] = [
      config.provider,
      'groq',
      'huggingface',
      'gemini',
      'simulated' // Sempre disponível como último recurso
    ].filter((p, i, arr) => arr.indexOf(p) === i) as FreeLLMProvider[]; // Remove duplicatas

    // Tentar cada provedor em ordem
    for (const provider of providers) {
      try {
        const response = await this.callProvider(provider, messages, config);
        if (response && !response.error) {
          return response;
        }
      } catch (error) {
        console.warn(`❌ Erro com provedor ${provider}:`, error);
        continue; // Tentar próximo provedor
      }
    }

    // Se todos falharam, retornar resposta simulada
    return this.simulateResponse(messages);
  }

  /**
   * Chama um provedor específico
   */
  private async callProvider(
    provider: FreeLLMProvider,
    messages: LLMMessage[],
    config: FreeLLMConfig
  ): Promise<LLMResponse> {
    switch (provider) {
      case 'groq':
        return this.callGroq(messages, config);
      case 'huggingface':
        return this.callHuggingFace(messages, config);
      case 'gemini':
        return this.callGemini(messages, config);
      case 'ollama':
        return this.callOllama(messages, config);
      case 'simulated':
        return this.simulateResponse(messages);
      default:
        throw new Error(`Provedor não suportado: ${provider}`);
    }
  }

  /**
   * Groq API - Gratuito, muito rápido
   * https://console.groq.com/
   */
  private async callGroq(
    messages: LLMMessage[],
    config: FreeLLMConfig
  ): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Groq API key não configurada');
    }

    const model = config.model || 'llama-3.1-8b-instant'; // Modelo gratuito rápido

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'groq',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
    };
  }

  /**
   * Hugging Face Inference API - Gratuito
   * https://huggingface.co/inference-api
   */
  private async callHuggingFace(
    messages: LLMMessage[],
    config: FreeLLMConfig
  ): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_HUGGINGFACE_API_KEY;
    const model = config.model || 'microsoft/DialoGPT-medium'; // Modelo conversacional

    // Hugging Face usa formato diferente - converter mensagens
    const prompt = messages
      .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
      .join('\n') + '\nAssistente:';

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: config.maxTokens || 2000,
            temperature: config.temperature || 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const data = await response.json();
    const content = Array.isArray(data) 
      ? data[0]?.generated_text || ''
      : data.generated_text || '';

    return {
      content: content.trim(),
      provider: 'huggingface',
    };
  }

  /**
   * Google Gemini API - Gratuito
   * https://makersuite.google.com/app/apikey
   */
  private async callGemini(
    messages: LLMMessage[],
    config: FreeLLMConfig
  ): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key não configurada');
    }

    const model = config.model || 'gemini-pro';

    // Converter mensagens para formato Gemini
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: config.temperature || 0.7,
            maxOutputTokens: config.maxTokens || 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      provider: 'gemini',
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined,
    };
  }

  /**
   * Ollama - Local, totalmente gratuito
   * Requer Ollama instalado localmente: https://ollama.ai/
   */
  private async callOllama(
    messages: LLMMessage[],
    config: FreeLLMConfig
  ): Promise<LLMResponse> {
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    const model = config.model || 'llama2'; // Modelo padrão do Ollama

    // Converter mensagens para formato Ollama
    const prompt = messages
      .map(m => {
        if (m.role === 'system') {
          return `System: ${m.content}`;
        }
        return `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`;
      })
      .join('\n') + '\nAssistant:';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: config.temperature || 0.7,
          num_predict: config.maxTokens || 2000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.response || '',
      provider: 'ollama',
    };
  }

  /**
   * Resposta simulada (fallback quando nenhum provedor está disponível)
   */
  private simulateResponse(messages: LLMMessage[]): LLMResponse {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const message = userMessage.toLowerCase();

    let response = '';

    if (message.includes('dificuldade') || message.includes('difícil') || message.includes('não consigo')) {
      response = "Entendo que está enfrentando alguns desafios! Isso é completamente normal. Vamos trabalhar nisso juntos.\n\nQue tipo de dificuldade você está tendo? É com acordes específicos, ritmo, técnica, ou algo mais?";
    } else if (message.includes('progresso') || message.includes('melhorando')) {
      response = "Que ótimo ouvir isso! 🎉 Seu progresso mostra que você está no caminho certo. O que você percebe que melhorou mais recentemente?";
    } else if (message.includes('motivação') || message.includes('desanimado')) {
      response = "Motivação é como um músculo - precisa ser exercitada regularmente! 💪 O que costuma te motivar mais?";
    } else if (message.includes('prática') || message.includes('treino')) {
      response = "Prática consistente é a chave! 🔑 Quantos dias por semana você consegue praticar? O ideal é pouco e frequente.";
    } else {
      response = "Olá! 👋 É ótimo ter você aqui praticando música. Como está se sentindo hoje? Em que posso te ajudar?";
    }

    return {
      content: response,
      provider: 'simulated',
    };
  }

  /**
   * Testa conexão com um provedor
   */
  async testProvider(provider: FreeLLMProvider, config?: Partial<FreeLLMConfig>): Promise<boolean> {
    try {
      const testMessages: LLMMessage[] = [
        { role: 'system', content: 'Você é um tutor de música.' },
        { role: 'user', content: 'Olá!' },
      ];
      
      const response = await this.callProvider(provider, testMessages, {
        ...this.config,
        ...config,
        provider,
      });

      return !!response.content && !response.error;
    } catch {
      return false;
    }
  }

  /**
   * Lista provedores disponíveis (com base em configuração)
   */
  getAvailableProviders(): Array<{ provider: FreeLLMProvider; available: boolean; name: string }> {
    return [
      { provider: 'groq', available: !!(this.config.apiKey || import.meta.env.VITE_GROQ_API_KEY), name: 'Groq (Rápido)' },
      { provider: 'huggingface', available: true, name: 'Hugging Face (Gratuito)' },
      { provider: 'gemini', available: !!(this.config.apiKey || import.meta.env.VITE_GEMINI_API_KEY), name: 'Google Gemini' },
      { provider: 'ollama', available: true, name: 'Ollama (Local)' },
      { provider: 'simulated', available: true, name: 'Simulado (Fallback)' },
    ];
  }
}

export const freeLLMService = new FreeLLMService();
