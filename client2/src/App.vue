<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <nav>
    <RouterLink to="/" active-class="selected-link">Home</RouterLink>
    <RouterLink to="/order" active-class="selected-link">Order</RouterLink>
    <RouterLink to="/cmc" active-class="selected-link">Cmc</RouterLink>
    <RouterLink to="/machi" active-class="selected-link">Machi</RouterLink>
    <RouterLink to="/strategy" active-class="selected-link">Strategy</RouterLink>
    <RouterLink to="/trade" active-class="selected-link">Trade</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
