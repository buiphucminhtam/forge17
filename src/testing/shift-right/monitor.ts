/**
 * Shift-Right Integration
 * Production intelligence for autonomous testing
 * 
 * Sources:
 * - Sentry: Error tracking + stack traces
 * - LogRocket: Session replays + user flows
 * - Datadog: APM + metrics + logs
 * - Crash reporting: Mobile + web crashes
 * - Analytics: User behavior + conversion
 */

export interface ProductionSource {
  type: 'sentry' | 'logrocket' | 'datadog' | 'crashlytics' | 'analytics';
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface ProductionAlert {
  source: ProductionSource['type'];
  type: 'error' | 'performance' | 'crash' | 'regression';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  count: number;
  timestamp: number;
  url?: string;
  stackTrace?: string;
  affectedUsers?: number;
  metadata?: Record<string, unknown>;
}

export interface UserFlow {
  id: string;
  name: string;
  steps: string[];
  conversionRate: number;
  dropOffRate: number;
  avgDuration: number;
  errorRate: number;
}

export interface ShiftRightConfig {
  sources: ProductionSource[];
  syncIntervalMs: number;
  alertThreshold: number;
  autoGenerateTests: boolean;
}

/**
 * Shift-Right Monitor
 * Monitors production and generates test insights
 */
export class ShiftRightMonitor {
  private config: ShiftRightConfig;
  private alerts: ProductionAlert[] = [];
  private lastSync: number = 0;
  
  constructor(config: Partial<ShiftRightConfig> = {}) {
    this.config = {
      sources: [
        { type: 'sentry', name: 'Sentry', enabled: true },
        { type: 'logrocket', name: 'LogRocket', enabled: false },
        { type: 'datadog', name: 'Datadog', enabled: false },
        { type: 'crashlytics', name: 'Crashlytics', enabled: false },
        { type: 'analytics', name: 'Analytics', enabled: false },
      ],
      syncIntervalMs: 60000,  // 1 minute
      alertThreshold: 0.7,
      autoGenerateTests: true,
      ...config,
    };
  }
  
  /**
   * Sync production data from all sources
   */
  async sync(): Promise<void> {
    const promises = this.config.sources
      .filter(s => s.enabled)
      .map(source => this.fetchFromSource(source));
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to sync from ${this.config.sources[index].name}:`, result.reason);
      }
    });
    
    this.lastSync = Date.now();
  }
  
  /**
   * Fetch data from a production source
   */
  private async fetchFromSource(source: ProductionSource): Promise<ProductionAlert[]> {
    switch (source.type) {
      case 'sentry':
        return this.fetchSentry(source);
      case 'logrocket':
        return this.fetchLogRocket(source);
      case 'datadog':
        return this.fetchDatadog(source);
      case 'crashlytics':
        return this.fetchCrashlytics(source);
      case 'analytics':
        return this.fetchAnalytics(source);
      default:
        return [];
    }
  }
  
  private async fetchSentry(source: ProductionSource): Promise<ProductionAlert[]> {
    const apiKey = process.env.SENTRY_API_KEY;
    const orgSlug = process.env.SENTRY_ORG_SLUG;
    
    if (!apiKey || !orgSlug) {
      return [];
    }
    
    try {
      const response = await fetch(
        `https://sentry.io/api/0/organizations/${orgSlug}/issues/?statsPeriod=1h`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      if (!response.ok) return [];
      
      const issues = await response.json();
      
      return issues.map((issue: Record<string, unknown>) => ({
        source: 'sentry' as const,
        type: 'error' as const,
        severity: this.mapSentrySeverity(issue.level as string),
        message: issue.title as string,
        count: issue.count as number,
        timestamp: Date.now(),
        url: issue.permalink as string,
        stackTrace: (issue.entries as Array<{data?: {values?: Array<{stacktrace?: {frames?: Array<{filename?: string; function?: string}>}>}}>}>)?
          .find(e => e.type === 'stacktrace')?.data?.values?.[0]?.stacktrace?.frames?.[0] ? 'available' : undefined,
        metadata: {
          issueId: issue.id,
          culprit: issue.culprit,
        },
      }));
    } catch (error) {
      console.error('Sentry fetch error:', error);
      return [];
    }
  }
  
  private mapSentrySeverity(level: string): ProductionAlert['severity'] {
    const mapping: Record<string, ProductionAlert['severity']> = {
      fatal: 'critical',
      error: 'high',
      warning: 'medium',
      info: 'low',
    };
    return mapping[level] || 'medium';
  }
  
