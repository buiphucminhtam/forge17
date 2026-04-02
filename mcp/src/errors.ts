// ─── Error Codes ──────────────────────────────────────────────────────

export enum ErrorCode {
  // State errors (FW0xx)
  STATE_FILE_NOT_FOUND = 'FW001',
  STATE_PARSE_ERROR = 'FW002',
  STATE_SAVE_ERROR = 'FW003',
  STATE_INVALID = 'FW004',

  // Pipeline errors (FW2xx)
  PIPELINE_NOT_INITIALIZED = 'FW201',
  PIPELINE_ALREADY_RUNNING = 'FW202',
  PIPELINE_COMPLETED = 'FW203',
  PIPELINE_INVALID_MODE = 'FW205',

  // Tool errors (FW3xx)
  TOOL_NOT_FOUND = 'FW301',
  TOOL_EXECUTION_ERROR = 'FW302',

  // Skill errors (FW4xx)
  SKILL_NOT_FOUND = 'FW401',
  SKILL_YAML_PARSE_ERROR = 'FW405',
  SKILL_PARSE_ERROR = 'FW406',

  // MCP errors (FW5xx)
  MCP_SERVER_ERROR = 'FW501',

  // Workspace errors (FW6xx)
  WORKSPACE_NOT_FOUND = 'FW601',
}

// ─── Base Error ───────────────────────────────────────────────────────

export interface ErrorContext {
  [key: string]: unknown;
}

export class ForgewrightError extends Error {
  public readonly code: ErrorCode;
  public readonly recoverable: boolean;
  public readonly context: ErrorContext;

  constructor(code: ErrorCode, message: string, context: ErrorContext = {}, recoverable = true) {
    super(message);
    this.name = 'ForgewrightError';
    this.code = code;
    this.recoverable = recoverable;
    this.context = context;
  }

  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }

  override toString(): string {
    const ctx = Object.keys(this.context).length > 0 ? ` (${JSON.stringify(this.context)})` : '';
    return `[${this.code}] ${this.message}${ctx}`;
  }
}

// ─── Specialized Errors ──────────────────────────────────────────────

export class StateError extends ForgewrightError {
  constructor(code: ErrorCode, message: string, context: ErrorContext = {}, recoverable = true) {
    super(code, message, context, recoverable);
    this.name = 'StateError';
  }
}

export class PipelineError extends ForgewrightError {
  constructor(code: ErrorCode, message: string, context: ErrorContext = {}, recoverable = false) {
    super(code, message, context, recoverable);
    this.name = 'PipelineError';
  }
}

export class ToolError extends ForgewrightError {
  constructor(code: ErrorCode, message: string, context: ErrorContext = {}, recoverable = false) {
    super(code, message, context, recoverable);
    this.name = 'ToolError';
  }
}

export class SkillError extends ForgewrightError {
  constructor(code: ErrorCode, message: string, context: ErrorContext = {}, recoverable = true) {
    super(code, message, context, recoverable);
    this.name = 'SkillError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function isForgewrightError(value: unknown): value is ForgewrightError {
  return value instanceof ForgewrightError;
}

export function getErrorMessage(error: unknown): string {
  if (isForgewrightError(error)) {
    return error.toString();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
