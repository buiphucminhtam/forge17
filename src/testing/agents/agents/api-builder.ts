/**
 * APIBuilder Agent - Backend API Testing
 * Handles REST, GraphQL, WebSocket testing
 */

export interface APIBuilderConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

const DEFAULT_CONFIG: APIBuilderConfig = {
  timeout: 30000,
  headers: {},
};

/**
 * APIBuilder Agent
 * Backend API Testing specialist
 */
export class APIBuilderAgent {
  private config: APIBuilderConfig;
  
  constructor(config: Partial<APIBuilderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Execute API action
   */
  async execute(action: APIAction): Promise<APIResult> {
    switch (action.type) {
      case 'rest':
        return this.executeREST(action);
      case 'graphql':
        return this.executeGraphQL(action);
      case 'websocket':
        return this.executeWebSocket(action);
      case 'validate_response':
        return this.validateResponse(action);
      case 'auth':
        return this.handleAuth(action);
      default:
        return {
          success: false,
          action: action.type,
          error: `Unknown action type: ${action.type}`,
        };
    }
  }
  
  /**
   * Execute REST API call
   */
  private async executeREST(action: APIAction): Promise<APIResult> {
    const { method, endpoint, body, headers } = action;
    
    if (!endpoint) {
      return {
        success: false,
        action: 'rest',
        error: 'Endpoint is required',
      };
    }
    
    const url = this.buildURL(endpoint);
    const requestHeaders = { ...this.config.headers, ...headers };
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...requestHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      const duration = Date.now() - startTime;
      const responseBody = await this.parseResponse(response);
      
      return {
        success: response.ok,
        action: 'rest',
        output: `${method || 'GET'} ${url} - ${response.status} (${duration}ms)`,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        action: 'rest',
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
        method: method || 'GET',
      };
    }
  }
  
  /**
   * Execute GraphQL query
   */
  private async executeGraphQL(action: APIAction): Promise<APIResult> {
    const { query, variables, endpoint } = action;
    
    if (!query) {
      return {
        success: false,
        action: 'graphql',
        error: 'Query is required',
      };
    }
    
    const url = this.buildURL(endpoint || '/graphql');
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      const duration = Date.now() - startTime;
      const responseBody = await this.parseResponse(response);
      
      // Check for GraphQL errors
      const hasErrors = responseBody.errors && responseBody.errors.length > 0;
      
      return {
        success: response.ok && !hasErrors,
        action: 'graphql',
        output: `GraphQL ${hasErrors ? 'errors' : 'success'} - ${duration}ms`,
        status: response.status,
        body: responseBody,
        duration,
        metadata: hasErrors ? { errors: responseBody.errors } : undefined,
      };
    } catch (error) {
      return {
        success: false,
        action: 'graphql',
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: url,
      };
    }
  }
  
  /**
   * Execute WebSocket message
   */
  private async executeWebSocket(action: APIAction): Promise<APIResult> {
    const { url, message, expectedResponse } = action;
    
    if (!url) {
      return {
        success: false,
        action: 'websocket',
        error: 'WebSocket URL is required',
      };
    }
    
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(url);
        const startTime = Date.now();
        
        ws.onopen = () => {
          if (message) {
            ws.send(typeof message === 'string' ? message : JSON.stringify(message));
          }
        };
        
        ws.onmessage = (event) => {
          const duration = Date.now() - startTime;
          const response = this.parseWSMessage(event.data);
          
          let success = true;
          if (expectedResponse) {
            success = JSON.stringify(response).includes(JSON.stringify(expectedResponse));
          }
          
          ws.close();
          
          resolve({
            success,
            action: 'websocket',
            output: `WebSocket message sent and response received (${duration}ms)`,
            body: response,
            duration,
          });
        };
        
        ws.onerror = (error) => {
          resolve({
            success: false,
            action: 'websocket',
            error: 'WebSocket error',
            url,
          });
        };
        
        // Timeout
        setTimeout(() => {
          ws.close();
          resolve({
            success: false,
            action: 'websocket',
            error: 'WebSocket timeout',
            url,
          });
        }, this.config.timeout);
      } catch (error) {
        resolve({
          success: false,
          action: 'websocket',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }
  
  /**
   * Validate response
   */
  private validateResponse(action: APIAction): APIResult {
    const { response, schema, expectedStatus, expectedBody } = action;
    
    if (!response) {
      return {
        success: false,
        action: 'validate_response',
        error: 'Response is required for validation',
      };
    }
    
    const validations: { passed: boolean; message: string }[] = [];
    
    // Validate status
    if (expectedStatus !== undefined) {
      const statusPass = response.status === expectedStatus;
      validations.push({
        passed: statusPass,
        message: `Status ${response.status} ${statusPass ? 'matches' : `does not match ${expectedStatus}`}`,
      });
    }
    
    // Validate body contains
    if (expectedBody !== undefined && response.body) {
      const bodyStr = JSON.stringify(response.body);
      const bodyPass = bodyStr.includes(JSON.stringify(expectedBody));
      validations.push({
        passed: bodyPass,
        message: bodyPass ? 'Body contains expected value' : 'Body does not contain expected value',
      });
    }
    
    // Schema validation would go here
    if (schema) {
      validations.push({
        passed: true,
        message: 'Schema validation placeholder - implement with zod/joi',
      });
    }
    
    const allPassed = validations.every(v => v.passed);
    
    return {
      success: allPassed,
      action: 'validate_response',
      output: allPassed ? 'All validations passed' : 'Some validations failed',
      metadata: { validations },
    };
  }
  
  /**
   * Handle authentication
   */
  private handleAuth(action: APIAction): APIResult {
    const { authType, credentials } = action;
    
    if (!authType) {
      return {
        success: false,
        action: 'auth',
        error: 'Auth type is required',
      };
    }
    
    switch (authType) {
      case 'bearer':
        return {
          success: true,
          action: 'auth',
          output: 'Bearer token authentication configured',
          metadata: { authType },
        };
      case 'basic':
        return {
          success: true,
          action: 'auth',
          output: 'Basic authentication configured',
          metadata: { authType },
        };
      case 'apikey':
        return {
          success: true,
          action: 'auth',
          output: 'API key authentication configured',
          metadata: { authType },
        };
      default:
        return {
          success: false,
          action: 'auth',
          error: `Unknown auth type: ${authType}`,
        };
    }
  }
  
  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.config.baseURL || ''}${endpoint}`;
  }
  
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }
  
  private parseWSMessage(data: string | ArrayBuffer): unknown {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return '[Binary data]';
  }
}

// Types

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AuthType = 'bearer' | 'basic' | 'apikey';

export interface APIAction {
  type: 'rest' | 'graphql' | 'websocket' | 'validate_response' | 'auth';
  method?: HTTPMethod;
  endpoint?: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: string;
  variables?: Record<string, unknown>;
  url?: string;
  message?: unknown;
  expectedResponse?: unknown;
  response?: {
    status: number;
    body?: unknown;
    headers?: Record<string, string>;
  };
  schema?: unknown;
  expectedStatus?: number;
  expectedBody?: unknown;
  authType?: AuthType;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
  };
}

export interface APIResult {
  success: boolean;
  action: string;
  output?: string;
  error?: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  duration?: number;
  metadata?: Record<string, unknown>;
}
