<!-- src/App.vue -->
<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <div class="site-title">
      <logo-machi :color="isDarkMode ? light : dark "></logo-machi>

    </div>
    <button class="dark-mode-button" @click="toggleDarkMode">☾</button>

    <header :class="{'dark-mode': isDarkMode}">
      <button class="menu-button" @click="toggleMenu">☰</button>
      <nav :class="{ 'show-menu': isMenuOpen, 'dark-mode': isDarkMode}">
        <router-link to="/" active-class="selected-link">Accueil</router-link>
        <router-link to="/update" active-class="selected-link">Mise à jour</router-link>
        <router-link to="/orders" active-class="selected-link">Ordres ouverts</router-link>
        <router-link to="/cmc" active-class="selected-link">Montrer données</router-link>
        <router-link to="/shad" active-class="selected-link">SHAD</router-link>
        <router-link to="/strategy" active-class="selected-link">Stratégie</router-link>
        <router-link to="/trades" active-class="selected-link">Trades</router-link>
        <router-link to="/addtrades" active-class="selected-link">Add Trades</router-link>
        <router-link to="/converter" active-class="selected-link">Converter</router-link>
      </nav>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import { default as router } from '../router/index';

export default {
  name: "App",
  router,
  data() {
    return {
      isMenuOpen: false,
      isDarkMode: false,
      dark: '#2c3e50', 
      light: '#ffffff', 

    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode', this.isDarkMode);
          this.$emit('dark-mode-change', this.isDarkMode);
    },
  },
};
</script>

<style>
:root {
  --light-bg: #ffffff;
  --light-text: #2c3e50;
  --dark-bg: #2c3e50;
  --dark-text: #ffffff;
}

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
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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
