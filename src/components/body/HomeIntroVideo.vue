<template>
  <section class="home-hero" ref="sectionRoot">
    <div class="hero-inner">
      <div class="hero-left" ref="leftPanel">
        <div class="light-orbs">
          <span class="orb orb-a"></span>
          <span class="orb orb-b"></span>
          <span class="orb orb-c"></span>
        </div>
        <h1 class="hero-title animate-in ai-1">ViaLonga, Somniviva</h1>
        <p class="hero-subtitle animate-in ai-2">
          The wind silvers the plain; footprints fade into stars. Shadows stack like old dreams.
        </p>
        <div class="hero-intro animate-in ai-3">
          <p class="type-paragraph">{{ typedIntro }}<span class="cursor" :class="{ blink: (!typingActive && typedDone) }" v-if="!reducedMotion" aria-hidden="true"></span></p>
        </div>
      </div>
      <div class="hero-right">
        <div class="video-wrapper">
          <video
            ref="videoEl"
            class="hero-video"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            :poster="poster"
          >
            <source :src="videoSrc" type="video/mp4" />
          </video>
          <div class="video-overlay" ref="overlayEl">
            <div class="vo-top">
              <span class="vo-label"><i class="fas fa-video"></i> 正在播放</span>
              <span class="vo-duration" v-if="durationSec > 0">{{ formattedDuration }}</span>
            </div>
            <div class="vo-title">{{ displayTitle }}</div>
            <div class="vo-meta">
              <span v-if="resolution" class="vo-chip"><i class="fas fa-expand"></i> {{ resolution }}</span>
              <span v-if="isMuted" class="vo-chip"><i class="fas fa-volume-mute"></i> 静音</span>
              <span v-if="isLoop" class="vo-chip"><i class="fas fa-sync-alt"></i> 循环</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { applyThemeVariables } from '../../utils/root'
