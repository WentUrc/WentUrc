<template>
  <section class="about-section" ref="root" :class="{ 'in-view': inView }">
    <div class="about-inner">
      <div class="about-left">
        <div class="avatar-wrap">
          <div class="avatar-glow"></div>
          <img class="avatar" src="/favicon.webp" alt="我的头像" />
        </div>
        <div class="socials">
          <a href="https://github.com/IGCrystal-NEO" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
          <a href="https://space.bilibili.com/523637242" target="_blank" rel="noopener" title="Bilibili" aria-label="Bilibili">
            <i class="fab fa-bilibili"></i>
          </a>
          <a href="mailto:tu4tu23min@outlook.com" title="Email" aria-label="Email">
            <i class="far fa-envelope"></i>
          </a>
        </div>
      </div>
      <div class="about-right">
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab==='about' }" @click="activeTab='about'" type="button">关于</button>
          <button class="tab" :class="{ active: activeTab==='friends' }" @click="activeTab='friends'" type="button">友链</button>
          <button class="tab" :class="{ active: activeTab==='board' }" @click="activeTab='board'" type="button">留言板</button>
        </div>

        <div class="tab-content">
          <div v-show="activeTab==='about'" class="tab-panel">
            <div class="heading">
              <h2 class="title">关于我</h2>
              <p class="subtitle">路很长，梦还在 · 记录和创造</p>
            </div>

            <p class="intro">
              嗨，我是 IGCrystal。喜欢把想法变成可以触碰的东西，想办法留住那些转瞬即逝的美好。<br>
              我的本专业是建筑方面的，前端开发只是爱好。我也会尝试一些新的东西。
            </p>

            <div class="chips">
              <span class="chip">前端开发</span>
              <span class="chip">交互动效</span>
              <span class="chip">视觉设计</span>
              <span class="chip">性能优化</span>
            </div>

            <div class="card-grid">
              <div class="info-card">
                <div class="card-icon"><i class="fas fa-compass"></i></div>
                <div class="card-content">
                  <h3 class="card-title">喜欢的游戏</h3>
                  <p>喜欢玩音游，玩过 Arcaea、Phigros、旋转音律等等。其实没有玩过maimai，但是很喜欢maimai，姑且算个云玩家吧。</p>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon"><i class="fas fa-layer-group"></i></div>
                <div class="card-content">
                  <h3 class="card-title">现在在做</h3>
                  <p>最近的日子几乎都被学习填满了，时间像被调成了倍速播放，一眨眼就到晚上。偶尔画一点画，让大脑从公式和文字里偷溜出来透口气。</p>
                </div>
              </div>
              <div class="info-card">
                <div class="card-icon"><i class="fas fa-heart"></i></div>
                <div class="card-content">
                  <h3 class="card-title">喜欢的东西</h3>
                  <p>好想养一只猫猫，毛茸茸又软乎乎的，让人忍不住想伸手rua两下，再听它咕噜咕噜地撒娇。</p>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab==='friends'" class="tab-panel">
            <div class="heading">
              <h2 class="title">朋友们</h2>
              <p class="subtitle">一些可爱的喵喵们</p>
            </div>

            <div class="friends-grid">
              <a v-for="(f,idx) in friendLinks" :key="idx" class="friend-card" :href="f.url" target="_blank" rel="noopener">
                <img class="friend-avatar" :src="f.avatar" :alt="f.name" loading="lazy" decoding="async" />
                <div class="friend-meta">
                  <div class="friend-name">{{ f.name }}</div>
                  <div class="friend-desc">{{ f.description }}</div>
                </div>
              </a>
            </div>
          </div>

          <div v-show="activeTab==='board'" class="tab-panel">
            <div class="heading">
              <h2 class="title">留言板</h2>
              <p class="subtitle">在这里留下你的足迹</p>
            </div>
            <div class="board-stats" v-if="issues && issues.length">
              <span class="count"><i class="fas fa-message"></i> {{ issues.length }} 条留言</span>
            </div>
            <div class="board-wrap">
              <div v-if="isLoadingIssues" class="loading-issues">
                <i class="fas fa-spinner fa-spin"></i>
                <span>正在加载留言</span>
              </div>

              <div v-else-if="issues.length > 0" class="issues-container">
                <div v-for="issue in limitedIssues" :key="issue.id" class="issue-item">
                  <div class="issue-header">
                    <div class="avatar-ring">
                      <img :src="issue.user.avatar_url" :alt="issue.user.login" class="issue-avatar" />
                    </div>
                    <div class="issue-meta">
                      <span class="issue-author">{{ issue.user.login }}</span>
                      <span class="issue-date">{{ formatDate(issue.created_at) }}</span>
                    </div>
                  </div>
                  <div class="issue-body" v-html="formatIssueBody(issue.body)"></div>
                  <div class="issue-footer">
                    <a :href="issue.html_url" target="_blank" rel="noopener noreferrer" class="issue-link">
                      查看详情 <i class="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div v-else class="no-issues">
                <p>{{ issuesError ? '加载留言失败了' : '暂时没有留言' }}</p>
              </div>

              <div class="message-actions">
                <a :href="createIssueUrl" target="_blank" rel="noopener noreferrer" class="message-board-link">
                  <i class="fas fa-comments"></i>
                  <span>{{ issues.length > 0 ? '写下新留言' : '成为第一个留言的人' }}</span>
                </a>
                <a v-if="issues.length > 0" :href="repoIssuesUrl" target="_blank" rel="noopener noreferrer" class="view-all-link">
                  查看全部留言 <i class="fas fa-arrow-right"></i>
                </a>
              </div>
              <p class="message-tip">留言需要 GitHub 账号喔～</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import friendLinks from '../../assets/data/friendLinks.json'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import notificationService from '../../utils/notificationService.js'
