/**
 * Git Service
 * Handles all Git operations and Gitea API interactions
 *
 * This service abstracts Git operations for character creation and management.
 * When Gitea is not configured, operations are simulated in-memory.
 */

import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Sanitize slug to prevent path traversal attacks
 * Removes dangerous sequences like "..", "/", "\", and null bytes
 */
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Invalid slug: must be a non-empty string');
  }

  // Remove path traversal sequences and dangerous characters
  let sanitized = slug
    .replace(/\.\./g, '')           // Remove ..
    .replace(/[\/\\]/g, '')         // Remove / and \
    .replace(/\0/g, '')             // Remove null bytes
    .replace(/[<>:"|?*]/g, '')      // Remove Windows-invalid chars
    .trim();

  // Ensure slug only contains safe characters (alphanumeric, hyphen, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    // If not, create a safe version by keeping only valid chars
    sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
  }

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid slug: contains only invalid characters');
  }

  return sanitized;
}

/**
 * Validate Gitea URL to prevent SSRF attacks
 * Blocks private IPs, localhost, and cloud metadata endpoints
 */
export function isValidGiteaUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return false;
    }

    // Block private IP ranges (RFC 1918)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number);
      // 10.0.0.0/8
      if (a === 10) return false;
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) return false;
      // 192.168.0.0/16
      if (a === 192 && b === 168) return false;
      // 169.254.0.0/16 (link-local)
      if (a === 169 && b === 254) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================
// GITEA CONFIGURATION
// ============================================

/**
 * Check if Gitea is configured
 */
export function isGiteaConfigured(): boolean {
  const giteaUrl = process.env.GITEA_URL;
  const giteaToken = process.env.GITEA_API_TOKEN;

  return !!(
    giteaUrl &&
    giteaToken &&
    giteaToken !== 'placeholder-token-configure-after-gitea-install'
  );
}

/**
 * Gitea API Client
 */
export class GiteaClient {
  private baseUrl: string;
  private token: string;
  private isConfigured: boolean;

  constructor() {
    const giteaUrl = process.env.GITEA_URL || '';

    // Validate URL to prevent SSRF attacks
    if (giteaUrl && !isValidGiteaUrl(giteaUrl)) {
      console.error('[GitService] SECURITY: Invalid GITEA_URL blocked (potential SSRF)');
      this.baseUrl = '';
      this.isConfigured = false;
    } else {
      this.baseUrl = giteaUrl;
      this.isConfigured = isGiteaConfigured();
    }

    this.token = process.env.GITEA_API_TOKEN || '';
  }

