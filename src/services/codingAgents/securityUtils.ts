import { AllowlistedCommand, SecurityCommandPolicy } from '../../types';

/**
 * Phase 4 Security: Secret Detection & Workspace Boundaries
 */

const SENSITIVE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.pem$/i,
  /\.key$/i,
  /credentials\.json$/i,
  /service_account/i,
  /token/i,
  /secret/i,
  /auth_key/i,
];

/**
 * Checks if a file path or name looks like a credential or secret file
 */
export function isSensitiveFile(filePath: string): boolean {
  const fileName = filePath.split('/').pop() || '';
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(fileName));
}

/**
 * Sanitizes context by filtering out any secret or sensitive files
 */
export function sanitizeContextFiles(filePaths: string[]): {
  safeFiles: string[];
  excludedFiles: string[];
} {
  const safeFiles: string[] = [];
  const excludedFiles: string[] = [];

  for (const f of filePaths) {
    if (isSensitiveFile(f)) {
      excludedFiles.push(f);
    } else {
      safeFiles.push(f);
    }
  }

  return { safeFiles, excludedFiles };
}

/**
 * Verifies that a file modification target is inside the authorized workspace scope
 */
export function verifyPathInScope(
  targetPath: string,
  allowedPaths: string[],
  forbiddenPaths: string[] = []
): { allowed: boolean; reason?: string } {
  // Disallow directory traversal
  if (targetPath.includes('..') || targetPath.startsWith('/') || targetPath.startsWith('\\')) {
    return {
      allowed: false,
      reason: 'Directory traversal or absolute paths outside workspace are strictly blocked.',
    };
  }

  // Check sensitive file
  if (isSensitiveFile(targetPath)) {
    return {
      allowed: false,
      reason: 'Protected secret or environment credentials file cannot be modified.',
    };
  }

  // Check forbidden paths
  for (const forbidden of forbiddenPaths) {
    if (targetPath.startsWith(forbidden) || targetPath.includes(forbidden)) {
      return {
        allowed: false,
        reason: `Target path '${targetPath}' is in forbidden scope '${forbidden}'.`,
      };
    }
  }

  // If allowedPaths specified, must match at least one prefix
  if (allowedPaths.length > 0) {
    const isAllowed = allowedPaths.some(
      (prefix) =>
        targetPath.startsWith(prefix) ||
        prefix.startsWith(targetPath) ||
        prefix === '*'
    );
    if (!isAllowed) {
      return {
        allowed: false,
        reason: `Target path '${targetPath}' is outside the authorized workspace boundaries (${allowedPaths.join(
          ', '
        )}).`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Allowlisted Commands System (Section 31)
 */
export const ALLOWLISTED_COMMANDS: AllowlistedCommand[] = [
  // Safe inspection and build checks
  { command: 'godot --version', description: 'Check Godot engine binary version', policy: 'SAFE', category: 'build' },
  { command: 'godot --headless --check-only', description: 'Validate GDScript scene graphs and syntax', policy: 'SAFE', category: 'test' },
  { command: 'dotnet --version', description: 'Check .NET SDK version for C# scripts', policy: 'SAFE', category: 'build' },
  { command: 'dotnet build --no-restore', description: 'Compile C# solution in sandbox', policy: 'SAFE', category: 'build' },
  { command: 'git status', description: 'Inspect workspace git branch and dirty state', policy: 'SAFE', category: 'git' },
  { command: 'git diff', description: 'Inspect unstaged changes in task branch', policy: 'SAFE', category: 'git' },
  { command: 'gut -gtest', description: 'Run Godot Unit Testing (GUT) runner', policy: 'SAFE', category: 'test' },

  // Commands requiring approval
  { command: 'git branch -D', description: 'Force delete branch', policy: 'REQUIRES_APPROVAL', category: 'git' },
  { command: 'git reset --hard', description: 'Discard uncommitted workspace files', policy: 'REQUIRES_APPROVAL', category: 'git' },
  { command: 'npm install', description: 'Install project packages in workspace', policy: 'REQUIRES_APPROVAL', category: 'build' },

  // Blocked / Forbidden commands
  { command: 'rm -rf /', description: 'Recursive root deletion', policy: 'BLOCKED', category: 'system' },
  { command: 'curl | bash', description: 'Remote script execution', policy: 'BLOCKED', category: 'system' },
  { command: 'git push --force origin main', description: 'Direct force push to production main', policy: 'BLOCKED', category: 'git' },
];

/**
 * Classifies a requested shell command against the allowlist
 */
export function checkCommandPolicy(command: string): {
  policy: SecurityCommandPolicy;
  reason: string;
} {
  const trimmed = command.trim();

  // Explicit dangerous patterns
  if (
    trimmed.includes('rm -rf /') ||
    trimmed.includes('sudo') ||
    trimmed.includes(':(){ :|:& };:') ||
    trimmed.includes('mkfs') ||
    trimmed.includes('dd if=') ||
    (trimmed.includes('git push') && trimmed.includes('main'))
  ) {
    return {
      policy: 'BLOCKED',
      reason: 'Command violates container safety boundaries or attempts to modify main/production.',
    };
  }

  const match = ALLOWLISTED_COMMANDS.find((entry) => trimmed.startsWith(entry.command));
  if (match) {
    return {
      policy: match.policy,
      reason: match.description,
    };
  }

  // Unknown commands require approval by default
  return {
    policy: 'REQUIRES_APPROVAL',
    reason: 'Command is not in pre-approved allowlist; human confirmation required.',
  };
}
