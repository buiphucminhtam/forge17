/**
 * LLM Provider Configuration
 * Multi-provider support: OpenAI, Anthropic, Gemini, Ollama, MiniMax
 */

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'minimax';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseURL: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: LLMProvider;
}

// Provider endpoints
export const PROVIDER_ENDPOINTS: Record<LLMProvider, { baseURL: string; endpoint: string }> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    endpoint: '/messages',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    endpoint: '/models',
  },
  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api',
    endpoint: '/generate',
  },
  minimax: {
    baseURL: 'https://api.minimax.io',
    endpoint: '/v1/text/chatcompletion_v2',
  },
};

// Model availability by provider
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-haiku-latest'],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  ollama: ['llama3.2', 'llama3.2:1b', 'qwen2.5-coder-7b', 'codellama', 'mistral'],
  minimax: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.1', 'MiniMax-M2', 'MiniMax-Text-01'],
};

// Default models per provider
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-latest',
  gemini: 'gemini-2.0-flash',
  ollama: 'llama3.2',
  minimax: 'MiniMax-M2.7',
};

// Context windows by model
export const CONTEXT_WINDOWS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'claude-3-5-sonnet-latest': 200000,
  'claude-3-opus-latest': 200000,
  'claude-3-haiku-latest': 200000,
  'gemini-2.0-flash': 1000000,
  'gemini-2.0-flash-exp': 1000000,
  'gemini-1.5-pro': 2000000,
  'gemini-1.5-flash': 1000000,
  'MiniMax-M2.7': 204800,
  'MiniMax-M2.7-highspeed': 204800,
  'MiniMax-M2.5': 204800,
  'MiniMax-M2.1': 204800,
  'MiniMax-M2': 204800,
  'MiniMax-Text-01': 1000000,  // 456B params, very long context
};

/**
 * Get LLM configuration for a provider
 */
export function getLLMConfig(provider: LLMProvider, customConfig?: Partial<LLMConfig>): LLMConfig {
  const apiKey = customConfig?.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`] || '';
  
  return {
    provider,
    apiKey,
    baseURL: customConfig?.baseURL || PROVIDER_ENDPOINTS[provider].baseURL,
    model: customConfig?.model || DEFAULT_MODELS[provider],
    maxTokens: customConfig?.maxTokens || 4096,
    temperature: customConfig?.temperature || 0.7,
  };
}

/**
 * Call LLM with specified provider
 */
export async function callLLM(config: LLMConfig, prompt: string): Promise<LLMResponse> {
  const { provider, apiKey, baseURL, model, maxTokens, temperature } = config;
  
  let endpoint = PROVIDER_ENDPOINTS[provider].endpoint;
  
  // Build request based on provider
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  let body: Record<string, unknown>;
  
  switch (provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      };
      break;
      
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      endpoint = PROVIDER_ENDPOINTS[provider].endpoint;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 1024,
        temperature,
      };
      break;
      
    case 'gemini':
      endpoint = `${endpoint}/${model}:generateContent?key=${apiKey}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      };
      break;
      
    case 'ollama':
      body = {
        model,
        prompt,
        stream: false,
        options: { temperature, num_predict: maxTokens },
      };
      break;
      
    case 'minimax':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      };
      break;
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Parse response based on provider format
  let content: string;
  
  switch (provider) {
    case 'openai':
    case 'minimax':
      content = data.choices?.[0]?.message?.content || '';
      break;
    case 'anthropic':
      content = data.content?.[0]?.text || '';
      break;
    case 'gemini':
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      break;
    case 'ollama':
      content = data.response || '';
      break;
    default:
      content = '';
  }
  
  return {
    content,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined,
    model,
    provider,
  };
}
