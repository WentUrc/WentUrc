<template>
  <div class="message-board-page">
    <!-- 添加背景渐变文字 -->
    <div class="message-board-inner">
      <div class="section-header">
        <h1 class="section-title">
          <i class="fas fa-comments"></i>
          留言板
        </h1>
        <p class="section-subtitle">在这里留下你的足迹喵～</p>
      </div>
      
      <!-- 直接渲染留言板内容，不使用组件的容器 -->
      <div class="message-board-content">
        <!-- 留言加载状态 -->
        <div v-if="isLoadingIssues" class="loading-issues">
          <i class="fas fa-spinner fa-spin"></i>
          <span>正在加载留言喵～</span>
        </div>
        
        <!-- 留言内容展示 -->
        <div v-else-if="issues.length > 0" class="issues-container">
          <div v-for="issue in issues" :key="issue.id" class="issue-item">
            <div class="issue-header">
              <img :src="issue.user.avatar_url" :alt="issue.user.login" class="issue-avatar" />
              <div class="issue-meta">
                <span class="issue-author">{{ issue.user.login }}</span>
                <span class="issue-date">{{ formatDate(issue.created_at) }}</span>
              </div>
            </div>
            <div class="issue-body" v-html="formatIssueBody(issue.body)"></div>
            <a :href="issue.html_url" target="_blank" rel="noopener noreferrer" class="issue-link">
              查看详情 <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        
        <!-- 无留言或加载失败状态 -->
        <div v-else class="no-issues">
          <p>{{ issuesError ? '加载留言失败了喵～' : '暂时没有留言喵～' }}</p>
        </div>
        
        <!-- 留言操作区域 -->
        <div class="message-actions">
          <a :href="createIssueUrl" target="_blank" rel="noopener noreferrer" class="message-board-link">
            <i class="fas fa-comments"></i>
            <span>{{ issues.length > 0 ? '写下新留言喵～' : '成为第一个留言的人喵～' }}</span>
          </a>
          
          <a v-if="issues.length > 0" :href="repoIssuesUrl" target="_blank" rel="noopener noreferrer" class="view-all-link">
            查看全部留言 <i class="fas fa-arrow-right"></i>
          </a>
        </div>
        
        <p class="message-tip">留言需要 GitHub 账号喔～</p>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import notificationService from '../../utils/notificationService.js';
import '../../assets/css/color.css';