  private async fetchLogRocket(source: ProductionSource): Promise<ProductionAlert[]> {
    // LogRocket API integration
    const apiKey = process.env.LOGROCKET_API_KEY;
    
    if (!apiKey) return [];
    
    try {
      const response = await fetch('https://api.logrocket.com/v1/sessions', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      
      if (!response.ok) return [];
      
      const sessions = await response.json();
      
      // Find sessions with errors
      return sessions
        .filter((session: Record<string, unknown>) => session.errors)
        .map((session: Record<string, unknown>) => ({
          source: 'logrocket' as const,
          type: 'error' as const,
          severity: 'high' as const,
          message: `Session error: ${session.errors?.length || 0} errors`,
          count: session.errors?.length || 0,
          timestamp: session.createdAt as number,
          url: session.url as string,
          metadata: {
            sessionId: session.id,
            userId: session.userId,
          },
        }));
    } catch (error) {
      console.error('LogRocket fetch error:', error);
      return [];
    }
  }
  
  private async fetchDatadog(source: ProductionSource): Promise<ProductionAlert[]> {
    // Datadog API integration
    const apiKey = process.env.DATADOG_API_KEY;
    const appKey = process.env.DATADOG_APP_KEY;
    
    if (!apiKey || !appKey) return [];
    
    try {
      // Query for errors in the last hour
      const response = await fetch(
        'https://api.datadoghq.com/api/v1/query?from=' + (Math.floor(Date.now() / 1000) - 3600),
        {
          headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
          },
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      // Parse metric data
      return data.series
        ?.filter((s: Record<string, unknown>) => String(s.metric).includes('error'))
        .map((s: Record<string, unknown>) => ({
          source: 'datadog' as const,
          type: 'error' as const,
          severity: 'high' as const,
          message: `Metric spike: ${s.metric}`,
          count: (s.pointlist as Array<[number, number]>)?.[0]?.[1] || 0,
          timestamp: Date.now(),
        })) || [];
    } catch (error) {
      console.error('Datadog fetch error:', error);
      return [];
    }
  }
  
  private async fetchCrashlytics(source: ProductionSource): Promise<ProductionAlert[]> {
    // Firebase Crashlytics integration
    return [];
  }
  
  private async fetchAnalytics(source: ProductionSource): Promise<ProductionAlert[]> {
    // Analytics platform integration
    return [];
  }
  
  /**
   * Get recent alerts
   */
  getAlerts(options?: {
    since?: number;
    severity?: ProductionAlert['severity'];
    type?: ProductionAlert['type'];
  }): ProductionAlert[] {
    let filtered = this.alerts;
    
    if (options?.since) {
      filtered = filtered.filter(a => a.timestamp >= options.since!);
    }
    
    if (options?.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }
    
    if (options?.type) {
      filtered = filtered.filter(a => a.type === options.type);
    }
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Generate test cases from production alerts
   */
  generateTestCases(alert: ProductionAlert): TestCaseTemplate {
    return {
      name: `Production regression: ${alert.message.slice(0, 50)}`,
      type: alert.type === 'error' ? 'e2e' : alert.type === 'performance' ? 'load' : 'unit',
      priority: this.severityToPriority(alert.severity),
      steps: this.generateStepsFromAlert(alert),
      expectedResult: 'Test passes without errors',
      productionSource: alert.source,
    };
  }
  
  private severityToPriority(severity: ProductionAlert['severity']): 'critical' | 'high' | 'medium' | 'low' {
    const mapping: Record<ProductionAlert['severity'], 'critical' | 'high' | 'medium' | 'low'> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };
    return mapping[severity];
  }
  
  private generateStepsFromAlert(alert: ProductionAlert): string[] {
    const steps: string[] = [];
    
    if (alert.url) {
      steps.push(`1. Navigate to: ${alert.url}`);
    }
    
    steps.push('2. Perform the action that triggered the error');
    steps.push('3. Verify no errors in console');
    steps.push('4. Verify error rate remains stable');
    
    return steps;
  }
  
  /**
   * Get monitor status
   */
  getStatus(): {
    lastSync: number;
    sourcesCount: number;
    enabledSourcesCount: number;
    alertsCount: number;
  } {
    return {
      lastSync: this.lastSync,
      sourcesCount: this.config.sources.length,
      enabledSourcesCount: this.config.sources.filter(s => s.enabled).length,
      alertsCount: this.alerts.length,
    };
  }
}

export interface TestCaseTemplate {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'visual' | 'load' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: string[];
  expectedResult: string;
  productionSource?: ProductionSource['type'];
}
