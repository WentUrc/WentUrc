<template>
  <div class="records-page">
    <div class="records-inner">
      <!-- 页面标题 -->
      <div class="section-header">
        <h1 class="section-title">
          <i class="fas fa-book"></i>
          过往的回想
        </h1>
        <p class="section-subtitle">没有未来的未来</p>
      </div>

      <!-- 文件列表 -->
      <div class="records-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在加载文件列表...</p>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-content">
          <div class="error-info">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="api-info">
              <div class="api-status-info" v-if="apiStatus.remaining !== null">
                GitHub API 剩余请求: <strong>{{ apiStatus.remaining }}</strong>
                <div v-if="apiStatus.resetTime" class="reset-time">
                  重置时间: {{ apiStatus.resetTime.toLocaleTimeString() }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="error-actions">
            <button @click="loadFiles" class="retry-button">
              <i class="fas fa-redo"></i>
              重试加载
            </button>
            <button @click="showTokenDialog = true" class="config-button">
              <i class="fas fa-cog"></i>
              配置Token
            </button>
          </div>
        </div>
      </div>

      <div v-else class="records-content">
        <!-- 移动端标签页导航 -->
        <div class="mobile-tabs" v-if="isMobile && files.length > 0">
          <div class="tabs-header">
            <div class="tabs-scroll-area">
              <div class="tabs-container">
                <button 
                  v-for="file in files" 
                  :key="file.name"
                  class="tab-button"
                  :class="{ active: selectedFile === file.name }"
                  @click="selectFile(file.name)"
                >
                  <i class="fas fa-file-alt"></i>
                  <span>{{ getDisplayName(file.name) }}</span>
                </button>
              </div>
            </div>
            
            <!-- 固定的控制按钮区域 -->
            <div class="mobile-controls">
              <!-- API 状态显示 -->
              <div class="api-status-mobile" v-if="apiStatus.remaining !== null" :title="getApiStatusTooltip()">
                <i class="fas fa-info-circle"></i>
                <span class="api-count">{{ apiStatus.remaining }}</span>
              </div>
              
              <!-- 刷新按钮 -->
              <button @click="refreshFiles" class="mobile-refresh-btn" :disabled="refreshing" title="刷新文件列表">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
              </button>
              
              <!-- Token 配置按钮 -->
              <button class="mobile-settings-btn" @click="showTokenDialog = true" title="配置GitHub Token">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
          
          <!-- 移动端文件内容显示 -->
          <div class="mobile-content">
            <div v-if="!selectedFile" class="welcome-message">
              <i class="fas fa-arrow-up"></i>
              <p>请从上方选择一个文件查看内容</p>
            </div>

            <div v-else class="file-content">
              <!-- 文件信息头部 -->
              <div class="file-header">
                <div class="file-title">
                  <h2>{{ getDisplayName(selectedFile) }}</h2>
                  <div class="file-actions">
                    <button 
                      class="preview-btn"
                      @click="togglePreview"
                      :title="showPreview ? '关闭预览' : '全屏预览'"
                    >
                      <i :class="showPreview ? 'fas fa-compress' : 'fas fa-expand'"></i>
                    </button>
                    <a 
                      :href="getGitHubUrl(selectedFile)" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="github-link"
                      title="在 GitHub 上查看"
                    >
                      <i class="fab fa-github"></i>
                    </a>
                  </div>
                </div>
                
                <div v-if="selectedFileInfo" class="file-info-bar">
                  <span class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    更新于 {{ formatDate(selectedFileInfo.lastModified) }}
                  </span>
                  <span v-if="selectedFileInfo.author" class="info-item">
                    <i class="fas fa-user"></i>
                    {{ selectedFileInfo.author }}
                  </span>
                  <span class="info-item">
                    <i class="fas fa-file-alt"></i>
                    {{ formatSize(selectedFileInfo.size) }}
                  </span>
                </div>
              </div>

              <!-- Markdown 内容 -->
              <div class="markdown-container">
                <MarkdownRenderer 
                  :content="fileContent" 
                  :loading="contentLoading"
                  :error="contentError"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 桌面端侧边栏文件列表 -->
        <div class="sidebar" v-if="!isMobile">
          <div class="file-list">
            <div class="file-list-header">
              <h3>
                <i class="fas fa-folder-open"></i>
                文件列表
              </h3>
              <button @click="refreshFiles" class="refresh-button" :disabled="refreshing">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
              </button>
              
              <!-- API 状态显示 -->
              <div class="api-status" v-if="apiStatus.remaining !== null" :title="getApiStatusTooltip()">
                <i class="fas fa-info-circle"></i>
                <span class="api-count">{{ apiStatus.remaining }}</span>
              </div>
              
              <!-- GitHub Token 设置按钮 -->
              <button class="settings-button" @click="showTokenDialog = true" :title="'配置GitHub Token提高API限制'">
                <i class="fas fa-cog"></i>
              </button>
            </div>
            
            <div class="file-items">
              <div 
                v-for="file in files" 
                :key="file.name"
                class="file-item"
                :class="{ active: selectedFile === file.name }"
                @click="selectFile(file.name)"
              >
                <div class="file-info">
                  <div class="file-name">
                    <i class="fas fa-file-alt"></i>
                    {{ getDisplayName(file.name) }}
                  </div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatSize(file.size) }}</span>
                    <span v-if="file.lastModified" class="file-date">
                      {{ formatDate(file.lastModified) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主内容区域 (仅桌面端显示) -->
        <div class="main-content" v-if="!isMobile">
          <div v-if="!selectedFile" class="welcome-message">
            <i class="fas fa-arrow-left"></i>
            <p>请从左侧选择一个文件查看内容</p>
          </div>

          <div v-else class="file-content">
            <!-- 文件信息头部 -->
            <div class="file-header">
              <div class="file-title">
                <h2>{{ getDisplayName(selectedFile) }}</h2>
                <div class="file-actions">
                  <button 
                    class="preview-btn"
                    @click="togglePreview"
                    :title="showPreview ? '关闭预览' : '全屏预览'"
                  >
                    <i :class="showPreview ? 'fas fa-compress' : 'fas fa-expand'"></i>
                  </button>
                  <a 
                    :href="getGitHubUrl(selectedFile)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="github-link"
                    title="在 GitHub 上查看"
                  >
                    <i class="fab fa-github"></i>
                  </a>
                </div>
              </div>
              
              <div v-if="selectedFileInfo" class="file-info-bar">
                <span class="info-item">
                  <i class="fas fa-calendar-alt"></i>
                  更新于 {{ formatDate(selectedFileInfo.lastModified) }}
                </span>
                <span v-if="selectedFileInfo.author" class="info-item">
                  <i class="fas fa-user"></i>
                  {{ selectedFileInfo.author }}
                </span>
                <span class="info-item">
                  <i class="fas fa-file-alt"></i>
                  {{ formatSize(selectedFileInfo.size) }}
                </span>
              </div>
            </div>

            <!-- Markdown 内容 -->
            <div class="markdown-container">
              <MarkdownRenderer 
                :content="fileContent" 
                :loading="contentLoading"
                :error="contentError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    
    <!-- 文件预览模态窗口 -->
    <div class="preview-modal" v-if="showPreview && selectedFile" @click="closePreview">
      <div class="preview-container" @click.stop>
        <div class="preview-header">
          <div class="preview-title">
            <i class="fas fa-file-alt"></i>
            <h3>{{ getDisplayName(selectedFile) }}</h3>
          </div>
          <div class="preview-actions">
            <a 
              :href="getGitHubUrl(selectedFile)" 
              target="_blank" 
              rel="noopener noreferrer"
              class="github-link-preview"
              title="在 GitHub 上查看"
            >
              <i class="fab fa-github"></i>
            </a>
            <button class="close-preview-btn" @click="closePreview" title="关闭预览">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="preview-content">
          <div v-if="selectedFileInfo" class="preview-file-info">
            <span class="preview-info-item">
              <i class="fas fa-calendar-alt"></i>
              更新于 {{ formatDate(selectedFileInfo.lastModified) }}
            </span>
            <span v-if="selectedFileInfo.author" class="preview-info-item">
              <i class="fas fa-user"></i>
              {{ selectedFileInfo.author }}
            </span>
            <span class="preview-info-item">
              <i class="fas fa-file-alt"></i>
              {{ formatSize(selectedFileInfo.size) }}
            </span>
          </div>
          
          <div class="preview-markdown">
            <MarkdownRenderer 
              :content="fileContent" 
              :loading="contentLoading"
              :error="contentError"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- GitHub Token 配置对话框 -->
    <div class="modal-overlay" v-if="showTokenDialog" @click="closeTokenDialog">
      <div class="token-dialog" @click.stop>
        <div class="dialog-header">
          <h3>
            <i class="fab fa-github"></i>
            配置 GitHub Token
          </h3>
          <button class="close-btn" @click="closeTokenDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-content">
          <div class="info-section">
            <div class="info-item">
              <i class="fas fa-info-circle text-primary"></i>
              <div>
                <strong>为什么需要配置？</strong>
                <p>GitHub API 对未认证用户限制每小时60次请求，配置Token后可提升至5000次喵～</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="fas fa-shield-alt text-success"></i>
              <div>
                <strong>安全吗？</strong>
                <p>Token仅存储在你的浏览器本地，不会发送到服务器喵♡</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="fas fa-key text-primary"></i>
              <div>
                <strong>权限说明</strong>
                <p>如果遇到403/401错误，可能需要配置具有<code>public_repo</code>或<code>repo</code>权限的Token才能访问某些仓库或Issues喵～</p>
              </div>
            </div>
          </div>
          
          <div class="token-input-section">
            <label for="github-token">GitHub Personal Access Token:</label>
            <div class="input-group">
              <input 
                id="github-token"
                type="password" 
                v-model="tokenInput" 
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                class="token-input"
              />
              <button class="toggle-visibility" @click="toggleTokenVisibility">
                <i :class="showToken ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p class="input-hint">
              <i class="fas fa-lightbulb"></i>
              留空则使用默认限制（60次/小时）
            </p>
          </div>
          
          <div class="help-section">
            <details>
              <summary>
                <i class="fas fa-question-circle"></i>
                如何获取 GitHub Token？
              </summary>
              <ol>
                <li>登录 <a href="https://github.com" target="_blank">GitHub</a></li>
                <li>进入 Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                <li>点击 "Generate new token (classic)"</li>
                <li>设置名称（如：WentUrc），选择过期时间</li>
                <li><strong>权限设置：</strong>
                  <ul style="margin-top: 8px; padding-left: 20px;">
                    <li><strong>访问公开仓库：</strong>不需要选择任何权限</li>
                    <li><strong>访问私有仓库或Issues：</strong>需要选择 <code>repo</code> 权限</li>
                    <li><strong>建议：</strong>选择 <code>public_repo</code> 权限（访问公开仓库的完整权限）</li>
                  </ul>
                </li>
                <li>生成并复制Token</li>
              </ol>
            </details>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="btn-secondary" @click="clearToken">清除</button>
          <button class="btn-primary" @click="saveToken">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GitHubService from '../../services/githubService.js';
import MarkdownRenderer from '../other/MarkdownRenderer.vue';
import '../../assets/css/color.css'; // 确保导入主题变量

export default {
  name: 'RecordsPage',
  components: {
    MarkdownRenderer
  },
  data() {
    return {
      files: [],
      selectedFile: '',
      fileContent: '',
      selectedFileInfo: null,
      loading: false,
      error: null,
      contentLoading: false,
      contentError: null,
      refreshing: false,
      showTokenDialog: false,
      tokenInput: '',
      showToken: false,
      windowWidth: window.innerWidth,
      showPreview: false,
      tokenConfig: {
        token: '',
        username: 'YOUR_GITHUB_USERNAME',
        repo: 'YOUR_REPO_NAME'
      },
      apiStatus: {
        remaining: null,
        limit: null,
        resetTime: null
      }
    };
  },
  computed: {
    selectedFileInfo() {
      return this.files.find(file => file.name === this.selectedFile);
    },
    isMobile() {
      return this.windowWidth <= 769;
    }
  },
  methods: {
    async loadFiles() {
      this.loading = true;
      this.error = null;
      
      try {
        this.files = await GitHubService.getFileListWithDetails();
        this.updateApiStatus();
        
        // 检查是否因为API限制导致无法获取文件
        if (this.files.length === 0) {
          const apiStatus = GitHubService.getApiStatus();
          if (apiStatus.remaining <= 0) {
            this.error = 'API_LIMIT_REACHED'; // 简单的标识，不显示具体文字
          }
          // 如果API还有剩余但没有文件，可能真的是没有markdown文件，不显示错误
        }
      } catch (err) {
        this.updateApiStatus();
        this.error = 'LOAD_ERROR'; // 简单的错误标识
      } finally {
        this.loading = false;
      }
    },

    async refreshFiles() {
      this.refreshing = true;
      const startTime = Date.now();
      
      try {
        this.files = await GitHubService.getFileListWithDetails();
        this.updateApiStatus();
      } catch (err) {
        this.updateApiStatus();
        console.error('刷新文件列表失败：', err);
      } finally {
        // 确保至少旋转800ms，给用户明确的反馈
        const elapsedTime = Date.now() - startTime;
        const minLoadTime = 800;
        
        if (elapsedTime < minLoadTime) {
          setTimeout(() => {
            this.refreshing = false;
          }, minLoadTime - elapsedTime);
        } else {
          this.refreshing = false;
        }
      }
    },

    updateApiStatus() {
      this.apiStatus = GitHubService.getApiStatus();
    },

    getApiStatusTooltip() {
      const status = this.apiStatus;
      let tooltip = `GitHub API 剩余请求: ${status.remaining}`;
      
      if (status.resetTime) {
        tooltip += `\n重置时间: ${status.resetTime.toLocaleTimeString()}`;
      }
      
      if (!status.hasToken) {
        tooltip += '\n💡 配置GitHub Token可提高API限制';
      }
      
      return tooltip;
    },

    async selectFile(fileName) {
      if (this.selectedFile === fileName) return;
      
      this.selectedFile = fileName;
      this.fileContent = '';
      this.contentLoading = true;
      this.contentError = null;

      try {
        const content = await GitHubService.getFileContent(fileName);
        if (content) {
          this.fileContent = content;
        } else {
          this.contentError = '文件内容加载失败喵...';
        }
      } catch (err) {
        this.contentError = '加载失败：' + err.message;
      } finally {
        this.contentLoading = false;
      }
    },

    getDisplayName(fileName) {
      return fileName.replace(/\.md$/, '').replace(/\.markdown$/, '');
    },

    formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getGitHubUrl(fileName) {
      return `https://github.com/IGCrystal/IGCrystal/blob/main/docs/NeverNever_Land/${fileName}`;
    },

    // Token 对话框相关方法
    closeTokenDialog() {
      this.showTokenDialog = false;
      this.tokenInput = '';
      this.showToken = false;
    },

    toggleTokenVisibility() {
      this.showToken = !this.showToken;
      const input = document.getElementById('github-token');
      if (input) {
        input.type = this.showToken ? 'text' : 'password';
      }
    },

    saveToken() {
      try {
        const token = this.tokenInput.trim();
        
        // 验证token格式（GitHub classic token以ghp_开头）
        if (token && !token.startsWith('ghp_')) {
          alert('请输入有效的GitHub Personal Access Token（以ghp_开头）喵！');
          return;
        }
        
        // 保存到localStorage
        if (token) {
          localStorage.setItem('github-token', token);
          // 更新GitHubService中的token
          GitHubService.token = token;
        } else {
          localStorage.removeItem('github-token');
          GitHubService.token = null;
        }
        
        this.closeTokenDialog();
        
        // 显示成功消息
        const message = token ? 'GitHub Token 已保存，API限制已提升喵♡～' : 'Token 已清除，使用默认限制喵～';
        alert(message);
        
        // 刷新文件列表
        this.refreshFiles();
      } catch (error) {
        console.error('保存Token失败:', error);
        alert('保存失败，请重试喵...');
      }
    },

    clearToken() {
      this.tokenInput = '';
      this.saveToken();
    },

    loadSavedToken() {
      const savedToken = localStorage.getItem('github-token');
      if (savedToken) {
        GitHubService.token = savedToken;
      }
    },

    togglePreview() {
      this.showPreview = !this.showPreview;
      if (this.showPreview) {
        // 禁用背景滚动 - 同时禁用html和body
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else {
        // 恢复背景滚动
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }
    },

    closePreview() {
      this.showPreview = false;
      // 恢复背景滚动
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }
  },

  mounted() {
    this.loadFiles();
    this.loadSavedToken();
    // 添加窗口大小变化监听器
    this.handleResize = () => {
      this.windowWidth = window.innerWidth;
    };
    window.addEventListener('resize', this.handleResize);
    
    // 添加ESC键监听器关闭预览
    this.handleKeydown = (event) => {
      if (event.key === 'Escape' && this.showPreview) {
        this.closePreview();
      }
    };
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    // 移除事件监听器
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
    if (this.handleKeydown) {
      document.removeEventListener('keydown', this.handleKeydown);
    }
    // 确保恢复背景滚动
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  },
};
</script>

<style scoped>
/* 外层容器 - 与其他组件保持一致 */
.records-page {
  position: relative;
  max-width: 100%;
  margin: 0;
  padding: 50px 0;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  min-height: 100vh;
  overflow: hidden;
  color: var(--text-color, #333);
}

/* 添加背景渐变文字 */
.records-page::before {
  content: "IGCrystal";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 20rem;
  font-weight: bold;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6930c3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.1;
  z-index: 0;
}

/* 添加渐变色顶部边框 */
.records-page::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  z-index: 1;
}

/* 内层容器 - 与其他组件保持一致 */
.records-inner {
  position: relative;
  z-index: 2;
  width: 85%;
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 40px;
  background: 
    linear-gradient(var(--card-bg, white), var(--card-bg, white)) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.1));
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.records-inner:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px var(--card-shadow, rgba(91, 81, 200, 0.2));
}

/* 标题样式 */
.section-header {
  margin-bottom: 30px;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  color: var(--icon-primary, #5e60ce);
  background: var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6b90ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 60%;
  background: var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6b90ff));
  border-radius: 2px;
}

