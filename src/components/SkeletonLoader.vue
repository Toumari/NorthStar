<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  borderRadius?: string
  marginBottom?: string
}>()
</script>

<template>
  <div 
    class="skeleton" 
    :style="{ 
      width: width || '100%', 
      height: height || '20px', 
      borderRadius: borderRadius || '8px',
      marginBottom: marginBottom || '0'
    }"
  ></div>
</template>

<style scoped>
.skeleton {
  background-color: var(--color-surface-hover);
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 1.5s infinite;
}

:root.dark .skeleton::after {
    background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