  /**
   * Create a user in Gitea
   */
  async createUser(username: string, email: string, password: string) {
    if (!this.isConfigured) {
      console.log('[GitService] Gitea not configured - simulating user creation');
      return { id: Date.now(), username, email };
    }

    const response = await fetch(`${this.baseUrl}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `usuario-${username}`,
        email,
        password,
        must_change_password: false,
        send_notify: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Gitea user: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a repository for a user
   */
  async createRepository(userToken: string, repoName: string, description: string) {
    if (!this.isConfigured) {
      console.log('[GitService] Gitea not configured - simulating repo creation');
      return {
        id: Date.now(),
        name: repoName,
        full_name: `usuario-mock/${repoName}`,
        clone_url: `http://localhost:3000/usuario-mock/${repoName}.git`,
        html_url: `http://localhost:3000/usuario-mock/${repoName}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/api/v1/user/repos`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: true,
        auto_init: true,
        readme: 'Default',
        default_branch: 'main',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create repository: ${error}`);
    }

    return response.json();
  }

  /**
   * Fork the official history repository
   */
  async forkOfficialRepo(userToken: string, organization?: string) {
    if (!this.isConfigured) {
      console.log('[GitService] Gitea not configured - simulating fork');
      return {
        id: Date.now(),
        name: 'historia-oficial',
        full_name: `${organization || 'usuario-mock'}/historia-oficial`,
      };
    }

    const owner = process.env.GITHUB_OFFICIAL_REPO_OWNER || 'chocosfera';
    const repo = process.env.GITHUB_OFFICIAL_REPO_NAME || 'historia-oficial';

    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${owner}/${repo}/forks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fork repository: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    userToken: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ) {
    if (!this.isConfigured) {
      console.log('[GitService] Gitea not configured - simulating PR creation');
      return {
        id: Date.now(),
        number: Math.floor(Math.random() * 1000),
        title,
        body,
        html_url: `http://localhost:3000/${owner}/${repo}/pulls/mock`,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/api/v1/repos/${owner}/${repo}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          head,
          base,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create pull request: ${error}`);
    }

    return response.json();
  }
}

/**
 * Local Git Operations
 * Handles local git operations using simple-git
 */
export class GitService {
  public git: SimpleGit;
  private repoPath: string;
  private giteaClient: GiteaClient;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    const options: Partial<SimpleGitOptions> = {
      baseDir: repoPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
    };
    this.git = simpleGit(options);
    this.giteaClient = new GiteaClient();
  }

  /**
   * Initialize a new git repository
   */
  async init(): Promise<void> {
    try {
      // Create directory if doesn't exist
      if (!existsSync(this.repoPath)) {
        await fs.mkdir(this.repoPath, { recursive: true });
      }

      await this.git.init();
      await this.git.addConfig('user.name', 'Chocósfera Bot');
      await this.git.addConfig('user.email', 'bot@chocosfera.com');

      console.log(`[GitService] Initialized repo at ${this.repoPath}`);
    } catch (error) {
      console.error('[GitService] Error initializing repo:', error);
      throw error;
    }
  }

  /**
   * Clone a repository
   */
  async clone(repoUrl: string, targetPath?: string): Promise<void> {
    try {
      const clonePath = targetPath || this.repoPath;
      await fs.mkdir(path.dirname(clonePath), { recursive: true });
      await simpleGit().clone(repoUrl, clonePath);
      console.log(`[GitService] Cloned ${repoUrl} to ${clonePath}`);
    } catch (error) {
      console.error('[GitService] Error cloning repo:', error);
      throw error;
    }
  }

  /**
   * Create initial commit for character
   */
  async createCharacterCommit(
    characterData: {
      name: string;
      slug: string;
      type: string;
      description: string;
    }
  ): Promise<string> {
    try {
      // Sanitize slug to prevent path traversal attacks
      const safeSlug = sanitizeSlug(characterData.slug);
      const characterDir = path.join(this.repoPath, 'personajes', safeSlug);
      await fs.mkdir(characterDir, { recursive: true });

      // Create character.json
      const characterJson = {
        name: characterData.name,
        slug: characterData.slug,
        type: characterData.type,
        description: characterData.description,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
      };

      await fs.writeFile(
        path.join(characterDir, 'personaje.json'),
        JSON.stringify(characterJson, null, 2)
      );

      // Create initial historia directory
      const historiaDir = path.join(characterDir, 'historia');
      await fs.mkdir(historiaDir, { recursive: true });

      // Create initial story
      const initialStory = `# ${characterData.name} - El Comienzo

*"Me llevé un trozo de esa sustancia aromática y oscura a la boca, y me vi envuelto en una magia que me trasladó a un mundo tan hermoso y colorido como desconocido."*

---

## Mi llegada a la Chocósfera

${characterData.description}

(Continúa tu historia aquí...)

---

*Fecha de llegada: ${new Date().toLocaleDateString('es-ES')}*
`;

      await fs.writeFile(
        path.join(historiaDir, '01-llegada.md'),
        initialStory
      );

      // Create assets directory
      await fs.mkdir(path.join(characterDir, 'assets'), { recursive: true });

      // Git add and commit
      await this.git.add('.');
      const commitResult = await this.git.commit(
        `feat: add character ${characterData.name}

Created character: ${characterData.name} (${characterData.slug})
Type: ${characterData.type}

This is the beginning of ${characterData.name}'s journey in the Chocósfera.`
      );

      console.log(`[GitService] Created character commit: ${commitResult.commit}`);
      return commitResult.commit;
    } catch (error) {
      console.error('[GitService] Error creating character commit:', error);
      throw error;
    }
  }

  /**
   * Create a commit for a new story chapter
   */
  async createStoryCommit(
    characterSlug: string,
    chapterNumber: number,
    title: string,
    content: string
  ): Promise<string> {
    try {
      // Sanitize slug and title to prevent path traversal attacks
      const safeSlug = sanitizeSlug(characterSlug);
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const storyPath = path.join(
        this.repoPath,
        'personajes',
        safeSlug,
        'historia',
        `${String(chapterNumber).padStart(2, '0')}-${safeTitle}.md`
      );

      await fs.writeFile(storyPath, content);
      await this.git.add(storyPath);

      const commitResult = await this.git.commit(
        `story: add chapter ${chapterNumber} for ${characterSlug}

Title: ${title}

New chapter in the story of ${characterSlug}.`
      );

      console.log(`[GitService] Created story commit: ${commitResult.commit}`);
      return commitResult.commit;
    } catch (error) {
      console.error('[GitService] Error creating story commit:', error);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  async getHistory(maxCount: number = 50) {
    try {
      const log = await this.git.log({ maxCount });
      return log.all;
    } catch (error) {
      console.error('[GitService] Error getting history:', error);
      throw error;
    }
  }

  /**
   * Get specific commit details
   */
  async getCommit(commitSha: string) {
    try {
      const commit = await this.git.show([commitSha]);
      return commit;
    } catch (error) {
      console.error('[GitService] Error getting commit:', error);
      throw error;
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkoutLocalBranch(branchName);
      console.log(`[GitService] Created branch: ${branchName}`);
    } catch (error) {
      console.error('[GitService] Error creating branch:', error);
      throw error;
    }
  }

  /**
   * Switch branches
   */
  async checkout(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName);
      console.log(`[GitService] Checked out branch: ${branchName}`);
    } catch (error) {
      console.error('[GitService] Error checking out branch:', error);
      throw error;
    }
  }

  /**
   * Push to remote
   */
  async push(remote: string = 'origin', branch: string = 'main'): Promise<void> {
    try {
      await this.git.push(remote, branch);
      console.log(`[GitService] Pushed to ${remote}/${branch}`);
    } catch (error) {
      console.error('[GitService] Error pushing:', error);
      throw error;
    }
  }

  /**
   * Pull from remote
   */
  async pull(remote: string = 'origin', branch: string = 'main'): Promise<void> {
    try {
      await this.git.pull(remote, branch);
      console.log(`[GitService] Pulled from ${remote}/${branch}`);
    } catch (error) {
      console.error('[GitService] Error pulling:', error);
      throw error;
    }
  }

  /**
   * Add remote
   */
  async addRemote(name: string, url: string): Promise<void> {
    try {
      await this.git.addRemote(name, url);
      console.log(`[GitService] Added remote ${name}: ${url}`);
    } catch (error) {
      console.error('[GitService] Error adding remote:', error);
      throw error;
    }
  }

  /**
   * Get current status
   */
  async status() {
    try {
      return await this.git.status();
    } catch (error) {
      console.error('[GitService] Error getting status:', error);
      throw error;
    }
  }

  /**
   * Get diff
   */
  async diff(options?: string[]) {
    try {
      return await this.git.diff(options);
    } catch (error) {
      console.error('[GitService] Error getting diff:', error);
      throw error;
    }
  }
}