export default {
  name: 'MessageBoardPage',
  data() {
    return {
      issues: [],
      isLoadingIssues: false,
      issuesError: null,
      issuesCacheTime: 0,
      issuesCacheDuration: 5 * 60 * 1000, // 5分钟缓存
      repoOwner: 'IGCyukira',  // 修正为正确的用户名
      repoName: 'WentUrc',
    };
  },
  computed: {
    // GitHub 仓库的基础 URL
    repoBaseUrl() {
      return `https://github.com/${this.repoOwner}/${this.repoName}`;
    },
    
    // 仓库 issues 页面 URL
    repoIssuesUrl() {
      return `${this.repoBaseUrl}/issues`;
    },
    
    // 创建预填充模板的Issue URL
    createIssueUrl() {
      // 使用已存在的模板文件
      return `${this.repoBaseUrl}/issues/new?template=message_board.md`;
    }
  },
  methods: {
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
    },
    
    // 格式化Issue内容，将markdown转为HTML并净化
    formatIssueBody(body) {
      if (!body) return '';
      
      // 尝试解析留言板模板
      const parsedContent = this.parseMessageTemplate(body);
      if (parsedContent) {
        return parsedContent;
      }
      
      // 如果不是模板格式，按照原来的方式处理
      let shortenedBody = body;
      if (body.length > 200) {
        shortenedBody = body.substring(0, 200) + '...';
      }
      
      // 使用marked将markdown转为HTML
      const html = marked(shortenedBody);
      
      // 使用DOMPurify净化HTML，防止XSS攻击
      return DOMPurify.sanitize(html);
    },
    
    // 解析留言板模板
    parseMessageTemplate(body) {
      // 检查是否符合留言模板格式
      if (!body.includes('**✨ 留言内容**') && !body.includes('**💡 是否想收到回复？**')) {
        return null; // 不符合模板格式
      }
      
      try {
        // 提取留言内容，去除模板文本
        let message = '';
        const messageMatch = body.match(/\*\*✨ 留言内容\*\*([\s\S]*?)(?:\*\*💡|---|$)/);
        if (messageMatch && messageMatch[1]) {
          // 移除模板说明文本
          message = messageMatch[1].trim()
            .replace(/请在这里写下你想说的话喵～本猫会偷偷看一眼的！/, '')
            .replace(/^[\s\n]+/, ''); // 移除开头的空白行
        }
        
        // 提取回复选项
        let wantsReply = null;
        if (body.includes('- [x] 是喵～') || body.includes('- [X] 是喵～')) {
          wantsReply = true;
        } else if (body.includes('- [x] 不用了') || body.includes('- [X] 不用了')) {
          wantsReply = false;
        }
        
        // 构建美化的HTML
        let html = `<div class="message-content">`;
        
        // 处理留言内容
        if (message) {
          // 进一步清理模板相关的文本和指令
          const cleanedMessage = message
            .replace(/^-\s*\[\s*[xX\s]?\s*\].*$/gm, '')  // 移除勾选框
            .replace(/^\s*\*\*.*?\*\*\s*$/gm, '')        // 移除加粗标题
            .replace(/^---.*$/gm, '');                   // 移除分隔线
            
          // 确保内容不为空
          if (cleanedMessage.trim()) {
            const messageHtml = marked(cleanedMessage);
            html += `<div class="message-text">${DOMPurify.sanitize(messageHtml)}</div>`;
          }
        }
        
        // 添加回复标签
        if (wantsReply !== null) {
          const replyTagClass = wantsReply ? 'reply-wanted' : 'no-reply-needed';
          const replyText = wantsReply 
            ? '<i class="fas fa-comment-dots"></i> 希望可以回复一下喵~' 
            : '<i class="fas fa-check-circle"></i> 唔，我看看就好喵~';
          html += `<div class="reply-tag ${replyTagClass}">${replyText}</div>`;
        }
        
        html += `</div>`;
        return html.includes('<div class="message-text">') ? html : null;
      } catch (error) {
        console.error('解析留言模板失败:', error);
        return null;
      }
    },
    
    // 获取认证头
    getAuthHeaders() {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WentUrc-App'
      };
      
      const token = localStorage.getItem('github-token');
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }
      
      return headers;
    },

    // 加载GitHub Issues
    async loadIssues() {
      // 检查缓存是否有效
      const now = Date.now();
      if (this.issues.length > 0 && now - this.issuesCacheTime < this.issuesCacheDuration) {
        return; // 使用缓存的数据
      }
      
      this.isLoadingIssues = true;
      this.issuesError = null;
      
      try {
        const response = await fetch(
          `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?labels=留言板&sort=created&direction=desc&per_page=10`,
          {
            headers: this.getAuthHeaders()
          }
        );
        
        if (!response.ok) {
          const remainingRequests = response.headers.get('X-RateLimit-Remaining');
          const resetTime = response.headers.get('X-RateLimit-Reset');
          
          if (response.status === 403) {
            const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleTimeString() : '未知';
            throw new Error(`GitHub API 限制已达到喵～ 剩余请求: ${remainingRequests}, 重置时间: ${resetDate}`);
          } else if (response.status === 401) {
            throw new Error('GitHub Token 无效或权限不足喵～ 请检查 Token 配置');
          } else if (response.status === 404) {
            throw new Error('找不到指定的仓库或无权限访问喵～');
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.issues = data;
        this.issuesCacheTime = now;
        
        console.log('🔍 GitHub API 响应:', {
          count: this.issues.length,
          issues: this.issues.map(issue => ({
            id: issue.id,
            title: issue.title,
            hasBody: !!issue.body,
            bodyLength: issue.body ? issue.body.length : 0,
            user: issue.user.login
          }))
        });
        
        if (this.issues.length > 0) {
          console.log(`✅ 成功加载了 ${this.issues.length} 条留言`);
        } else {
          console.log('📝 暂时没有留言');
        }
      } catch (error) {
        console.error('❌ 加载留言失败:', error);
        this.issuesError = error.message;
        
        // 显示用户友好的错误信息
        const friendlyError = this.getFriendlyErrorMessage(error);
        notificationService.error(`加载留言失败：${friendlyError}`);
      } finally {
        this.isLoadingIssues = false;
      }
    },
    
    // 获取用户友好的错误信息
    getFriendlyErrorMessage(error) {
      if (error.message.includes('403')) {
        return 'GitHub API 访问受限，请稍后重试喵～';
      } else if (error.message.includes('404')) {
        return '找不到指定的仓库或Issues，请检查配置喵～';
      } else if (error.message.includes('Network')) {
        return '网络连接失败，请检查网络后重试喵～';
      } else {
        return '未知错误，请稍后重试喵～';
      }
    }
  },
  async mounted() {
    await this.loadIssues();
  }
};
</script>