import eventBus from '../../utils/eventBus.js'
export default {
  name: 'HomeIntroVideo',
  props: {
    videoSrc: { type: String, default: '/video/Xaleid◆scopiX xi [maimai でらっくす].mp4' },
    poster: { type: String, default: '' },
    title: { type: String, default: '' }
  },
  data() {
    return {
      observer: null,
      reducedMotion: false,
      previousThemeMode: null,
      themeForced: false,
      _darkClientsInView: 0,
      previousScheme: null,
      _ebId: 'home-intro-' + Date.now(),
      durationSec: 0,
      resolution: '',
      isMuted: true,
      isLoop: true,
      // typing state (only for intro)
      introFull: 'Fog coils at the ankles like half-woken thoughts. Dawn thins the dark; dew-laced stone flickers cold. The air tastes of grass and earth, a low hum of hills and water. Shadows pull long—time unspools in silence, then vanishes at an unseen end. A single bird-call reminds: there are roads unwalked, dreams unawakened. Heartbeat keeps time with steps. With every breath, a slope is climbed; with every lift of the eyes, a farther horizon appears. The road is long; the dream stays.',
      typedIntro: '',
      _typingTimer: null,
      _typingIndex: 0,
      typingActive: false,
      typedDone: false,
    };
  },
  computed: {
    displayTitle() {
      if (this.title) return this.title;
      try { const p = new URL(this.videoSrc, window.location.origin); return decodeURIComponent(p.pathname.split('/').pop() || ''); } catch { return this.videoSrc; }
    },
    formattedDuration() {
      const s = Math.floor(this.durationSec || 0);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }
  },
  mounted() {
    const sectionEl = this.$refs.sectionRoot || this.$el;
    const leftEl = this.$refs.leftPanel;
    const videoEl = this.$refs.videoEl;
    const overlayEl = this.$refs.overlayEl;
    const footerEl = document.querySelector('.section-footer');
    if (!sectionEl || !leftEl) return;

    eventBus.register(this._ebId, 'sidebar:open', () => { this._applyThemeLight(); });
    eventBus.register(this._ebId, 'sidebar:close', () => { const needDark = this._darkClientsInView > 0; if (needDark) this._applyThemeDark(); });

    if (videoEl) {
      this.isMuted = !!videoEl.muted; this.isLoop = !!videoEl.loop;
      const onMeta = () => { this.durationSec = Number(videoEl.duration) || 0; if (videoEl.videoWidth && videoEl.videoHeight) { this.resolution = `${videoEl.videoWidth}×${videoEl.videoHeight}`; } };
      videoEl.addEventListener('loadedmetadata', onMeta, { once: true });
    }

    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = !!(mq && mq.matches);
    if (mq && mq.addEventListener) { mq.addEventListener('change', (e) => { this.reducedMotion = e.matches; }); }
    if (this.reducedMotion && videoEl) { try { videoEl.pause(); } catch {} }

    const handleThemeClient = (inView) => {
      this._darkClientsInView += inView ? 1 : -1; this._darkClientsInView = Math.max(0, this._darkClientsInView);
      const needDark = this._darkClientsInView > 0; if (needDark) this._applyThemeDark(); else this._restoreTheme();
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target; const inView = entry.isIntersecting;
        if (target === sectionEl) {
          leftEl.classList.toggle('in-view', inView); sectionEl.classList.toggle('in-view', inView);
          if (videoEl) { if (inView && !this.reducedMotion) { const p = videoEl.play(); if (p && p.then) { p.catch(() => {}); } } else { try { videoEl.pause(); } catch {} } }
          // 固定/解除悬浮信息位置
          if (overlayEl) { overlayEl.classList.toggle('is-fixed', inView); }
          handleThemeClient(inView);
          // trigger typing
          this._onCopyVisibility(inView);
        }
        if (footerEl && target === footerEl) { handleThemeClient(inView); }
      });
    }, { root: null, threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

    this.observer.observe(sectionEl); if (footerEl) this.observer.observe(footerEl);
  },
  beforeUnmount() {
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
    this._stopCopyTyping(true);
    eventBus.unregisterComponent(this._ebId); this._restoreTheme();
  },
  methods: {
    _applyThemeDark() { if (this.themeForced) return; const rootEl = document.documentElement; this.previousThemeMode = this.previousThemeMode ?? (rootEl.getAttribute('data-theme') || null); this.previousScheme = this.previousScheme ?? (rootEl.getAttribute('data-color-scheme') || localStorage.getItem('color-scheme') || null); rootEl.setAttribute('data-theme', 'dark'); applyThemeVariables('dark', this.previousScheme || undefined); this.themeForced = true; },
    _applyThemeLight() { const rootEl = document.documentElement; rootEl.setAttribute('data-theme', 'light'); const scheme = rootEl.getAttribute('data-color-scheme') || localStorage.getItem('color-scheme') || null; applyThemeVariables('light', scheme || undefined); this.themeForced = false; },
    _restoreTheme() { if (!this.themeForced && this.previousThemeMode == null) return; const rootEl = document.documentElement; if (this.previousThemeMode) { rootEl.setAttribute('data-theme', this.previousThemeMode); } else { rootEl.removeAttribute('data-theme'); } const restoreMode = this.previousThemeMode || 'light'; applyThemeVariables(restoreMode, this.previousScheme || undefined); this.themeForced = false; this.previousThemeMode = null; this.previousScheme = null; },
    _onCopyVisibility(inView) {
      if (this.reducedMotion) {
        this.typedIntro = this.introFull; this.typingActive = false; this.typedDone = true; return;
      }
      if (inView) {
        this._startCopyTyping();
      } else {
        // 离开区域后重置，以便再次进入时重播
        this._stopCopyTyping(true);
      }
    },
    _startCopyTyping() {
      if (this.typedDone) return; // 已完成则不在本次停留中重复
      this._stopCopyTyping(true);
      this.typingActive = true;
      const typeStep = () => {
        if (this._typingIndex >= this.introFull.length) {
          this.typingActive = false;
          this.typedDone = true;
          return; // 不循环
        }
        const ch = this.introFull.charAt(this._typingIndex);
        this.typedIntro += ch;
        this._typingIndex += 1;
        const isPunct = /[，。；、,.!！?？]/.test(ch);
        const delay = isPunct ? 110 : 28;
        this._typingTimer = setTimeout(typeStep, delay);
      };
      this._typingTimer = setTimeout(typeStep, 320);
    },
    _stopCopyTyping(reset = false) {
      if (this._typingTimer) { clearTimeout(this._typingTimer); this._typingTimer = null; }
      this.typingActive = false;
      if (reset) {
        this.typedIntro = '';
        this._typingIndex = 0;
        this.typedDone = false;
      }
    },
  }
}
</script>

