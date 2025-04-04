<template>
  <div class="role-selection">
    <h1>选个卡片叭~</h1>
    <div class="roles">
      <div class="roles-grid">
        <div 
          v-for="role in roles" 
          :key="role.id" 
          class="role-card" 
          @click="selectRole(role)"
        >
          <picture>
            <source v-if="role.imageWebp" :srcset="role.imageWebp" type="image/webp">
            <source :srcset="role.image || role.imageJpeg" type="image/jpeg">
            <source :srcset="role.image || role.imageJpeg" type="image/png">
            <source :srcset="role.image || role.imageJpeg" type="image/svg+xml">
            <img 
              :src="role.image || role.imageJpeg" 
              :alt="`${role.name}头像`" 
              class="role-image"
              @load="handleImageLoad"
              @error="handleImageError"
              loading="lazy"
            />
          </picture>
          <h2>{{ role.name }}</h2>
          <p>{{ role.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { roles } from '../utils/rpg'
import { gsap } from 'gsap'
import ProfileCard from './ProfileCard.vue'

export default {
  name: 'RoleSelection',
  components: { ProfileCard },
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
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #e3ecf9, #fce3ec);
  min-height: 50vh;
  min-height: 670px;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #333;
  overflow: hidden;
}

/* 添加超大渐变文字背景 */
.role-selection::before {
  content: "WentUrc";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 20rem; /* 根据需要调整大小 */
  font-weight: bold;
  background: linear-gradient(135deg, #5e60ce, #6930c3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.1; /* 调低透明度，避免抢占前景内容 */
  z-index: 0;
}

/* 确保前景内容在伪元素之上 */
.role-selection > * {
  position: relative;
  z-index: 1;
}

.role-selection h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  background: linear-gradient(90deg, #5e60ce, #6930c3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.roles {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  justify-content: center;
}

.role-card {
  width: 280px;
  height: 300px;
  max-width: 100%;
  background: white;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
  margin: 0 auto;
}

.role-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  border: 2px solid #8e44ad;
}

.role-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 0 10px rgba(142, 68, 173, 0.2);
  background: linear-gradient(45deg, #f0f0f0 25%, #ffffff 50%, #f0f0f0 75%) no-repeat center/200% 200%;
  opacity: 0;
  transition: opacity 0.5s;
}

.role-image.loaded {
  opacity: 1;
}

.broken-image {
  filter: grayscale(100%);
  position: relative;
}
.broken-image::after {
  content: "图片加载失败";
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff4757;
  font-size: 0.8em;
}

.role-card h2 {
  font-size: 1.4rem;
  color: #5e60ce;
  margin: 10px 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-card p {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  
  .role-selection h1 {
    font-size: 2rem;
  }

  .role-selection::before {
    font-size: 10rem; /* 根据需要调整大小 */
  }
}

@media (max-width: 480px) {
  .role-card {
    width: 80%;
    height: 85%;
    max-width: 100%;
    background: white;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
    margin: 0 auto;
  }
}
</style>
