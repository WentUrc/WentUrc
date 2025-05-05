<template>
  <div class="profile-container" :class="{ 'image-loaded': backgroundLoaded }">
    <!-- 进度条加载指示器 -->
    <div class="github-progress-container" v-if="!backgroundLoaded && !backgroundError">
      <div class="github-progress-bar" :style="{width: loadingProgress + '%'}"></div>
    </div>
    
    <!-- 添加背景图层，实现平滑过渡 -->
    <div class="background-layer gradient-bg"></div>
    <div class="background-layer image-bg" :style="imageBackground"></div>
    
    <!-- 卡片翻转容器 -->
    <div class="flip-container" :class="{ 'flipped': isFlipped }">
      <!-- 个人资料卡片 - 正面 -->
      <div class="profile-card card-front">
        <!-- 添加翻转按钮 -->
        <button class="flip-btn" @click="flipCard" title="查看友链喵～">
          <i class="fas fa-share-alt"></i>
        </button>
        
        <img :src="avatar" :alt="`用户 ${name} 的头像`" class="avatar" />
        <h2 class="name">{{ name }}</h2>
        <p class="bio">{{ bio }}</p>
        <div class="social-links">
          <a
            v-for="(link, index) in socialLinks"
            :key="index"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="link.title"
            :aria-label="link.title"
          >
            <i :class="link.iconClass"></i>
          </a>
        </div>
      </div>

      <!-- 友情链接 - 背面 -->
      <div class="profile-card card-back">
        <!-- 添加翻转回来按钮 -->
        <button class="flip-btn" @click="flipCard" title="返回主页喵～">
          <i class="fas fa-user"></i>
        </button>
        
        <h2 class="back-title">友情链接喵～</h2>
        
        <div class="friend-links">
          <a 
            v-for="(friend, index) in friendLinks" 
            :key="index"
            :href="friend.url"
            target="_blank"
            rel="noopener noreferrer"
            class="friend-link"
          >
            <img :src="friend.avatar" :alt="`${friend.name}的头像`" class="friend-avatar" />
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
              <span class="friend-desc">{{ friend.description }}</span>
            </div>
          </a>
        </div>
        
        <!-- 添加留言板入口 -->
        <div class="message-board-container">
          <h3 class="message-title">留言板喵～</h3>
          
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
            
            <!-- 新增: 添加留言按钮区域 -->
            <div class="add-message-container">
              <a :href="createIssueUrl" target="_blank" rel="noopener noreferrer" class="message-board-link new-message-btn">
                <i class="fas fa-plus"></i>
                <span>写下新留言喵～</span>
              </a>
            </div>
            
            <!-- 查看更多按钮 -->
            <a :href="repoIssuesUrl" target="_blank" rel="noopener noreferrer" class="view-all-issues">
              查看全部留言 <i class="fas fa-arrow-right"></i>
            </a>
          </div>
          
          <!-- 无留言或加载失败状态 -->
          <div v-else class="no-issues">
            <p>{{ issuesError ? '加载留言失败了喵～' : '暂时没有留言喵～' }}</p>
            <a :href="createIssueUrl" target="_blank" rel="noopener noreferrer" class="message-board-link">
              <i class="fas fa-comments"></i>
              <span>成为第一个留言的人喵～</span>
            </a>
            <p class="message-tip">留言需要 GitHub 账号喔～</p>
          </div>
        </div>
        
        <p class="back-note">欢迎交换友链喵～</p>
      </div>
    </div>

    <!-- 添加底部箭头 -->
    <div class="arrow-down" @click="scrollToBottom">
      <i class="fas fa-chevron-down"></i>
    </div>
  </div>
</template>

