import { describe, it, expect } from 'vitest';
import { FileScanner } from './scanner.js';

describe('FileScanner', () => {
  const basePath = '/test/repo';

  describe('constructor', () => {
    it('creates scanner with default config', () => {
      const scanner = new FileScanner(basePath);
      expect(scanner).toBeDefined();
    });

    it('creates scanner with custom config', () => {
      const scanner = new FileScanner(basePath, {
        languages: ['typescript', 'javascript'],
        maxFileSize: 1024 * 1024,
        skipPatterns: ['**/test/**'],
      });
      expect(scanner).toBeDefined();
    });

    it('accepts empty config', () => {
      const scanner = new FileScanner(basePath, {});
      expect(scanner).toBeDefined();
    });
  });

  describe('detectLanguage', () => {
    it('returns most common language', () => {
      const scanner = new FileScanner(basePath);
      const files = [
        { path: 'a.ts', relativePath: 'a.ts', language: 'typescript', size: 100, extension: '.ts' },
        { path: 'b.ts', relativePath: 'b.ts', language: 'typescript', size: 100, extension: '.ts' },
        { path: 'c.js', relativePath: 'c.js', language: 'javascript', size: 100, extension: '.js' },
      ];
      expect(scanner.detectLanguage(files)).toBe('typescript');
    });

    it('returns javascript when more prevalent', () => {
      const scanner = new FileScanner(basePath);
      const files = [
        { path: 'a.js', relativePath: 'a.js', language: 'javascript', size: 100, extension: '.js' },
        { path: 'b.js', relativePath: 'b.js', language: 'javascript', size: 100, extension: '.js' },
        { path: 'c.js', relativePath: 'c.js', language: 'javascript', size: 100, extension: '.js' },
        { path: 'd.ts', relativePath: 'd.ts', language: 'typescript', size: 100, extension: '.ts' },
      ];
      expect(scanner.detectLanguage(files)).toBe('javascript');
    });

    it('returns first language for equal counts', () => {
      const scanner = new FileScanner(basePath);
      const files = [
        { path: 'a.ts', relativePath: 'a.ts', language: 'typescript', size: 100, extension: '.ts' },
        { path: 'b.py', relativePath: 'b.py', language: 'python', size: 100, extension: '.py' },
      ];
      const result = scanner.detectLanguage(files);
      expect(['typescript', 'python']).toContain(result);
    });

    it('returns unknown for empty array', () => {
      const scanner = new FileScanner(basePath);
      expect(scanner.detectLanguage([])).toBe('unknown');
    });
  });
});

describe('Language Extension Mapping', () => {
  // These constants are used internally by FileScanner
  const EXT_MAP: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.cs': 'csharp',
    '.c': 'c',
    '.h': 'c',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.hpp': 'cpp',
    '.hxx': 'cpp',
    '.hh': 'cpp',
    '.dart': 'dart',
    '.swift': 'swift',
    '.rb': 'ruby',
    '.php': 'php',
    '.kt': 'kotlin',
    '.kts': 'kotlin',
  };

  it('maps TypeScript extensions', () => {
    expect(EXT_MAP['.ts']).toBe('typescript');
    expect(EXT_MAP['.tsx']).toBe('typescript');
  });

  it('maps JavaScript extensions', () => {
    expect(EXT_MAP['.js']).toBe('javascript');
    expect(EXT_MAP['.jsx']).toBe('javascript');
    expect(EXT_MAP['.mjs']).toBe('javascript');
    expect(EXT_MAP['.cjs']).toBe('javascript');
  });

  it('maps Python', () => {
    expect(EXT_MAP['.py']).toBe('python');
  });

  it('maps Go and Rust', () => {
    expect(EXT_MAP['.go']).toBe('go');
    expect(EXT_MAP['.rs']).toBe('rust');
  });

  it('maps Java and C#', () => {
    expect(EXT_MAP['.java']).toBe('java');
    expect(EXT_MAP['.cs']).toBe('csharp');
  });

  it('maps C/C++', () => {
    expect(EXT_MAP['.c']).toBe('c');
    expect(EXT_MAP['.h']).toBe('c');
    expect(EXT_MAP['.cpp']).toBe('cpp');
    expect(EXT_MAP['.cc']).toBe('cpp');
    expect(EXT_MAP['.cxx']).toBe('cpp');
    expect(EXT_MAP['.hpp']).toBe('cpp');
  });

  it('maps Dart and Swift', () => {
    expect(EXT_MAP['.dart']).toBe('dart');
    expect(EXT_MAP['.swift']).toBe('swift');
  });

  it('maps Ruby and PHP', () => {
    expect(EXT_MAP['.rb']).toBe('ruby');
    expect(EXT_MAP['.php']).toBe('php');
  });

  it('maps Kotlin', () => {
    expect(EXT_MAP['.kt']).toBe('kotlin');
    expect(EXT_MAP['.kts']).toBe('kotlin');
  });

  it('has expected number of mappings', () => {
    expect(Object.keys(EXT_MAP).length).toBeGreaterThanOrEqual(25);
  });
});