.section-title i {
  margin-right: 15px;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-color, #666);
  margin-bottom: 0;
}

.records-container {
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.8));
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--card-shadow, rgba(91, 81, 200, 0.1));
}

.loading-state,
.error-state {
  text-align: center;
  padding: 30px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color, rgba(94, 96, 206, 0.2));
  border-top: 4px solid var(--icon-primary, #5e60ce);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-state p {
  font-size: 1.1rem;
  color: var(--text-color, #666);
  margin: 15px 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.error-header i {
  font-size: 2.5rem;
  color: var(--icon-primary, #5e60ce);
  opacity: 0.7;
  flex-shrink: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 30px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--card-shadow, rgba(91, 81, 200, 0.3));
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.retry-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(91, 81, 200, 0.4));
}

.retry-button i {
  font-size: 1.2rem;
}

.token-config-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 30px;
  background: var(--icon-accent, #6b90ff);
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 144, 255, 0.3);
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.token-config-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(107, 144, 255, 0.4);
  background: var(--icon-primary, #5e60ce);
}

.token-config-button i {
  font-size: 1.2rem;
}



.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.error-header .api-info {
  padding: 15px;
  background: var(--card-bg-hover);
  border-radius: 8px;
  border-left: 4px solid var(--icon-primary);
  text-align: left;
  min-width: 250px;
  max-width: 300px;
}

.error-header .api-info h4 {
  margin: 0 0 8px 0;
  color: var(--icon-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.error-header .api-info p {
  margin: 4px 0;
  font-size: 0.85rem;
  color: var(--text-color, #333);
  line-height: 1.4;
}

.error-header .token-hint {
  color: var(--icon-accent, #6b90ff) !important;
  font-weight: 500;
  font-style: italic;
  font-size: 0.8rem !important;
}

.records-content {
  display: flex;
  height: calc(100vh - 250px);
  min-height: 45vh;
  max-height: 65vh;
}

/* 响应式设计 - 错误状态 */
@media (max-width: 769px) {
  .error-header {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .error-header .api-info {
    min-width: auto;
    max-width: 90%;
    width: 100%;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .retry-button,
  .token-config-button {
    width: 200px;
    justify-content: center;
  }
}

.sidebar {
  width: 300px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
}

.file-list-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.file-list-header h3 i {
  margin-right: 8px;
  color: var(--icon-primary);
}

.refresh-button {
  background: none;
  border: none;
  color: var(--icon-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.refresh-button:hover {
  background: var(--hover-bg);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--card-bg-hover);
  cursor: help;
}

.api-status i {
  color: var(--icon-primary);
}

.api-count {
  font-weight: 600;
}

.file-items {
  padding: 0;
}

.file-item {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.3s;
}

.file-item:hover {
  background: var(--hover-bg);
}

.file-item.active {
  background: var(--primary-light);
  border-left: 4px solid var(--icon-primary);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

.file-name i {
  margin-right: 8px;
  color: var(--icon-primary);
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--content-bg);
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.welcome-message i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--icon-primary);
}

.file-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.file-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
}

.file-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.file-title h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.github-link {
  color: var(--icon-primary);
  font-size: 1.2rem;
  text-decoration: none;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.github-link:hover {
  background: var(--hover-bg);
}

.preview-btn {
  background: none;
  border: none;
  color: var(--icon-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.preview-btn:hover {
  opacity: 1;
  background: var(--card-bg-hover);
  transform: rotate(90deg);
}

.file-info-bar {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.info-item i {
  color: var(--icon-primary);
}

.markdown-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 769px) {
  .records-page {
    padding: 50px 0;
  }
  
  .records-page::before {
    font-size: 10rem;
  }
  
  .records-inner {
    width: 85%;
    padding: 25px;
    margin: 15px auto 0;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .records-content {
    flex-direction: column;
    height: auto; /* 移除固定高度 */
    min-height: auto; /* 移除最小高度限制 */
    max-height: none; /* 移除最大高度限制 */
  }
  
  .sidebar {
    width: 100%;
    max-height: none; /* 移除高度限制，让内容自然展开 */
    margin-bottom: 20px; /* 添加与主内容的间距 */
    border-right: none; /* 移除右边框 */
    border-bottom: 2px solid var(--border-color); /* 添加底部边框分隔 */
  }
  
  .main-content {
    min-height: 400px;
    max-height: none; /* 移除高度限制 */
    height: auto; /* 让内容自然展开 */
  }
  
  .file-info-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  /* 优化文件列表的移动端显示 */
  .file-list-header {
    padding: 20px;
    position: sticky; /* 让头部在滚动时保持可见 */
    top: 0;
    background: var(--header-bg);
    z-index: 10;
  }
  
  .file-item {
    padding: 16px 20px; /* 增加触摸区域 */
  }
  
  .file-name {
    font-size: 1rem; /* 稍微增大字体 */
  }
  
  .file-meta {
    flex-direction: column; /* 垂直排列文件信息 */
    gap: 4px;
    align-items: flex-start;
  }
  
  /* 优化按钮的触摸区域 */
  .refresh-button,
  .settings-button {
    padding: 12px; /* 增大点击区域 */
    min-width: 44px; /* 符合移动端最小触摸区域标准 */
    min-height: 44px;
  }
  
  .api-status {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .records-page {
    padding: 20px 10px; /* 减少顶部padding，因为有固定导航栏 */
  }
  
  .records-inner {
    width: 95%; /* 增加宽度利用 */
    padding: 20px;
    margin: 10px auto 0;
  }
  
  .section-title {
    font-size: 1.4rem;
  }
  
  .section-subtitle {
    font-size: 0.9rem;
  }
  
  /* 进一步优化小屏幕的文件列表 */
  .file-list-header {
    padding: 15px;
    flex-wrap: wrap; /* 允许换行 */
    gap: 10px;
  }
  
  .file-list-header h3 {
    font-size: 1rem;
    flex: 1;
    min-width: 120px;
  }
  
  .file-item {
    padding: 15px;
  }
  
  .file-name {
    font-size: 0.95rem;
  }
  
  .file-meta {
    font-size: 0.8rem;
  }
  
  /* 优化文件内容区域 */
  .file-header {
    padding: 15px;
  }
  
  .file-title h2 {
    font-size: 1.3rem;
    line-height: 1.3;
  }
  
  .markdown-container {
    padding: 15px;
  }
  
  /* 优化错误状态在小屏幕上的显示 */
  .error-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .error-header i {
    font-size: 3rem;
  }
  
  .error-header .api-info {
    width: 100%;
    max-width: none;
    text-align: left;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .retry-button,
  .token-config-button {
    width: 100%;
    padding: 15px 20px; /* 增大触摸区域 */
    font-size: 1rem;
  }
}

/* 针对超小屏幕设备的额外优化 */
@media (max-width: 360px) {
  .records-inner {
    width: 98%;
    padding: 15px;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .file-list-header h3 {
    font-size: 0.9rem;
  }
  
  .file-item {
    padding: 12px;
  }
  
  .file-name {
    font-size: 0.9rem;
  }
  
  .markdown-container {
    padding: 12px;
  }
}

/* 主题适配 */
:root[data-theme="dark"] .records-page {
  background: var(--card-bg, rgba(40, 40, 40, 0.8));
}

:root[data-theme="dark"] .records-inner {
  background: 
    linear-gradient(var(--card-bg, #212121), var(--card-bg, #212121)) padding-box,
    linear-gradient(to right, var(--border-gradient, #9b8dda, #6b90ff, #7294d5, #b98db6)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0, 0, 0, 0.3));
}

:root[data-theme="dark"] .records-inner:hover {
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0, 0, 0, 0.4));
}

:root[data-theme="dark"] .records-container {
  background: var(--card-bg-hover, rgba(30, 30, 30, 0.8));
}

/* Token 设置按钮 */
.settings-button {
  background: none;
  border: none;
  color: var(--icon-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin-left: 8px;
  opacity: 0.7;
}

.settings-button:hover {
  opacity: 1;
  background: var(--card-bg-hover);
  transform: rotate(90deg);
}

/* Modal 样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.token-dialog {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid transparent;
  background: 
    linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
    linear-gradient(to right, var(--border-gradient)) border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.4rem;
}

.dialog-header h3 i {
  margin-right: 10px;
  color: var(--icon-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--button-hover);
  color: var(--text-color);
}

.dialog-content {
  padding: 30px;
}

.info-section {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 15px;
}

.info-item i {
  font-size: 1.3rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.text-primary {
  color: var(--icon-primary);
}

.text-success {
  color: var(--icon-accent);
}

.info-item div {
  flex: 1;
}

.info-item strong {
  color: var(--text-color);
  display: block;
  margin-bottom: 5px;
}

.info-item p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
}

.token-input-section {
  margin-bottom: 30px;
}

.token-input-section label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-color);
  font-weight: 500;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.token-input {
  flex: 1;
  padding: 12px 45px 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg-hover);
  color: var(--text-color);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.token-input:focus {
  outline: none;
  border-color: var(--icon-primary);
}

.toggle-visibility {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.toggle-visibility:hover {
  color: var(--text-color);
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.input-hint i {
  color: var(--icon-accent);
}

.help-section {
  margin-bottom: 20px;
}

.help-section details {
  background: var(--card-bg-hover);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid var(--border-color);
}

.help-section summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.help-section summary i {
  color: var(--icon-primary);
}

.help-section ol {
  margin: 15px 0 0 0;
  padding-left: 20px;
  color: var(--text-secondary);
}

.help-section li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.help-section a {
  color: var(--icon-primary);
  text-decoration: none;
}

.help-section a:hover {
  text-decoration: underline;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn-primary {
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  color: white;
  box-shadow: 0 4px 15px var(--card-shadow, rgba(91, 81, 200, 0.3));
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(91, 81, 200, 0.4));
}

.btn-secondary {
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.9));
  color: var(--text-color);
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 15px var(--card-shadow, rgba(0, 0, 0, 0.1));
}

.btn-secondary:hover {
  background: var(--button-hover);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(0, 0, 0, 0.15));
}

/* Token对话框响应式设计 */
@media (max-width: 769px) {
  .token-dialog {
    width: 95%;
    margin: 20px;
    max-height: 85vh; /* 留出更多空间给内容 */
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding: 20px;
  }
  
  .dialog-header h3 {
    font-size: 1.2rem;
  }
  
  .info-item {
    flex-direction: row; /* 保持水平布局 */
    gap: 12px;
  }
  
  .info-item i {
    font-size: 1.2rem;
    margin-top: 3px;
  }
  
  .token-input {
    padding: 14px 50px 14px 16px; /* 增大触摸区域 */
    font-size: 1rem;
  }
  
  .toggle-visibility {
    right: 12px;
    padding: 8px;
    min-width: 36px;
    min-height: 36px;
  }
  
  .help-section summary {
    font-size: 1rem;
    padding: 4px 0;
  }
  
  .help-section ol {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  .help-section li {
    margin-bottom: 12px;
  }
  
  .dialog-actions {
    flex-direction: row; /* 在平板上保持水平布局 */
    gap: 15px;
  }
  
  .btn-primary,
  .btn-secondary {
    flex: 1;
    padding: 14px 20px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .token-dialog {
    width: 98%;
    margin: 10px;
    max-height: 90vh;
    border-radius: 12px;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding: 16px;
  }
  
  .dialog-header h3 {
    font-size: 1.1rem;
  }
  
  .close-btn {
    padding: 8px;
    font-size: 1.3rem;
  }
  
  .info-item {
    margin-bottom: 16px;
  }
  
  .info-item strong {
    font-size: 0.95rem;
  }
  
  .info-item p {
    font-size: 0.85rem;
    line-height: 1.5;
  }
  
  .token-input-section label {
    font-size: 0.95rem;
    margin-bottom: 8px;
  }
  
  .token-input {
    padding: 16px 50px 16px 14px;
    font-size: 0.9rem;
  }
  
  .input-hint {
    font-size: 0.8rem;
    margin-top: 6px;
  }
  
  .help-section details {
    padding: 12px;
  }
  
  .help-section summary {
    font-size: 0.9rem;
  }
  
  .help-section ol {
    font-size: 0.85rem;
    padding-left: 16px;
  }
  
  .help-section li {
    margin-bottom: 10px;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 16px 20px;
    font-size: 1rem;
  }
}

/* 移动端标签页导航样式 */
.mobile-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--header-bg);
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

.tabs-header::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.tabs-scroll-area {
  flex: 1; /* Allow scroll area to grow and take available space */
  overflow-x: auto; /* Enable horizontal scrolling for the container */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}

.tabs-scroll-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.tabs-container {
  display: flex;
  gap: 10px;
  min-width: min-content;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 5px 0;
  border-radius: 25px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

}

.tab-button i {
  font-size: 0.85em;
  opacity: 0.8;
}

.tab-button:hover {
  background: var(--card-bg-hover);
  border-color: var(--icon-primary);
  color: var(--icon-primary);
  transform: translateY(-1px);

}

.tab-button.active {
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  border-color: var(--icon-primary);
  color: var(--icon-primary);
  font-weight: 600;
  transform: translateY(-1px);

}

.tab-button.active i {
  opacity: 1;
}

.mobile-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0; /* Prevent controls from shrinking */
}

.api-status-mobile {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--card-bg-hover);
  cursor: help;
}

.api-status-mobile i {
  color: var(--icon-primary);
}

.api-count {
  font-weight: 600;
}

.mobile-refresh-btn {
  background: none;
  border: none;
  color: var(--icon-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.mobile-refresh-btn:hover {
  background: var(--hover-bg);
}

.mobile-refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mobile-refresh-btn i {
  font-size: 1.2rem;
}

.mobile-settings-btn {
  background: none;
  border: none;
  color: var(--icon-primary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.mobile-settings-btn:hover {
  opacity: 1;
  background: var(--card-bg-hover);
  transform: rotate(90deg);
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--body-bg);
  min-height: 300px;
}

/* 响应式设计 */
@media (max-width: 769px) {
  .tabs-header {
    padding: 12px 15px;
  }

  .tabs-scroll-area {
    flex: 1;
    overflow-x: auto;
  }

  .tabs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tabs-scroll-area {
    width: 100%;
  }

  .tabs-container {
    justify-content: center;
  }

  .tab-button {
    padding: 8px 14px;
    font-size: 0.85rem;
    border-radius: 20px;
    width: auto; /* Allow buttons to size based on content */
  }

  .tab-button span {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-controls {
    width: auto;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .mobile-content {
    padding: 15px;
  }

  .mobile-content .welcome-message {
    margin-top: 60px;
    padding-top: 40px;
  }
}

@media (max-width: 480px) {
  .tabs-header {
    padding: 10px 12px;
  }

  .tabs-scroll-area {
    flex: 1;
    overflow-x: auto;
  }

  .tabs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tabs-scroll-area {
    width: 100%;
  }

  .tabs-container {
    justify-content: flex-start;
    gap: 6px;
  }

  .tab-button {
    padding: 7px 12px;
    font-size: 0.8rem;
    border-radius: 18px;
    min-width: 0;
    flex: 0 0 auto;
  }

  .tab-button span {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-controls {
    width: auto;
    justify-content: flex-end;
    flex-shrink: 0;
    gap: 8px;
  }

  .api-status-mobile {
    font-size: 0.75rem;
    padding: 3px 6px;
  }

  .mobile-refresh-btn,
  .mobile-settings-btn {
    padding: 6px;
  }

  .mobile-refresh-btn i {
    font-size: 1rem;
  }

  .mobile-settings-btn {
    font-size: 1rem;
  }

  .mobile-content {
    padding: 12px;
  }

  .mobile-content .welcome-message {
    margin-top: 40px;
    padding-top: 30px;
  }
}



@media (max-width: 480px) {
  .mobile-content .welcome-message {
    margin-top: 40px;
    padding-top: 30px;
  }
}

@media (max-width: 360px) {
  .tabs-header {
    padding: 8px 10px;
  }

      .tabs-scroll-area {
      flex: 1;
      overflow-x: auto;
    }

    .tabs-header {
      gap: 6px;
    }

  .tab-button {
    padding: 6px 10px;
    font-size: 0.75rem;
    gap: 6px;
  }

  .tab-button span {
    max-width: 60px;
  }

      .mobile-controls {
      width: auto;
      justify-content: flex-end;
      flex-shrink: 0;
      gap: 6px;
    }

  .api-status-mobile {
    font-size: 0.7rem;
    padding: 2px 4px;
  }

  .mobile-refresh-btn,
  .mobile-settings-btn {
    padding: 5px;
  }

  .mobile-refresh-btn i {
    font-size: 0.9rem;
  }

  .mobile-settings-btn {
    font-size: 0.9rem;
  }
}

/* 文件预览模态窗口样式 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.preview-container {
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-title i {
  color: var(--icon-primary);
  font-size: 1.2rem;
}

.preview-title h3 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-color);
  font-weight: 600;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.github-link-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--card-bg-hover);
  color: var(--icon-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.github-link-preview:hover {
  background: var(--hover-bg);
  color: var(--icon-primary);
  transform: scale(1.05);
}

.close-preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--card-bg-hover);
  color: var(--text-color);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.close-preview-btn:hover {
  background: var(--hover-bg);
  color: var(--icon-primary);
  transform: rotate(90deg);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.preview-file-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 25px;
  background: var(--card-bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.preview-info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-info-item i {
  color: var(--icon-primary);
  font-size: 0.85rem;
}

.preview-markdown {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: var(--body-bg);
}

/* 预览模式下的markdown内容优化 */
.preview-markdown :deep(.markdown-content) {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-color);
  max-width: none;
}

.preview-markdown :deep(h1) {
  font-size: 2.2rem;
  margin: 2rem 0 1.5rem 0;
  color: var(--text-color);
}

.preview-markdown :deep(h2) {
  font-size: 1.8rem;
  margin: 1.8rem 0 1.2rem 0;
  color: var(--text-color);
}

.preview-markdown :deep(h3) {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem 0;
  color: var(--text-color);
}

.preview-markdown :deep(p) {
  margin: 1.2rem 0;
}

.preview-markdown :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--icon-primary);
  background: var(--card-bg-hover);
  border-radius: 0 8px 8px 0;
}

.preview-markdown :deep(pre) {
  margin: 1.5rem 0;
  padding: 1.2rem;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.preview-markdown :deep(code:not(pre code)) {
  padding: 0.2rem 0.4rem;
  background: var(--card-bg-hover);
  border-radius: 4px;
  font-size: 0.95em;
}

/* 响应式调整 - 预览模态窗口 */
@media (max-width: 769px) {
  .preview-container {
    width: 95vw;
    height: 95vh;
    border-radius: 8px;
  }

  .preview-header {
    padding: 15px 20px;
  }

  .preview-title h3 {
    font-size: 1.2rem;
  }

  .preview-file-info {
    padding: 12px 20px;
    gap: 15px;
  }

  .preview-markdown {
    padding: 20px;
  }

  .preview-markdown :deep(.markdown-content) {
    font-size: 1rem;
    line-height: 1.6;
  }

  .preview-markdown :deep(h1) {
    font-size: 1.8rem;
  }

  .preview-markdown :deep(h2) {
    font-size: 1.5rem;
  }

  .preview-markdown :deep(h3) {
    font-size: 1.3rem;
  }
}
</style>

/* 全局样式：禁用滚动的类 */
:global(.no-scroll) {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

:global(html.no-scroll) {
  overflow: hidden !important;
} 