<script>
import notificationService from '../../utils/notificationService.js';
import friendLinksData from '../../assets/data/friendLinks.json';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default {
  name: 'ProfileCard',
  data() {
    return {
      avatar: 'https://avatars.githubusercontent.com/u/74816859?v=4',
      name: '冰苷晶',
      bio: '路很长，梦还在',
      isFlipped: false,
      socialLinks: [
        {
          url: 'https://github.com/IGCrystal',
          title: 'GitHub',
          iconClass: 'fab fa-github'
        },
        {
          url: 'https://space.bilibili.com/523637242',
          title: '哔哩哔哩',
          iconClass: 'fab fa-bilibili'
        },
        {
          url: 'mailto:tu4tu23min@outlook.com',
          title: '邮箱',
          iconClass: 'far fa-envelope'
        }
      ],
      // 从导入的JSON文件获取友情链接数据
      friendLinks: friendLinksData,
      backgroundLoaded: false,
      backgroundError: false,
      backgroundUrl: 'https://api.wenturc.com/', 
      loadingProgress: 0, 
      loadingTimer: null,
      navBarHeight: 60, // 导航栏高度
      // 添加Issues相关数据
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
    imageBackground() {
      return {
        backgroundImage: `url(${this.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      };
    },
    
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
    handleBackgroundLoad() {
      this.loadingProgress = 100;
      setTimeout(() => {
        this.backgroundLoaded = true;
        this.backgroundError = false;
        if (this.loadingTimer) {
          clearInterval(this.loadingTimer);
          this.loadingTimer = null;
        }
      }, 300);
    },
    handleBackgroundError() {
      this.backgroundLoaded = false;
      this.backgroundError = true;

      notificationService.error('背景图片加载失败了喵～');
      
      console.error('背景图片加载失败');
      if (this.loadingTimer) {
        clearInterval(this.loadingTimer);
        this.loadingTimer = null;
      }
    },
    scrollToBottom() {
      const profileElement = this.$el;
      const elementBottom = profileElement.offsetTop + profileElement.offsetHeight;
      window.scrollTo({
        top: elementBottom - this.navBarHeight,
        behavior: 'smooth'
      });
    },
    simulateLoadingProgress() {
      this.loadingTimer = setInterval(() => {
        if (this.loadingProgress < 90) {
          const increment = Math.max(0.5, 10 - (this.loadingProgress / 10));
          this.loadingProgress += increment;
        }
      }, 200);
    },
    flipCard() {
      this.isFlipped = !this.isFlipped;
      
      // 当翻转到背面时加载Issues
      if (this.isFlipped) {
        notificationService.info('交个朋友喵～');
        this.loadIssues();
      }
    },
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
        // 提取留言内容
        let message = '';
        const messageMatch = body.match(/\*\*✨ 留言内容\*\*([\s\S]*?)(?:---|$)/);
        if (messageMatch && messageMatch[1]) {
          message = messageMatch[1].trim();
        }
        
        // 提取回复选项 - 修改这部分以修复勾选框问题
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
          // 将留言内容转换为HTML (排除模板自身的指令部分)
          // 确保去除与勾选框相关的部分，避免被渲染为列表项
          const cleanedMessage = message.replace(/^-\s*\[\s*[xX\s]?\s*\].*$/gm, '');
          const messageHtml = marked(cleanedMessage);
          html += `<div class="message-text">${DOMPurify.sanitize(messageHtml)}</div>`;
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
        return html;
      } catch (error) {
        console.error('解析留言模板失败:', error);
        return null;
      }
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
        // 调用GitHub API获取issues - 使用动态仓库信息
        const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?state=open&sort=created&direction=desc&per_page=5`);
        
        if (!response.ok) {
          throw new Error(`GitHub API 返回错误: ${response.status}`);
        }
        
        const data = await response.json();
        this.issues = data.filter(issue => !issue.pull_request); // 过滤掉Pull Requests
        this.issuesCacheTime = now;
      } catch (error) {
        console.error('加载Issues失败:', error);
        this.issuesError = error.message;
        notificationService.error('加载留言失败了喵～');
      } finally {
        this.isLoadingIssues = false;
      }
    }
  },
  mounted() {
    this.simulateLoadingProgress();
    const logoElement = document.querySelector('.logo-banner');
    if (logoElement) {
      this.navBarHeight = logoElement.offsetHeight;
    }
    
    const img = new Image();
    img.onload = this.handleBackgroundLoad;
    img.onerror = this.handleBackgroundError;
    img.src = this.backgroundUrl;
  }
};
</script>

<style scoped>
/* 整体容器 */
.profile-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

/* 卡片翻转容器 */
.flip-container {
  perspective: 1000px;
  width: 30%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  height: auto;
}

/* 当翻转时增加容器高度，为友链提供更多空间 */
.flip-container.flipped {
  height: auto;
  min-height: 500px; /* 增加翻转后的最小高度 */
}

