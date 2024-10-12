<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const isMenuOpen = ref<boolean>(false)
const isDarkMode = ref<boolean>(false)
const dark = '#2c3e50'
const light = '#ffffff'

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function toggleDarkMode(): void {
  isDarkMode.value = !isDarkMode.value
  //TODO changer les choses
  //document.body.classList.toggle('dark-mode', isDarkMode.value)
}
</script>

<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Logo and Dark Mode Toggle in Flex Container -->
    <div class="header-container">
      <!-- Center the logo within its own flex container -->
      <div class="logo-container">
        <logo-machi :color="isDarkMode ? light : dark" class="logo" />
      </div>
      <button class="dark-mode-button" @click="toggleDarkMode">☾</button>
    </div>

    <header :class="{ 'dark-mode': isDarkMode }">
      <button class="menu-button" @click="toggleMenu">☰</button>
      <nav :class="{ 'show-menu': isMenuOpen, 'dark-mode': isDarkMode }">
        <RouterLink to="/" active-class="selected-link">Home</RouterLink>
        <RouterLink to="/order" active-class="selected-link">Open Orders</RouterLink>
        <RouterLink to="/cmc" active-class="selected-link">Show Data</RouterLink>
        <RouterLink to="/machi" active-class="selected-link">Machi</RouterLink>
        <RouterLink to="/strategy" active-class="selected-link">Strategy</RouterLink>
        <RouterLink to="/trade" active-class="selected-link">Trades</RouterLink>
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

/* Flex container for logo and dark mode button */
.header-container {
  display: flex;
  align-items: center;
  /* Center vertically */
  padding: 10px;
  justify-content: space-between;
  /* Ensure logo and button are spaced evenly */
}

/* Center the logo horizontally */
.logo-container {
  flex-grow: 1;
  /* Allows the logo to take up remaining space */
  display: flex;
  justify-content: center;
  /* Centers the logo horizontally */
  align-items: center;
}

.logo {
  height: 6vh;
  /* Set logo height to 6% of the viewport height */
  max-width: 100%;
  object-fit: contain;
}

.dark-mode-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  /* Pushes the button to the right */
  color: var(--dark-text);
  /* Default color for light mode */
  transition: color 0.3s ease;
  /* Smooth transition for color change */
}

/* Ensure the icon color changes according to the mode */
.dark-mode-button:hover {
  color: var(--primary-color);
  /* Change color on hover for better UX */
}

body.dark-mode .dark-mode-button {
  color: var(--light-text);
  /* Set color for dark mode */
}

header {
  background-color: var(--dark-bg);
  color: var(--dark-text);
  margin: 10px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header.dark-mode {
  background-color: var(--light-bg);
  color: var(--light-text);
}

.menu-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  display: none;
}

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

.show-menu {
  display: none;
}

@media only screen and (max-width: 768px) {
  .menu-button {
    display: block;
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
