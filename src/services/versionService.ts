export interface VersionParts {
  major: number;
  minor: number;
  patch: number;
  buildNumber?: number;
}

export class VersionService {
  parseVersion(vString: string): VersionParts {
    const cleaned = vString.trim().replace(/^v/i, '');
    const [core, build] = cleaned.split('+');
    const [maj, min, pat] = core.split('.').map((num) => parseInt(num, 10) || 0);
    return {
      major: maj ?? 1,
      minor: min ?? 0,
      patch: pat ?? 0,
      buildNumber: build ? parseInt(build, 10) : undefined,
    };
  }

  formatVersion(parts: VersionParts): string {
    const base = `${parts.major}.${parts.minor}.${parts.patch}`;
    return parts.buildNumber !== undefined ? `${base}+${parts.buildNumber}` : base;
  }

  calculateNextVersion(currentVersion: string, bumpType: 'patch' | 'minor' | 'major'): string {
    const parts = this.parseVersion(currentVersion);
    if (bumpType === 'major') {
      return this.formatVersion({
        major: parts.major + 1,
        minor: 0,
        patch: 0,
      });
    }
    if (bumpType === 'minor') {
      return this.formatVersion({
        major: parts.major,
        minor: parts.minor + 1,
        patch: 0,
      });
    }
    return this.formatVersion({
      major: parts.major,
      minor: parts.minor,
      patch: parts.patch + 1,
    });
  }

  compareVersions(v1: string, v2: string): number {
    const p1 = this.parseVersion(v1);
    const p2 = this.parseVersion(v2);

    if (p1.major !== p2.major) return p1.major - p2.major;
    if (p1.minor !== p2.minor) return p1.minor - p2.minor;
    if (p1.patch !== p2.patch) return p1.patch - p2.patch;
    return (p1.buildNumber || 0) - (p2.buildNumber || 0);
  }
}

export const versionService = new VersionService();