.flip-container.flipped .card-front {
  transform: rotateY(180deg);
}

.flip-container.flipped .card-back {
  transform: rotateY(0deg);
  height: 100%;
  overflow-y: auto; /* 如果内容过多，允许滚动 */
}

@media (max-width: 768px) {
  .flip-container {
    width: 90%;
  }
  .flip-container.flipped {
    min-height: 450px; /* 移动端稍微减少高度 */
  }
}

/* 个人资料卡片 - 共享样式 */
.profile-card {
  position: relative;
  z-index: 1;
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  text-align: center;
  opacity: 0.9;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.6s ease;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0,0,0,0.1));
  border: 4px solid transparent;
  background: 
    linear-gradient(var(--card-bg, white), var(--card-bg, white)) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
  transform-style: preserve-3d; /* 确保3D效果 */
  backface-visibility: hidden; /* 隐藏背面 */
}

/* 翻转按钮样式 */
.flip-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px var(--card-shadow, rgba(91, 81, 200, 0.3));
}

.flip-btn:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 5px 12px var(--card-shadow, rgba(91, 81, 200, 0.5));
}

/* 卡片正面 */
.card-front {
  transform: rotateY(0deg);
  z-index: 2; /* 确保正面在上方 */
}

/* 卡片背面 */
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transform: rotateY(180deg); /* 初始时翻转 */
  min-height: 100%;
  width: 100%;
  overflow-y: auto;
  z-index: 1; /* 确保背面在下方 */
}

/* 背面标题 - 调整间距 */
.back-title {
  font-size: 1.5rem;
  color: var(--icon-primary, #5e60ce);
  margin-bottom: 25px;
  background: var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6b90ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 友情链接样式 - 增加一些间距 */
.friend-links {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 25px;
  padding-bottom: 10px;
}

.friend-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 10px;
  border-radius: 10px;
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.8));
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--card-shadow, rgba(91, 81, 200, 0.1));
}

.friend-link:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px var(--card-shadow, rgba(91, 81, 200, 0.2));
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid transparent;
  background: 
    var(--card-bg, white) padding-box,
    var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6b90ff)) border-box;
}

.friend-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
}