/**
 * Helper function to get user's repo path
 */
export function getUserRepoPath(userId: string): string {
  const baseDir = process.env.GIT_REPOS_DIR || path.join(process.cwd(), '.git-repos');
  return path.join(baseDir, `user-${userId}`, 'personajes');
}

/**
 * Initialize user's git repository
 */
export async function initializeUserRepo(userId: string, userNick: string): Promise<GitService> {
  const repoPath = getUserRepoPath(userId);
  const gitService = new GitService(repoPath);

  // Check if repo already exists
  if (!existsSync(path.join(repoPath, '.git'))) {
    await gitService.init();

    // Create README
    const readme = `# ${userNick} - Personajes en la Chocósfera

Bienvenido a mi repositorio de personajes en la Chocósfera.

## 🎭 Mis Personajes

Aquí encontrarás todos los personajes que he creado y sus historias.

## 📚 Estructura

\`\`\`
personajes/
├── nombre-personaje-1/
│   ├── personaje.json
│   ├── historia/
│   │   └── 01-llegada.md
│   ├── web/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── assets/
│       └── avatar.png
└── nombre-personaje-2/
    └── ...
\`\`\`

## 🤝 Colaboración

Este repositorio es parte de la Chocósfera. Si quieres colaborar, puedes hacer fork y enviar un pull request.

---

*Creado con ❤️ en la Chocósfera* 🍫✨
`;

    await fs.writeFile(path.join(repoPath, 'README.md'), readme);
    await gitService.git.add('README.md');
    await gitService.git.commit(`chore: initialize repository

Created initial repository structure for character management.`);
  }

  return gitService;
}

export default GitService;
