/**
 * AI Provider Abstraction
 * Supports: Anthropic, OpenAI, Gemini, Groq, OpenRouter
 * Switch via AI_PROVIDER environment variable
 */

export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'openrouter';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
  tokensUsed: number;
  provider: AIProvider;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// Provider implementations
abstract class AIProviderClient {
  abstract generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse>;
  abstract getName(): AIProvider;
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider extends AIProviderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: config?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: config?.maxTokens || 2048,
        temperature: config?.temperature ?? 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    return {
      text,
      model: data.model,
      tokensUsed,
      provider: 'anthropic',
    };
  }

  getName(): AIProvider {
    return 'anthropic';
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends AIProviderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config?.model || 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config?.maxTokens || 2048,
        temperature: config?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      model: data.model,
      tokensUsed,
      provider: 'openai',
    };
  }

  getName(): AIProvider {
    return 'openai';
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider extends AIProviderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse> {
    const model = config?.model || 'gemini-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: config?.maxTokens || 2048,
          temperature: config?.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      text,
      model: model,
      tokensUsed,
      provider: 'gemini',
    };
  }

  getName(): AIProvider {
    return 'gemini';
  }
}

/**
 * Groq Provider (Fast inference)
 */
class GroqProvider extends AIProviderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config?.model || 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config?.maxTokens || 2048,
        temperature: config?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      model: data.model,
      tokensUsed,
      provider: 'groq',
    };
  }

  getName(): AIProvider {
    return 'groq';
  }
}

/**
 * OpenRouter Provider (Multi-model routing)
 */
class OpenRouterProvider extends AIProviderClient {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, config?: Partial<AIConfig>): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: config?.model || 'anthropic/claude-3-opus',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config?.maxTokens || 2048,
        temperature: config?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      model: data.model,
      tokensUsed,
      provider: 'openrouter',
    };
  }

  getName(): AIProvider {
    return 'openrouter';
  }
}

/**
 * Factory to get the configured AI provider
 */
export function getAIProvider(): AIProviderClient {
  const provider = (process.env.AI_PROVIDER || 'anthropic') as AIProvider;
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error(`AI_API_KEY environment variable is required for ${provider}`);
  }

  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'gemini':
      return new GeminiProvider(apiKey);
    case 'groq':
      return new GroqProvider(apiKey);
    case 'openrouter':
      return new OpenRouterProvider(apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Generate text using the configured AI provider
 */
export async function generateWithAI(
  prompt: string,
  config?: Partial<AIConfig>
): Promise<AIResponse> {
  const provider = getAIProvider();
  return provider.generateText(prompt, config);
}
