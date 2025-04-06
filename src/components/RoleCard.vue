<template>
  <div class="role-card" @click="$emit('select', role)">
    <div class="card-inner">
      <div class="role-content">
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
              @load="$emit('image-load', $event)"
              @error="$emit('image-error', $event)"
              loading="lazy"
            />
          </picture>
        </template>
        <template v-else>
          <!-- 占位符，可自行设计 -->
          <div class="image-placeholder">加载中…</div>
        </template>
        <h2>{{ role.name }}</h2>
        <p>{{ role.description }}</p>
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
      isVisible: false
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
  }
}
</script>

<style scoped>
.role-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
}
.role-card:hover .card-inner {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2);
  border: 2px solid #8e44ad;
}
.role-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.role-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 0 10px rgba(142,68,173,0.2);
  background: linear-gradient(45deg, #f0f0f0 25%, #ffffff 50%, #f0f0f0 75%) no-repeat center/200% 200%;
  opacity: 0;
  transition: opacity 0.5s;
}
.role-image.loaded {
  opacity: 1;
}
.image-placeholder {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1rem;
}
.role-content h2 {
  font-size: 1.4rem;
  color: #5e60ce;
  margin: 10px 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-content p {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>