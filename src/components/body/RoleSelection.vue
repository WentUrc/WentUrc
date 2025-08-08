<template>
  <div class="role-selection">
    <div class="roles">
      <div class="roles-grid">
        <RoleCard 
          v-for="role in roles" 
          :key="role.id" 
          :role="role"
          @select="selectRole"
          @image-load="handleImageLoad"
          @image-error="handleImageError"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { roles } from '../../utils/rpg'
import { gsap } from 'gsap'
import ProfileCard from '../body/ProfileCard.vue'
import RoleCard from '../body/RoleCard.vue'

export default {
  name: 'RoleSelection',
  components: { ProfileCard, RoleCard },
  data() {
    return {
      roles: [...roles]
    }
  },
  mounted() {
    this.$nextTick(() => {
      gsap.set('.role-card', { pointerEvents: 'none' })
      gsap.from('.role-card', {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set('.role-card', { pointerEvents: 'auto' })
        }
      })
      this.preloadImages()
    })
  },
  methods: {
    selectRole(role) {
      try {
        const sanitizedRole = {
          id: role.id,
          name: role.name,
          description: role.description,
          image: role.image || role.imageJpeg,
          route: role.route
        }
        localStorage.setItem('selectedRole', JSON.stringify(sanitizedRole))
        this.$router.push({ name: 'Dialogue' })
      } catch (error) {
        console.error('角色存储失败:', error)
        alert('角色选择失败，请稍后重试')
      }
    },
    handleImageError(event) {
      const fallbackImage = '/images/avatar-placeholder.png'
      event.target.src = fallbackImage
      event.target.onerror = null
      event.target.classList.add('broken-image')
    },
    handleImageLoad(event) {
      event.target.classList.add('loaded')
    },
    preloadImages() {
      const images = import.meta.glob('/assets/characters/*.png', { eager: true })
      Object.values(images).forEach((imgModule) => {
        const img = new Image()
        img.src = imgModule.default
      })
    }
  }
}
</script>

<style scoped>
.role-selection {
  position: relative; /* 为伪元素定位 */
  padding: 50px 20px;
  text-align: center;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: var(--text-color, #333);
  width: 100%;
  box-sizing: border-box;
}

/* 桌面端：固定高度 + 内部滚动 */
@media (min-width: 769px) {
  .role-selection {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 移动端：自适应高度 + 传统布局 */
@media (max-width: 768px) {
  .role-selection {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}

/* 添加超大渐变文字背景 */
.role-selection::before {
  content: "Roles";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 20rem; /* 根据需要调整大小 */
  font-weight: bold;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6930c3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.1; /* 调低透明度，避免抢占前景内容 */
  z-index: 0;
}



/* 确保前景内容在伪元素之上 */
.role-selection > * {
  position: relative;
  z-index: 2;
}

.role-selection h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  background: var(--primary-gradient, linear-gradient(90deg, #5e60ce, #6930c3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.roles {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  width: 100%; /* 确保宽度为100% */
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  justify-content: center;
  grid-auto-rows: 1fr;
  width: 100%;
}

/* 媒体查询 */
@media (max-width: 768px) {
  .role-selection {
    padding: 30px 20px;
  }
  
  .roles-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px; /* 增加中等屏幕上的卡片间距 */
    padding: 0;
    width: 100%;
    margin: 0;
  }
  
  .roles {
    padding: 10px 5px; /* 减小水平内边距 */
    margin: 0;
    width: 100%;
  }
  
  .role-selection h1 {
    font-size: 2rem;
    margin-bottom: 20px; /* 缩小标题下方间距 */
  }

  .role-selection::before {
    font-size: 10rem; /* 根据需要调整大小 */
  }
}

@media (max-width: 480px) {
  .role-selection {
    padding: 20px 10px;
  }
  
  .roles-grid {
    grid-template-columns: 1fr; /* 非常小的屏幕上每行只显示一张卡片 */
    gap: 20px; /* 增加小屏幕上的卡片间距 */
    margin: 10px 0; /* 添加上下边距 */
    padding: 0;
    width: 100%;
  }
  
  .roles {
    padding: 10px 15px; /* 增加内边距，给整体留白 */
    width: 100%;
  }

  .role-selection .role-card {
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    max-width: none;
    background: none;
    box-shadow: none;
    border: none;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .role-selection {
    padding: 15px 5px; /* 和其他页面保持一致的思路 */
  }
  
  .roles {
    padding: 5px; /* 进一步减少内边距 */
  }
  
  .role-selection h1 {
    font-size: 1.5rem; /* 最小标题尺寸 */
    margin-bottom: 15px;
  }
  
  .roles-grid {
    gap: 15px; /* 减少卡片间距 */
  }
}
</style>