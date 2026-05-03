<template>
  <v-app>
    <router-view v-slot="{ Component, route }">
      <transition name="page-fade">
        <component :is="Component" :key="route.matched[0]?.path ?? route.path" />
      </transition>
    </router-view>
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>

<style scoped>
.v-app {
  position: relative;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1), transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-fade-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.995);
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }
}
</style>
