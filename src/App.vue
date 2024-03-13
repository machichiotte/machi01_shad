<!-- src/App.vue -->

<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const isMenuOpen = ref(false)
const isDarkMode = ref(false)
const dark = '#2c3e50'
const light = '#ffffff'

const menuButton = ref(null) // Add ref for DOM element

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    // Use ref directly instead of $refs
    menuButton.value.style.display = 'block'
  } else {
    menuButton.value.style.display = 'none'
  }
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.body.classList.toggle('dark-mode', isDarkMode.value)
  this.$emit('dark-mode-change', isDarkMode.value) // Use direct $emit
}
</script>
<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <div class="site-title">
      <logo-machi :color="isDarkMode ? light : dark"></logo-machi>
    </div>
    <button class="dark-mode-button" @click="toggleDarkMode">☾</button>

    <header :class="{ 'dark-mode': isDarkMode }">
      <button class="menu-button" @click="toggleMenu">☰</button>
      <nav :class="{ 'show-menu': isMenuOpen, 'dark-mode': isDarkMode }">
        <RouterLink to="/" active-class="selected-link">Accueil</RouterLink>
        <RouterLink to="/update" active-class="selected-link">Mise à jour</RouterLink>
        <RouterLink to="/orders" active-class="selected-link">Ordres ouverts</RouterLink>
        <RouterLink to="/cmc" active-class="selected-link">Montrer données</RouterLink>
        <RouterLink to="/shad" active-class="selected-link">SHAD</RouterLink>
        <RouterLink to="/strategy" active-class="selected-link">Stratégie</RouterLink>
        <RouterLink to="/trades" active-class="selected-link">Trades</RouterLink>
        <RouterLink to="/converter" active-class="selected-link">Converter</RouterLink>
      </nav>
    </header>
    <RouterView /> 
  </div>
</template>

<style scoped>
body {
  background-color: var(--light-bg);
  color: var(--light-text);
  transition: all 0.3s ease-in-out;
}

body.dark-mode {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

header {
  background-color: var(--dark-bg);
  color: var(--dark-text);
  margin: 10px;
  position: relative;
  display: flex; /* Permet d'utiliser justify-content et align-items */
  justify-content: space-between; /* Aligne les éléments à l'extrémité des côtés */
  align-items: center; /* Centre les éléments verticalement */
}

header.dark-mode {
  background-color: var(--light-bg);
  color: var(--light-text);
}

.menu-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: default; /* Rend le curseur non cliquable */
  padding: 10px;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%); /* Centre le bouton verticalement */
  display: none; /* Cacher le bouton du menu par défaut */
}

/* Style pour les grands écrans */
nav {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

nav a {
  color: var(--dark-text);
  background-color: var(--dark-bg);
  padding: 10px;
  text-align: center;
  text-decoration: none;
}

nav.dark-mode a {
  color: var(--light-text);
  background-color: var(--light-bg);
}

nav a.selected-link {
  color: var(--light-text);
  background-color: var(--light-bg);
}

nav.dark-mode a.selected-link {
  color: var(--dark-text);
  background-color: var(--dark-bg);
}

/* Style pour les petits écrans */
.show-menu {
  display: none;
}

@media only screen and (max-width: 768px) {
  .menu-button {
    display: block; /* Afficher le bouton du menu pour les petits écrans */
  }

  nav {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 64px;
    right: 0;
    width: 100%;
    background-color: #aa00aa;
  }

  nav.show-menu {
    display: flex;
  }

  nav a {
    color: var(--light-text);
    padding: 10px;
    width: 100%;
    text-align: center;
    text-decoration: none;
  }

  nav a.selected-link {
    color: var(--light-text);
    background-color: var(--light-bg);
  }

  nav a.dark-mode {
    color: var(--dark-text);
  }

  nav a.dark-mode.selected-link {
    color: var(--dark-text);
    background-color: var(--dark-bg);
  }
}
</style>
../index../router/index