.friend-name {
  font-weight: 600;
  color: var(--icon-primary, #5e60ce);
  margin-bottom: 3px;
  font-size: 0.9rem;
}

.friend-desc {
  color: var(--text-color, #666);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.back-note {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed var(--divider-color, rgba(94, 96, 206, 0.2));
  font-style: italic;
  color: var(--icon-accent, #6b90ff);
  font-size: 0.9rem;
}

/* 留言板样式 */
.message-board-container {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed var(--divider-color, rgba(94, 96, 206, 0.2));
}

.message-title {
  font-size: 1.2rem;
  color: var(--icon-primary, #5e60ce);
  margin-bottom: 15px;
  background: var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6b90ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 留言加载状态 */
.loading-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 0;
  color: var(--icon-primary, #5e60ce);
}

.loading-issues i {
  font-size: 2rem;
}

/* Issues容器 */
.issues-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.issue-item {
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.8));
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px var(--card-shadow, rgba(91, 81, 200, 0.1));
  text-align: left;
}

.issue-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.issue-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.issue-meta {
  display: flex;
  flex-direction: column;
}

.issue-author {
  font-weight: 600;
  color: var(--icon-primary, #5e60ce);
  font-size: 0.9rem;
}

.issue-date {
  font-size: 0.75rem;
  color: var(--text-color, #666);
  opacity: 0.8;
}

.issue-body {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-color, #333);
  margin-bottom: 10px;
  /* 允许解析的HTML样式 */
}

.issue-body img {
  max-width: 100%;
  height: auto;
}

.issue-body a {
  color: var(--icon-accent, #6b90ff);
  text-decoration: none;
}

.issue-link {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--icon-primary, #5e60ce);
  text-decoration: none;
}

.issue-link:hover {
  text-decoration: underline;
}

.view-all-issues {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 15px;
  color: var(--icon-accent, #6b90ff);
  text-decoration: none;
  padding: 8px 0;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.view-all-issues:hover {
  transform: translateX(5px);
}

/* 无留言状态 */
.no-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.no-issues p {
  margin-bottom: 15px;
  color: var(--text-color, #666);
}

.message-board-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 30px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--card-shadow, rgba(91, 81, 200, 0.3));
  margin: 10px auto;
}

.message-board-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(91, 81, 200, 0.4));
}

.message-board-link i {
  font-size: 1.2rem;
}

.message-tip {
  font-size: 0.8rem;
  color: var(--text-color, #666);
  margin-top: 10px;
  font-style: italic;
}

/* 留言内容样式 */
.message-content {
  position: relative;
  padding-left: 5px;
  border-left: 3px solid var(--icon-primary, #5e60ce);
}

.message-text {
  margin-bottom: 10px;
}

.message-text p {
  margin: 0.5em 0;
}

.reply-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-top: 5px;
}

.reply-wanted {
  background-color: rgba(94, 96, 206, 0.1);
  color: var(--icon-primary, #5e60ce);
}

.no-reply-needed {
  background-color: rgba(107, 178, 103, 0.1);
  color: #6bb267;
}

.issue-body h1, .issue-body h2, .issue-body h3 {
  font-size: 1em;
  margin: 0.8em 0 0.4em 0;
}

.issue-body ul, .issue-body ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.issue-body ul li, .issue-body ol li {
  margin-bottom: 0.2em;
}

.issue-body pre, .issue-body code {
  background: var(--code-bg, rgba(0, 0, 0, 0.05));
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.issue-body blockquote {
  border-left: 3px solid var(--text-color, #666);
  padding-left: 0.8em;
  margin: 0.5em 0;
  color: var(--text-color, #666);
  opacity: 0.8;
}

/* 新增: 添加留言按钮区域 */
.add-message-container {
  margin: 15px 0 10px;
  display: flex;
  justify-content: center;
}

.new-message-btn {
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  padding: 8px 16px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.new-message-btn i {
  font-size: 1rem;
}

.new-message-btn:hover {
  opacity: 1;
  transform: translateY(-3px) scale(1.02);
}

/* 修复勾选框样式 */
.message-content ul {
  list-style-type: none;
  padding-left: 0;
}

.message-content li {
  position: relative;
  padding-left: 1.5em;
}

/* 保留现有样式 */
.github-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 99999;
  overflow: hidden;
}

.github-progress-bar {
  height: 100%;
  background: var(--primary-gradient, linear-gradient(to right, #dcbff8, #5e60ce, #6930c3));
  width: 0;
  transition: width 0.2s ease;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px var(--card-shadow, rgba(94, 96, 206, 0.5));
}

@keyframes progress-animation {
  0% {
    left: -30%;
    width: 30%;
  }
  50% {
    width: 30%;
  }
  70% {
    width: 70%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 1.2s ease-in-out;
}

.gradient-bg {
  background: var(--primary-gradient, linear-gradient(45deg, #dcbff8, #d1ecf9));
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  opacity: 1;
  z-index: 0;
}

.image-bg {
  opacity: 0;
  z-index: 0;
}

.image-loaded .gradient-bg {
  opacity: 0;
}

.image-loaded .image-bg {
  opacity: 1;
}

.profile-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  z-index: 2;
  border: 4px solid transparent;
  background: 
    var(--card-bg, white) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
}

.name {
  font-size: 1.8rem;
  color: var(--text-color, #333);
  margin-bottom: 10px;
}

.bio {
  font-size: 1rem;
  color: var(--text-color, #666);
  line-height: 1.5;
  margin-bottom: 20px;
}

.social-links a {
  color: var(--icon-primary, #5e60ce);
  font-size: 1.5rem;
  margin: 0 10px;
  transition: color 0.3s;
}

.social-links a:hover {
  color: var(--icon-accent, #6930c3);
}

.arrow-down {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: var(--icon-primary, #7d7fff);
  animation: bounce 2s infinite;
  cursor: pointer;
  z-index: 4;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes moveGradient {
  0% { background-position: 0% 0%, 0% 50%; }
  50% { background-position: 0% 0%, 100% 50%; }
  100% { background-position: 0% 0%, 0% 50%; }
}

/* 小屏幕响应 */
@media (max-width: 768px) {
  .profile-card {
    width: 90%;
    padding: 20px;
  }
  .friend-desc {
    max-width: 150px; /* 移动端屏幕较窄，减少描述长度 */
  }
}
</style>
