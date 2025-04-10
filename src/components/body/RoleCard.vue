<template>
  <div class="role-card" @click="$emit('select', role)" tabindex="0" @keydown.enter="$emit('select', role)">
    <div class="card-inner">
      <div class="role-content">
        <div class="image-container">
          <template v-if="isVisible">
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
                @error="$emit('image-error', $event)"
                loading="lazy"
              />
            </picture>
          </template>
          <template v-else>
            <div class="image-placeholder">
              <div class="shimmer"></div>
            </div>
          </template>
        </div>
        <div class="role-info">
          <h2>{{ role.name }}</h2>
          <p>{{ role.description }}</p>
        </div>
        <div class="card-indicator">
          <span class="indicator-dot"></span>
          <span class="indicator-text">点击查看</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleCard',
  props: {
    role: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isVisible: false,
      imageLoaded: false
    }
  },
  mounted() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(this.$el);
  },
  methods: {
    handleImageLoad(event) {
      this.imageLoaded = true;
      event.target.classList.add('loaded');
      this.$emit('image-load', event);
    }
  }
}
</script>

<style scoped>
.role-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 18px;
  outline: none;
}

.role-card:focus .card-inner {
  box-shadow: 0 12px 25px var(--card-shadow, rgba(94, 96, 206, 0.25));
  border: 2px solid var(--icon-primary, #5e60ce);
  transform: translateY(-8px);
}

.card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--card-bg, white);
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0,0,0,0.08)), 0 4px 8px rgba(94, 96, 206, 0.05);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
}

.role-card:hover .card-inner {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 15px 30px var(--card-shadow, rgba(94, 96, 206, 0.2)), 0 8px 15px var(--card-shadow, rgba(94, 96, 206, 0.15));
  border-color: var(--icon-primary, #5e60ce);
}

.role-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  position: relative;
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  height: 220px;
  box-shadow: 0 4px 12px var(--card-shadow, rgba(0,0,0,0.1));
}

.role-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s, transform 0.5s;
}

.role-image.loaded {
  opacity: 1;
}

.role-card:hover .role-image.loaded {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: var(--button-hover, #f2f3fa);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(150%);
  }
}

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.role-content h2 {
  font-size: 1.5rem;
  color: var(--icon-primary, #5e60ce);
  margin: 5px 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.role-card:hover .role-content h2 {
  color: var(--icon-accent, #4b48c9);
}

.role-content p {
  font-size: 1rem;
  color: var(--text-color, #555);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 5px;
}

.card-indicator {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 0.85rem;
  color: var(--text-color, #888);
  margin-top: auto;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.role-card:hover .card-indicator {
  opacity: 1;
  transform: translateY(0);
}

.indicator-dot {
  width: 6px;
  height: 6px;
  background-color: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  margin-right: 6px;
}

.indicator-text {
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-inner {
    padding: 15px;
  }
  
  .image-container {
    height: 180px;
  }
  
  .role-content h2 {
    font-size: 1.3rem;
  }
  
  .role-content p {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
  }
}
</style>