<style scoped>
/* 外层容器 - 响应式布局策略 */
.message-board-page {
  position: relative;
  max-width: 100%;
  margin: 0;
  padding: 50px 0;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  color: var(--text-color, #333);
  box-sizing: border-box;
}

/* 桌面端：固定高度 + 内部滚动 */
@media (min-width: 769px) {
  .message-board-page {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 移动端：自适应高度 + 传统布局 */
@media (max-width: 768px) {
  .message-board-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}

/* 添加背景渐变文字 */
.message-board-page::before {
  content: "Messages";
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



/* 内层容器 - 与其他组件保持一致 */
.message-board-inner {
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

.message-board-inner:hover {
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

/* 留言板内容样式 */
.message-board-content {
  padding: 20px 0;
}

/* 留言加载状态 */
.loading-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px 0;
  color: var(--icon-primary, #5e60ce);
}

.loading-issues i {
  font-size: 2.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 留言容器样式 */
.issues-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  width: 80%; /* 设置为80%宽度 */
  margin-left: auto; /* 水平居中 */
  margin-right: auto; /* 水平居中 */
}

.issue-item {
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.8));
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px var(--card-shadow, rgba(91, 81, 200, 0.1));
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.issue-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px var(--card-shadow, rgba(91, 81, 200, 0.15));
}

.issue-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.issue-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.issue-meta {
  display: flex;
  flex-direction: column;
}

.issue-author {
  font-weight: 600;
  color: var(--icon-primary, #5e60ce);
  font-size: 1rem;
  margin-bottom: 3px;
}

.issue-date {
  font-size: 0.8rem;
  color: var(--text-color, #666);
  opacity: 0.8;
}

.issue-body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color, #333);
  margin-bottom: 15px;
}

/* 留言内容样式 */
.issue-body :deep(.message-content) {
  position: relative;
  padding-left: 12px;
  border-left: 3px solid var(--icon-primary, #5e60ce);
}

.issue-body :deep(.message-text) {
  margin-bottom: 12px;
}

.issue-body :deep(.message-text p) {
  margin: 0.7em 0;
}

.issue-body :deep(.reply-tag) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.issue-body :deep(.reply-tag.reply-wanted) {
  background-color: rgba(94, 96, 206, 0.1);
  color: var(--icon-primary, #5e60ce);
}

.issue-body :deep(.reply-tag.no-reply-needed) {
  background-color: rgba(107, 178, 103, 0.1);
  color: #6bb267;
}

.issue-link {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--icon-primary, #5e60ce);
  text-decoration: none;
  transition: all 0.2s ease;
}

.issue-link:hover {
  color: var(--icon-accent, #6b90ff);
  text-decoration: underline;
}

/* 无留言状态 */
.no-issues {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.no-issues p {
  font-size: 1.1rem;
  color: var(--text-color, #666);
}

/* 留言操作区域 */
.message-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.message-board-link {
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
}

.message-board-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(91, 81, 200, 0.4));
}

.message-board-link i {
  font-size: 1.2rem;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--icon-accent, #6b90ff);
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s;
}

.view-all-link:hover {
  transform: translateX(5px);
  color: var(--icon-primary, #5e60ce);
}

.message-tip {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-color, #666);
  margin-top: 20px;
  font-style: italic;
}

/* 主题适配 */
:root[data-theme="dark"] .message-board-page {
  background: var(--card-bg, rgba(40, 40, 40, 0.8));
}

:root[data-theme="dark"] .message-board-inner {
  background: 
    linear-gradient(var(--card-bg, #212121), var(--card-bg, #212121)) padding-box,
    linear-gradient(to right, var(--border-gradient, #9b8dda, #6b90ff, #7294d5, #b98db6)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0, 0, 0, 0.3));
}

:root[data-theme="dark"] .message-board-inner:hover {
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0, 0, 0, 0.4));
}

/* 响应式处理 */
@media (max-width: 768px) {
  .message-board-container {
    padding: 30px 0;
  }
  
  .message-board-container::before {
    font-size: 10rem; /* 移动端上减小背景文字尺寸 */
  }
  
  .message-board-inner {
    padding: 20px;
    width: 83%;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .message-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .message-board-link, .view-all-link {
    width: 100%;
    justify-content: center;
  }
  
  .issues-container {
    width: 95%; /* 在小屏幕上增加宽度比例 */
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .message-board-page {
    padding: 20px 0; /* 和角色选择页面保持一致 */
  }
  
  .message-board-inner {
    width: 95%; /* 和Records页面一致 */
    padding: 15px; /* 减少内边距 */
    margin: 10px auto;
  }
  
  .section-title {
    font-size: 1.4rem; /* 进一步缩小标题 */
  }
  
  .section-subtitle {
    font-size: 0.85rem;
  }
  
  .issue-item {
    padding: 12px; /* 减少留言项间距 */
  }
  
  .issue-author {
    font-size: 0.9rem;
  }
  
  .issue-body {
    font-size: 0.9rem;
  }
  
  .message-board-link {
    padding: 10px 20px; /* 减少按钮内边距 */
    font-size: 0.9rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .message-board-inner {
    width: 98%; /* 和Records页面一致 */
    padding: 12px; /* 进一步减少内边距 */
    margin: 5px auto;
  }
  
  .section-title {
    font-size: 1.2rem; /* 最小标题尺寸 */
  }
  
  .issue-item {
    padding: 10px; /* 最小留言项间距 */
  }
  
  .message-board-link {
    padding: 8px 16px; /* 最小按钮内边距 */
    font-size: 0.85rem;
  }
}
</style> 