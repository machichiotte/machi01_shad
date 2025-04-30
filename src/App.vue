// File: /App.vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="layout">
    <nav>
      <RouterLink to="/" active-class="selected-link">Machi</RouterLink>
      <RouterLink to="/invest" active-class="selected-link">Invest</RouterLink>
      <RouterLink to="/order" active-class="selected-link">Order</RouterLink>
      <RouterLink to="/cmc" active-class="selected-link">Cmc</RouterLink>
      <RouterLink to="/home" active-class="selected-link">Balance</RouterLink>
      <RouterLink to="/strategy" active-class="selected-link">Strategy</RouterLink>
      <RouterLink to="/trade" active-class="selected-link">Trade</RouterLink>
      <RouterLink to="/stuff" active-class="selected-link">Stuff</RouterLink>
      <RouterLink to="/config" active-class="selected-link">Configuration</RouterLink>
      <RouterLink to="/rss" active-class="selected-link">Rss</RouterLink>
      <RouterLink to="/livedata" active-class="selected-link">Livedata</RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --font-family-base: monospace;

  --positive-color: #4caf50;
  --negative-color: #f44336;
  --neutral-color: #4b5563;

  --primary-text: #1154b1;
  --secondary-text: #398f95;
  --old-primary-text-color: #1f2937;
  --old-secondary-text-color: #6b7280;

  --border-color: #e5e7eb;
  --background-color: #242424;

  --transition-duration: 0.3s;

  --btn-bg: #911919;
  --btn-bg-disable: #aaa;
  --btn-border: #ccc;
  --btn-text: #fff;


  --btn-hover-bg: #e5e5ff;
  --btn-hover-border: #646cff;

  --btn-toggle-bg: #f9fafb;
  --btn-toggle-border: #ccc;
  --btn-toggle-text: #1f2937;

  --btn-toggle-selected-bg: #646cff;
  --btn-toggle-selected-border: #4646ff;
  --btn-toggle-selected-text: #ffffff;

  --btn-toggle-hover-bg: #e5e5ff;
  --btn-toggle-hover-border: #646cff;


  --searchbar-text: #ccc;
  --searchbar-bg: #333;
  --searchbar-border: #555;
  --searchbar-border-hover: #2196F3;
  --searchbar-icon-hover: #2196F3;


  --card-bg: #ddd;

  --card-dark-bg: #333;
  --input-border: 1px solid #555;
  --input-bg: #444;
  --input-text: #eee;



  --selector-bg: #f9fafb;
  --expand-btn-hover-bg: #f0f0f0;
  --table-border: #e5e7eb;
  --menu-text: #b42828;
  --error-text: #dc2626;
}

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  /* Enlever les marges */
  padding: 0;
  /* Enlever les espacements */
}

nav {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

nav a {
  padding: 0 20px;
  text-align: center;
  text-decoration: none;
}

nav a.selected-link {
  font-weight: bold;
  border-bottom: 2px solid black;
  /* Pour indiquer le lien actif */
}

main {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  /* Utiliser flex pour gérer l'espace */

}

main>* {
  width: 100%;
  /* S'assure que les enfants prennent toute la largeur du main */
  margin: 0;
  /* Annule les marges des éléments internes */
}
</style>