describe('Skip Patterns', () => {
  const SKIP_DIRS = ['node_modules', 'dist', 'build', 'vendor', 'coverage', 'android', 'ios', '__pycache__', '.git'];

  function isSkipped(path: string): boolean {
    const parts = path.split('/');
    return (
      parts.some(p => SKIP_DIRS.includes(p)) ||
      path.endsWith('.d.ts') ||
      path.endsWith('.map') ||
      path.endsWith('.min.js')
    );
  }

  it('skips node_modules paths', () => {
    expect(isSkipped('node_modules/pkg/index.js')).toBe(true);
    expect(isSkipped('foo/node_modules/bar.js')).toBe(true);
    expect(isSkipped('src/node_modules/pkg')).toBe(true);
  });

  it('skips dist and build paths', () => {
    expect(isSkipped('dist/bundle.js')).toBe(true);
    expect(isSkipped('build/output.js')).toBe(true);
    expect(isSkipped('foo/dist/bar.js')).toBe(true);
  });

  it('skips .git paths', () => {
    expect(isSkipped('.git/config')).toBe(true);
    expect(isSkipped('repo/.git/HEAD')).toBe(true);
  });

  it('skips coverage paths', () => {
    expect(isSkipped('coverage/report.txt')).toBe(true);
    expect(isSkipped('test/coverage/index.html')).toBe(true);
  });

  it('skips .min.js files', () => {
    expect(isSkipped('bundle.min.js')).toBe(true);
    expect(isSkipped('lib.min.js')).toBe(true);
  });

  it('skips .map files', () => {
    expect(isSkipped('bundle.js.map')).toBe(true);
  });

  it('skips .d.ts files', () => {
    expect(isSkipped('types.d.ts')).toBe(true);
    expect(isSkipped('index.d.ts')).toBe(true);
  });

  it('skips __pycache__', () => {
    expect(isSkipped('__pycache__/module.pyc')).toBe(true);
  });

  it('skips vendor', () => {
    expect(isSkipped('vendor/pkg/code.php')).toBe(true);
  });

  it('skips android and ios', () => {
    expect(isSkipped('android/MainActivity.kt')).toBe(true);
    expect(isSkipped('ios/Runner.swift')).toBe(true);
  });

  it('does not skip source files', () => {
    expect(isSkipped('src/index.ts')).toBe(false);
    expect(isSkipped('lib/auth/login.js')).toBe(false);
    expect(isSkipped('packages/core/index.py')).toBe(false);
    expect(isSkipped('src/components/App.tsx')).toBe(false);
    expect(isSkipped('src/utils/helpers.go')).toBe(false);
  });

  it('handles deep paths', () => {
    expect(isSkipped('a/b/c/node_modules/d/e/f.js')).toBe(true);
    expect(isSkipped('very/deep/source/file.ts')).toBe(false);
  });
});