<style scoped>
.home-hero {
  width: 100%;
  height: 100vh; /* 使用满屏高度，配合 .section 的 scroll-margin-top 统一对齐 */
  padding: 0;
  position: relative;
  background: radial-gradient(1200px 600px at 10% 10%, rgba(30, 41, 59, 0.35), transparent 60%),
              linear-gradient(180deg, #0b1020 0%, #0a0f1a 100%);
  color: #e5e7eb;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.home-hero::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff)); z-index: 2; pointer-events: none; }

.hero-inner { width: 100%; height: 100%; margin: 0; display: flex; align-items: stretch; }

.hero-left,
.hero-right {
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.hero-left {
  flex: 0 0 clamp(260px, 32%, 520px);
  padding: clamp(16px, 5vw, 64px);
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* 限制重绘范围与混合模式影响区域 */
  contain: layout paint;
  isolation: isolate;
}

/* 向右浮入动画：初始状态与入场状态 */
.hero-left .animate-in {
  opacity: 0;
  transform: translateX(-28px);
  transition: opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.hero-left.in-view .animate-in { opacity: 1; transform: translateX(0); }
.ai-1 { transition-delay: 60ms; }
.ai-2 { transition-delay: 160ms; }
.ai-3 { transition-delay: 280ms; }

/* 光球背景容器与元素 */
.light-orbs { position: absolute; inset: -10%; z-index: 0; pointer-events: none; }
.hero-left > *:not(.light-orbs) { position: relative; z-index: 1; }

.orb {
  position: absolute;
  width: 42vmin;
  height: 42vmin;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.35;
  mix-blend-mode: screen;
  will-change: transform, opacity;
  animation-play-state: paused; /* 默认暂停，进入视口再播放 */
}
.home-hero.in-view .light-orbs .orb { animation-play-state: running; }

.orb-a { left: -8vmin; top: -6vmin; background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.85), rgba(99, 102, 241, 0) 60%); animation: floatA 16s ease-in-out infinite; }
.orb-b { right: -10vmin; top: 20vmin; width: 36vmin; height: 36vmin; background: radial-gradient(circle at 60% 40%, rgba(56, 189, 248, 0.8), rgba(56, 189, 248, 0) 60%); animation: floatB 20s ease-in-out infinite; }
.orb-c { left: 10vmin; bottom: -12vmin; width: 48vmin; height: 48vmin; background: radial-gradient(circle at 40% 60%, rgba(147, 197, 253, 0.7), rgba(147, 197, 253, 0) 65%); animation: floatC 22s ease-in-out infinite; }

@keyframes floatA { 0%{transform:translate3d(0,0,0) scale(1)}25%{transform:translate3d(2vmin,1vmin,0) scale(1.05)}50%{transform:translate3d(0,2vmin,0) scale(0.98)}75%{transform:translate3d(-1.5vmin,-0.5vmin,0) scale(1.02)}100%{transform:translate3d(0,0,0) scale(1)} }
@keyframes floatB { 0%{transform:translate3d(0,0,0) scale(1)}20%{transform:translate3d(-2vmin,1vmin,0) scale(1.06)}50%{transform:translate3d(0.5vmin,-1.5vmin,0) scale(0.97)}80%{transform:translate3d(1.5vmin,1vmin,0) scale(1.03)}100%{transform:translate3d(0,0,0) scale(1)} }
@keyframes floatC { 0%{transform:translate3d(0,0,0) scale(1)}30%{transform:translate3d(-1vmin,1.5vmin,0) scale(1.04)}55%{transform:translate3d(2vmin,0.5vmin,0) scale(0.99)}85%{transform:translate3d(-1vmin,-1vmin,0) scale(1.02)}100%{transform:translate3d(0,0,0) scale(1)} }

/* remove terminal card; use paragraph styles */
.hero-title {
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(90deg, #93c5fd 0%, #60a5fa 50%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: "ConsolasLocal", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.hero-subtitle { margin: 0 0 16px; color: #cbd5e1; font-size: clamp(14px, 1.6vw, 18px); font-family: "ConsolasLocal", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.hero-intro p { margin: 0 0 10px; color: #94a3b8; line-height: 1.8; font-size: clamp(14px, 1.4vw, 16px); }

/* monospace for typed paragraph */
.type-paragraph { font-family: "ConsolasLocal", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; color: #cbd5e1; }

/* blinking cursor: only blink after typing is done */
.cursor { display: inline-block; width: 7px; height: 1.1em; background: #7dd3fc; margin-left: 6px; vertical-align: -2px; box-shadow: 0 0 8px rgba(125, 211, 252, .6); }
.cursor.blink { animation: blink 1s steps(1,end) infinite; }
@keyframes blink { 0%,50%{opacity:1} 50.01%,100%{opacity:0} }

/* prefers-reduced-motion: stop cursor animation */
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; opacity: 1; }
}

.hero-right { flex: 1 1 auto; overflow: hidden; display: flex; }
.video-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.video-wrapper::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg, rgba(7,10,18,0.72) 0%, rgba(7,10,18,0.45) 35%, rgba(7,10,18,0.18) 65%, rgba(7,10,18,0.08) 100%); pointer-events:none; }

/* 视频信息悬浮层（默认绝对定位，进入视口时固定到可视区域底部） */
.video-overlay {
  position: absolute;
  left: auto;
  right: 24px;
  bottom: 28px;
  width: min(520px, 45%);
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(5, 8, 14, 0.45), rgba(5, 8, 14, 0.75));
  color: #e5e7eb;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .25s ease, transform .25s ease;
  pointer-events: none;
}
.video-overlay.is-fixed {
  position: fixed;
  left: auto;
  right: 24px;
  bottom: calc(28px + env(safe-area-inset-bottom));
  width: clamp(260px, 40vw, 560px);
  z-index: 80;
}
.video-wrapper:hover .video-overlay { opacity: 1; transform: translateY(0); }
.vo-top { display: flex; justify-content: space-between; align-items: center; font-size: 12px; opacity: .9; }
.vo-label { display: inline-flex; align-items: center; gap: 6px; color: #cbd5e1; }
.vo-duration { font-variant-numeric: tabular-nums; color: #cbd5e1; }
.vo-title { margin-top: 6px; font-size: 14px; font-weight: 700; color: #f1f5f9; text-align: left; }
.vo-meta { margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
.vo-chip { font-size: 11px; padding: 4px 8px; border-radius: 999px; background: rgba(203, 213, 225, 0.12); color: #dbeafe; display: inline-flex; align-items: center; gap: 6px; }

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* 减少动画偏好：禁用入场动画与光球浮动，隐藏光标动画 */
@media (prefers-reduced-motion: reduce) {
  .hero-left .animate-in { transition: none; transform: none; opacity: 1; }
  .orb { animation: none !important; }
  .video-overlay { opacity: 1; transform: none; }
  .copy-terminal .cursor { animation: none; opacity: 1; }
}

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; }
  .hero-left { flex: 1 1 auto; padding: clamp(16px, 6vw, 28px); }
  .hero-right { display: none !important; }
  .video-overlay { display: none !important; }
}

@media (max-width: 900px) {
  .hero-inner { flex-direction: column; }
  .hero-right { min-height: 42vh; }
  .video-wrapper::after { background: linear-gradient(180deg, rgba(7,10,18,0.65) 0%, rgba(7,10,18,0.25) 60%, rgba(7,10,18,0.08) 100%); }
  .orb { filter: blur(34px); opacity: 0.32; }
  .orb-a { width: 50vmin; height: 50vmin; }
  .orb-b { width: 44vmin; height: 44vmin; }
  .orb-c { width: 56vmin; height: 56vmin; }
}
</style> 