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

  --error-text: #dc2626;


  /* === CORE === */
  --primary-bg: #1a1a1a;
  --primary-border: #2e2e2e;
  --primary-text: #f0f0f0;

  /* === ACCENTS === */
  --secondary-bg: #2b0f12;
  --secondary-border: #a33439;
  --secondary-text: #e0a8aa;

  /* === TRANSITIONS === */
  --transition-duration: 0.3s;

  /* === BUTTONS === */
  --btn-bg: #911919;
  --btn-bg-disable: #5a5a5a;
  --btn-border: #a82828;
  --btn-text: #ffffff;

  --btn-hover-bg: #b32a2a;
  --btn-hover-border: #d03a3a;

  /* === TOGGLE === */
  --btn-toggle-bg: #2a2a2a;
  --btn-toggle-border: #444;
  --btn-toggle-text: #ccc;

  --btn-toggle-selected-bg: #b32a2a;
  --btn-toggle-selected-border: #d03a3a;
  --btn-toggle-selected-text: #ffffff;

  --btn-toggle-hover-bg: #3a1a1a;
  --btn-toggle-hover-border: #c33;

  /* === SEARCHBAR === */
  --searchbar-text: #cccccc;
  --searchbar-bg: #222;
  --searchbar-border: #444;
  --searchbar-border-hover: #e84c4c;
  --searchbar-icon: #ccc;
  --searchbar-icon-hover: #ff6666;

  /* === CARDS === */
  --card-primary-bg: #2a2a2a;
  --card-secondary-bg: #1e1e1e;

  /* === FORM INPUTS === */
  --input-border: 1px solid #5a1e1e;
  --input-bg: #2b2b2b;
  --input-text: #ffffff;

  /* === TOOLTIP === */
  --tooltip-bg: #1e1e1e;
  --tooltip-text: #0e0ede;

   /* === BADGE === */
   --badge-primary-bg: ;
   --badge-primary-text: ;
   --badge-secondary-bg: ;
   --badge-secondary-text: ;

  /* === SELECTOR & MISC === */
  --selector-bg: #2a2a2a;
  --expand-btn-hover-bg: #3a1a1a;
  --table-border: #444;
  --menu-text: #e84c4c;

  /* === TABS === */
  --tab-bg: #191919;
  --tab-border: #333;
  --tab-text: #ff6b6b;

  /* === SURFACE / GROUND === */
  --surface-ground: #1a1a1a;


  --top-bar-height: 60px;
  --bottom-bar-height: 56px;

  --top-bar-expanded-height: 180px;
  --bottom-bar-expanded-height: 350px;
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
