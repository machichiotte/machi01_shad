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
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
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