export default {
  name: 'AboutMe',
  data() {
    return {
      inView: false,
      _observer: null,
      activeTab: 'about',
      friendLinks: friendLinks,
      // board state
      issues: [],
      isLoadingIssues: false,
      issuesError: null,
      issuesCacheTime: 0,
      issuesCacheDuration: 5 * 60 * 1000,
      repoOwner: 'Wenturc',
      repoName: 'WentUrc-v2-site',
      _boardLoadedOnce: false,
      issuesDisplayLimit: 6,
    }
  },
  computed: {
    repoBaseUrl() { return `https://github.com/${this.repoOwner}/${this.repoName}` },
    repoIssuesUrl() { return `${this.repoBaseUrl}/issues` },
    createIssueUrl() { return `${this.repoBaseUrl}/issues/new?template=message_board.yml` },
    limitedIssues() { return Array.isArray(this.issues) ? this.issues.slice(0, this.issuesDisplayLimit) : []; },
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'board' && !this._boardLoadedOnce) {
        this.loadIssues()
      }
    }
  },
  mounted() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      this.inView = true
    }
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.inView = entry.isIntersecting && entry.intersectionRatio > 0.15
      })
    }, { threshold: [0, 0.15, 0.5, 0.75] })
    if (this.$refs.root) {
      this._observer.observe(this.$refs.root)
    }
  },
  beforeUnmount() {
    if (this._observer && this.$refs.root) {
      this._observer.unobserve(this.$refs.root)
    }
    if (this._observer) {
      this._observer.disconnect()
      this._observer = null
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    formatIssueBody(body) {
      if (!body) return ''
      const parsed = this.parseMessageTemplate(body)
      if (parsed) return parsed
      let shortened = body
      if (body.length > 200) shortened = body.substring(0, 200) + '...'
      const html = marked(shortened)
      return DOMPurify.sanitize(html)
    },
    parseMessageTemplate(body) {
      const isYaml = body.includes('### ✨ 留言内容') || body.includes('### 💡 是否想收到回复？')
      const isMd = body.includes('**✨ 留言内容**') || body.includes('**💡 是否想收到回复？**')
      if (!isYaml && !isMd) return null
      try {
        let message = ''
        let match
        if (isYaml) {
          match = body.match(/### ✨ 留言内容\s*\n([\s\S]*?)(?:### 💡|$)/)
        } else {
          match = body.match(/\*\*✨ 留言内容\*\*([\s\S]*?)(?:\*\*��|---|$)/)
        }
        if (match && match[1]) {
          message = match[1].trim()
          if (isMd) {
            message = message.replace(/请在这里写下你想说的话本猫会偷偷看一眼的！/, '').replace(/^[\s\n]+/, '')
          }
        }
        let wantsReply = null
        if (body.includes('- [x] 是') || body.includes('- [X] 是')) wantsReply = true
        else if (body.includes('- [x] 不用了') || body.includes('- [X] 不用了')) wantsReply = false
        let html = `<div class="message-content">`
        if (message && message.trim()) {
          if (isMd) {
            message = message.replace(/^-\s*\[\s*[xX\s]?\s*\].*$/gm, '').replace(/^\s*\*\*.*?\*\*\s*$/gm, '').replace(/^---.*$/gm, '')
          }
          if (message.trim()) {
            const msgHtml = marked(message)
            html += `<div class="message-text">${DOMPurify.sanitize(msgHtml)}</div>`
          }
        }
        if (wantsReply !== null) {
          const cls = wantsReply ? 'reply-wanted' : 'no-reply-needed'
          const txt = wantsReply ? '<i class="fas fa-comment-dots"></i> 希望可以回复一下喵~' : '<i class="fas fa-check-circle"></i> 唔，我看看就好喵~'
          html += `<div class="reply-tag ${cls}">${txt}</div>`
        }
        html += `</div>`
        return html.includes('<div class="message-text">') ? html : null
      } catch (e) { return null }
    },
    getAuthHeaders() {
      const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'WentUrc-App' }
      const token = localStorage.getItem('github-token')
      if (token) headers['Authorization'] = `token ${token}`
      return headers
    },
    async loadIssues() {
      const now = Date.now()
      if (this.issues.length > 0 && now - this.issuesCacheTime < this.issuesCacheDuration) { this._boardLoadedOnce = true; return }
      this.isLoadingIssues = true; this.issuesError = null
      try {
        const resp = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?labels=留言板&sort=created&direction=desc&per_page=10`, { headers: this.getAuthHeaders() })
        if (!resp.ok) {
          const reset = resp.headers.get('X-RateLimit-Reset'); const remain = resp.headers.get('X-RateLimit-Remaining')
          if (resp.status === 403) throw new Error(`GitHub API 限制 剩余:${remain} 重置:${reset ? new Date(reset*1000).toLocaleTimeString() : '未知'}`)
          if (resp.status === 401) throw new Error('GitHub Token 无效或权限不足')
          if (resp.status === 404) throw new Error('仓库或Issues不存在')
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
        }
        const data = await resp.json()
        this.issues = data; this.issuesCacheTime = now; this._boardLoadedOnce = true
      } catch (e) {
        this.issuesError = e.message
        notificationService.error(`加载留言失败：${this.getFriendlyErrorMessage(e)}`)
      } finally { this.isLoadingIssues = false }
    },
    getFriendlyErrorMessage(error) {
      const msg = String(error && error.message || error)
      if (msg.includes('403')) return 'GitHub API 访问受限，请稍后重试'
      if (msg.includes('404')) return '找不到仓库或Issues，请检查配置'
      if (msg.includes('Network')) return '网络连接失败，请检查网络后重试'
      return '未知错误，请稍后重试'
    }
  }
}
</script>

<style scoped>
.about-section {
  height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: var(--page-bg, rgba(255, 255, 255, 0.02));
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.about-inner {
  height: 100%;
  max-width: 1200px;
  margin: -30px auto 0; /* 向上微调 */
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: clamp(16px, 4vw, 40px);
  align-items: center;
}

/* 左列：头像与社交 */
.about-left { position: relative; isolation: isolate; }
.avatar-wrap { z-index: 0; }
.socials { position: relative; z-index: 2; }

.avatar-wrap {
  position: relative;
  width: clamp(160px, 32vmin, 240px);
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.avatar { width: 100%; height: 100%; object-fit: cover; display: block; }

.avatar-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(40% 40% at 30% 30%, rgba(147, 197, 253, 0.35), transparent 70%),
              radial-gradient(45% 45% at 70% 60%, rgba(96, 165, 250, 0.35), transparent 70%);
  filter: blur(24px);
  z-index: -1;
}

.socials {
  display: flex;
  gap: 14px;
  margin-top: 16px;
}
.socials a { width: 40px; height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: var(--icon-primary, #1e90ff); background: var(--card-bg, rgba(255, 255, 255, 0.08)); box-shadow: 0 6px 16px rgba(0,0,0,0.12); transition: color .2s ease, background .2s ease, box-shadow .2s ease; }
.socials a:hover { color: var(--icon-accent, #73c2fb); background: var(--button-hover, rgba(30,144,255,.08)); }
.socials a, .socials a:hover, .socials a:focus { text-decoration: none; }

/* 右列：标题与内容 */
.about-right { text-align: left; display: flex; flex-direction: column; align-items: stretch; }
.tabs { display: flex; gap: 8px; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--divider-color, rgba(148,163,184,.25)); }
.tab { padding: 8px 14px; border-radius: 999px; border: 1px solid var(--divider-color, rgba(148,163,184,.25)); background: var(--card-bg, rgba(255,255,255,.06)); color: var(--text-color, #334155); cursor: pointer; transition: background .2s ease, color .2s ease, border-color .2s ease; }
.tab:hover { background: var(--button-hover, rgba(30,144,255,.08)); }
.tab.active { color: var(--icon-primary, #1e90ff); border-color: var(--icon-primary, rgba(30,144,255,.45)); background: var(--button-hover, rgba(30,144,255,.08)); }
.tab-panel { animation: fadeIn .25s ease; }

/* Fixed-height content area to avoid layout shifts (desktop) */
.tab-content { position: relative; height: clamp(360px, 56vh, 600px); overflow: hidden; overscroll-behavior: contain; }
.tab-panel { position: absolute; inset: 0; overflow: auto; padding-right: 4px; animation: fadeIn .25s ease; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; -ms-overflow-style: none; }
.tab-panel::-webkit-scrollbar { width: 0; height: 0; }

.heading { text-align: left; }
.title { font-size: clamp(24px, 4vw, 36px); margin: 0 0 6px; font-weight: 800; background: var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { margin: 0; color: var(--text-secondary, #6b7280); font-size: 14px; }

.intro { margin: 18px 0 14px; color: var(--text-color, #444); line-height: 1.8; }

.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip { padding: 6px 10px; font-size: 12px; border-radius: 999px; background: var(--button-hover, rgba(30,144,255,0.08)); color: var(--icon-primary, #1e90ff); }

.card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.info-card { text-align: left; padding: 16px; border-radius: 14px; background: linear-gradient(var(--card-bg, rgba(255,255,255,0.8)), var(--card-bg, rgba(255,255,255,0.8))) padding-box, linear-gradient(90deg, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box; border: 2px solid transparent; box-shadow: 0 10px 24px rgba(0,0,0,0.08); transition: transform .2s ease, box-shadow .2s ease; }
.info-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(0,0,0,0.12); }
.card-icon { font-size: 18px; color: var(--icon-accent, #73c2fb); margin-bottom: 8px; }
.card-title { font-size: 16px; font-weight: 600; color: var(--text-color, #444); }
.card-content h3 { margin: 0 0 6px; font-size: 16px; }
.card-content p { margin: 0; color: var(--text-secondary, #666); line-height: 1.7; }

/* Friends */
.friends-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; margin-top: 12px; }
.friend-card { display: grid; grid-template-columns: 56px 1fr; gap: 10px; padding: 12px; border-radius: 14px; background: var(--card-bg, rgba(255,255,255,0.08)); border: 1px solid var(--divider-color, rgba(148,163,184,.25)); text-decoration: none; color: inherit; align-items: center; transition: background .2s ease, border-color .2s ease; }
.friend-card:hover { background: var(--button-hover, rgba(30,144,255,.08)); border-color: var(--icon-primary, rgba(30,144,255,.35)); }
.friend-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; display: block; }
.friend-meta { min-width: 0; }
.friend-name { font-weight: 700; color: var(--text-color, #334155); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.friend-desc { color: var(--text-secondary, #64748b); font-size: 13px; line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* Board minimal styles to fit current card design */
.board-wrap { padding-top: 4px; }
.loading-issues { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 18px 0; color: var(--icon-primary, #1e90ff); }
.loading-issues i { font-size: 1.6rem; }
.issues-container { display: flex; flex-direction: column; gap: 12px; }
.issue-item { background: var(--card-bg, rgba(255,255,255,0.08)); border: 1px solid var(--divider-color, rgba(148,163,184,.25)); border-radius: 12px; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.issue-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.issue-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.issue-meta { display: flex; flex-direction: column; }
.issue-author { font-weight: 600; color: var(--icon-primary, #1e90ff); }
.issue-date { font-size: 12px; color: var(--text-secondary, #64748b); }
.issue-body { font-size: 14px; line-height: 1.7; color: var(--text-color, #334155); }
.issue-body :deep(.message-content) { position: relative; padding-left: 10px; border-left: 3px solid var(--icon-primary, #1e90ff); }
.issue-body :deep(.reply-tag) { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 999px; font-size: 12px; margin-top: 6px; }
.issue-body :deep(.reply-tag.reply-wanted) { background: rgba(30,144,255,.12); color: var(--icon-primary, #1e90ff); }
.issue-body :deep(.reply-tag.no-reply-needed) { background: rgba(16,185,129,.12); color: #10b981; }
.issue-link { display: inline-flex; align-items: center; gap: 6px; color: var(--icon-primary, #1e90ff); text-decoration: none; margin-top: 8px; font-size: 13px; }
.issue-link:hover { text-decoration: underline; }
.message-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 12px; }
.message-board-link { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff)); color: #fff; text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.view-all-link { display: inline-flex; align-items: center; gap: 6px; color: var(--icon-accent, #73c2fb); text-decoration: none; font-size: 14px; }
.message-tip { font-size: 12px; color: var(--text-secondary, #64748b); margin-top: 6px; }

/* enhancements for board visuals */
.board-stats { display: flex; align-items: center; gap: 10px; margin: 4px 0 8px; color: var(--text-secondary, #64748b); }
.board-stats .count { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: rgba(148,163,184,.12); }

.issues-container { gap: 16px; }
.issue-item { position: relative; background: var(--card-bg, rgba(255,255,255,0.08)); border-radius: 14px; padding: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
.issue-item:hover { transform: translateY(-2px); border-color: rgba(30,144,255,.35); box-shadow: 0 10px 24px rgba(0,0,0,0.12); }

.issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.avatar-ring { width: 40px; height: 40px; border-radius: 999px; padding: 2px; background: var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff)); }
.issue-avatar { width: 100%; height: 100%; border-radius: 999px; object-fit: cover; display: block; background: #fff; }
.issue-meta { display: flex; flex-direction: column; }
.issue-author { font-weight: 700; color: var(--text-color, #334155); }
.issue-date { font-size: 12px; color: var(--text-secondary, #64748b); }

.issue-body { font-size: 14px; line-height: 1.8; color: var(--text-color, #334155); }
.issue-body :deep(h1), .issue-body :deep(h2), .issue-body :deep(h3) { margin: .6em 0 .4em; font-size: 1.05em; }
.issue-body :deep(p) { margin: .6em 0; }
.issue-body :deep(a) { color: var(--icon-primary, #1e90ff); text-decoration: none; }
.issue-body :deep(a:hover) { text-decoration: underline; }
.issue-body :deep(code) { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background: rgba(148,163,184,.18); padding: 2px 6px; border-radius: 6px; }
.issue-body :deep(pre) { background: rgba(2,6,23,.75); color: #e5e7eb; padding: 10px 12px; border-radius: 8px; overflow: auto; box-shadow: inset 0 0 0 1px rgba(148,163,184,.15); }
.issue-body :deep(blockquote) { margin: .8em 0; padding: .1em 1em; border-left: 3px solid rgba(148,163,184,.5); color: var(--text-secondary, #64748b); }
.issue-body :deep(img) { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 8px 0; }

.issue-link { display: inline-flex; align-items: center; gap: 6px; color: var(--icon-primary, #1e90ff); text-decoration: none; margin-top: 8px; font-size: 13px; padding: 6px 10px; border-radius: 999px; background: rgba(30,144,255,.08); }
.issue-link:hover { background: rgba(30,144,255,.12); }

/* 暗色适配 */
:root[data-theme="dark"] .about-section { background: var(--card-bg, rgba(40,40,40,0.3)); }
:root[data-theme="dark"] .intro { color: #d1d5db; }
:root[data-theme="dark"] .card-content p { color: #9ca3af; }
:root[data-theme="dark"] .tab { color: #cbd5e1; background: rgba(255,255,255,.04); border-color: rgba(148,163,184,.2); }
:root[data-theme="dark"] .tab.active { color: #dbeafe; background: rgba(30,144,255,.12); border-color: rgba(30,144,255,.45); }
:root[data-theme="dark"] .friend-name { color: #e2e8f0; }
:root[data-theme="dark"] .friend-desc { color: #9ca3af; }
:root[data-theme="dark"] .issue-body { color: #d1d5db; }
:root[data-theme='dark'] .issue-author { color: #e2e8f0; }
:root[data-theme='dark'] .issue-body :deep(pre) { background: rgba(2,6,23,.9); color: #e5e7eb; }

/* Entrance animation: initial state */
.about-section .about-left,
.about-section .heading,
.about-section .intro,
.about-section .chips,
.about-section .card-grid .info-card {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1);
  will-change: opacity, transform;
}

/* In-view final state */
.about-section.in-view .about-left,
.about-section.in-view .heading,
.about-section.in-view .intro,
.about-section.in-view .chips,
.about-section.in-view .card-grid .info-card {
  opacity: 1;
  transform: none;
}

/* Staggered delays */
.about-section .heading { transition-delay: .05s; }
.about-section .intro { transition-delay: .10s; }
.about-section .chips { transition-delay: .12s; }
.about-section .card-grid .info-card:nth-child(1) { transition-delay: .18s; }
.about-section .card-grid .info-card:nth-child(2) { transition-delay: .26s; }
.about-section .card-grid .info-card:nth-child(3) { transition-delay: .34s; }

/* Reduced motion: show immediately */
@media (prefers-reduced-motion: reduce) {
  .about-section .about-left,
  .about-section .heading,
  .about-section .intro,
  .about-section .chips,
  .about-section .card-grid .info-card {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .about-inner { grid-template-columns: 1fr; align-items: start; margin-top: -8px; }
  .about-left { display: flex; align-items: center; gap: 16px; }
  .socials { margin-top: 0; }
  .card-grid { grid-template-columns: 1fr; }
  .friends-grid { grid-template-columns: 1fr; }
  /* Mobile: no internal scrolling, content expands naturally */
  .tab-content { position: static; height: auto; overflow: visible; }
  .tab-panel { position: static; inset: auto; overflow: visible; padding-right: 0; }
}

@media (max-width: 480px) {
  .about-section { padding: 16px; }
  .about-inner { gap: 12px; }
  .avatar-wrap { width: clamp(120px, 30vmin, 180px); border-radius: 18px; }
  .socials { gap: 10px; }
  .socials a { width: 36px; height: 36px; border-radius: 10px; }

  .title { font-size: clamp(20px, 6vw, 28px); }
  .subtitle { font-size: 12px; }
  .intro { margin: 12px 0 10px; font-size: 14px; line-height: 1.7; }

  .chips { gap: 6px; }
  .chip { padding: 5px 9px; font-size: 11px; }

  .card-grid { gap: 10px; }
  .info-card { padding: 12px; border-radius: 12px; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* Make cards responsive and center-aligned (default single column) */
.issues-container { display: grid; grid-template-columns: 1fr; justify-items: center; gap: 16px; }
.issue-item { width: min(720px, 100%); }

/* Right-align footer action */
.issue-footer { display: flex; justify-content: flex-end; margin-top: 8px; }

@media (max-width: 900px) {
  .issues-container { gap: 12px; }
  .issue-item { width: 100%; }
}

/* Masonry columns on wide screens */
@media (min-width: 1200px) {
  .issues-container { display: block; column-count: 2; column-gap: 16px; }
  .issue-item { width: auto; display: inline-block; break-inside: avoid; -webkit-column-break-inside: avoid; -moz-column-break-inside: avoid; margin: 0 0 16px; }
}
@media (min-width: 1600px) {
  .issues-container { column-count: 3; column-gap: 18px; }
  .issue-item { margin-bottom: 18px; }
}
</style> 