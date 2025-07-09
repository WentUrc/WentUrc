// GitHub API 服务
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

class GitHubService {
  constructor() {
    this.owner = 'IGCrystal';
    this.repo = 'IGCrystal';
    this.path = 'docs/NeverNever_Land';
    
    // 缓存设置 (5分钟)
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
    
    // API 限制追踪
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'WentUrc-App'
    };
    
    // 动态获取 token，确保使用最新的配置
    const token = localStorage.getItem('github-token');
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    return headers;
  }

  /**
   * 带缓存和错误处理的 fetch
   */
  async fetchWithCache(url, cacheKey, useCache = true) {
    // 检查缓存
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`使用缓存数据: ${cacheKey}`);
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      // 更新 API 限制信息
      this.rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      this.rateLimitReset = response.headers.get('X-RateLimit-Reset');
      
      if (!response.ok) {
        if (response.status === 403) {
          const resetTime = new Date(this.rateLimitReset * 1000);
          throw new Error(`GitHub API 限制已达到喵～ 请等到 ${resetTime.toLocaleTimeString()} 后重试喵！`);
        } else if (response.status === 401) {
          const token = localStorage.getItem('github-token');
          if (token) {
            throw new Error(`GitHub Token 无效或权限不足喵～ 请检查 Token 是否有访问该仓库的权限`);
          } else {
            throw new Error(`需要 GitHub Token 才能访问该仓库喵～ 请在设置中配置 Token`);
          }
        } else if (response.status === 404) {
          throw new Error(`找不到指定的仓库或文件喵～ 可能是仓库私有或路径不正确`);
        }
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 缓存数据
      if (useCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error(`请求失败: ${url}`, error);
      
      // 如果有缓存数据，即使过期也返回
      if (this.cache.has(cacheKey)) {
        console.log(`使用过期缓存数据: ${cacheKey}`);
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }

  /**
   * 获取 API 使用情况
   */
  getApiStatus() {
    const token = localStorage.getItem('github-token');
    return {
      remaining: this.rateLimitRemaining,
      resetTime: this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : null,
      hasToken: !!token
    };
  }

  /**
   * 获取 NeverNever_Land 目录中的所有 markdown 文件
   */
  async getMarkdownFiles() {
    try {
      const url = `${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${this.path}`;
      const cacheKey = 'markdown-files';
      
      const files = await this.fetchWithCache(url, cacheKey);
      
      // 过滤出 markdown 文件
      const markdownFiles = files.filter(file => 
        file.type === 'file' && 
        (file.name.endsWith('.md') || file.name.endsWith('.markdown'))
      );
      
      return markdownFiles.map(file => ({
        name: file.name,
        path: file.path,
        sha: file.sha,
        size: file.size,
        download_url: file.download_url
      }));
    } catch (error) {
      console.error('Error fetching markdown files:', error);
      throw new Error(`获取文件列表失败喵: ${error.message}`);
    }
  }

  /**
   * 获取特定 markdown 文件的内容
   */
  async getFileContent(fileName) {
    try {
      const response = await fetch(`${GITHUB_RAW_BASE}/${this.owner}/${this.repo}/main/${this.path}/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${fileName}`);
      }
      
      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Error fetching file ${fileName}:`, error);
      return null;
    }
  }

  /**
   * 获取文件的最后修改时间
   */
  async getFileCommitInfo(fileName) {
    try {
      const url = `${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/commits?path=${this.path}/${fileName}&per_page=1`;
      const cacheKey = `commit-${fileName}`;
      
      const commits = await this.fetchWithCache(url, cacheKey);
      
      if (commits.length > 0) {
        return {
          date: commits[0].commit.committer.date,
          message: commits[0].commit.message,
          author: commits[0].commit.author.name
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching commit info for ${fileName}:`, error);
      return null;
    }
  }

  /**
   * 获取文件列表，包含详细信息
   */
  async getFileListWithDetails() {
    try {
      const files = await this.getMarkdownFiles();
      
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const commitInfo = await this.getFileCommitInfo(file.name);
          return {
            ...file,
            lastModified: commitInfo ? commitInfo.date : null,
            lastMessage: commitInfo ? commitInfo.message : null,
            author: commitInfo ? commitInfo.author : null
          };
        })
      );
      
      // 按修改时间排序，最新的在前面
      fileDetails.sort((a, b) => {
        if (!a.lastModified) return 1;
        if (!b.lastModified) return -1;
        return new Date(b.lastModified) - new Date(a.lastModified);
      });
      
      return fileDetails;
    } catch (error) {
      console.error('Error getting file list with details:', error);
      return [];
    }
  }
}

export default new GitHubService(); 