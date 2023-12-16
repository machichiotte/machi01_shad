<template>
  <div id="app">
    <div class="site-title">
      <img src="@/assets/logo_machi.svg" alt="Titre de votre site" />
    </div>
    <header>
      <button class="menu-button" @click="toggleMenu">☰</button>
      <nav :class="{ 'show-menu': isMenuOpen }">
        <router-link to="/" active-class="selected-link">Accueil</router-link>
        <router-link to="/update" active-class="selected-link">Mise à jour</router-link>
        <router-link to="/orders" active-class="selected-link">Ordres ouverts</router-link>
        <router-link to="/cmc" active-class="selected-link">Montrer données</router-link>
        <router-link to="/shad" active-class="selected-link">SHAD</router-link>
        <router-link to="/strategy" active-class="selected-link">Stratégie</router-link>
        <router-link to="/trades" active-class="selected-link">Trades</router-link>
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
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 10px;
  position: relative;
  display: flex; /* Permet d'utiliser justify-content et align-items */
  justify-content: space-between; /* Aligne les éléments à l'extrémité des côtés */
  align-items: center; /* Centre les éléments verticalement */
}

.menu-button {
  font-size: 24px;
  background: none;
  border: none;
  color: white;
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
  color: white; /* Texte blanc par défaut */
  padding: 10px;
  text-align: center;
  text-decoration: none;
}

nav a.selected-link {
  color: black; /* Texte noir lorsqu'il est sélectionné */
  background-color: white;
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
    background-color: #2c3e50;
  }

  nav.show-menu {
    display: flex;
  }

  nav a {
    color: white;
    padding: 10px;
    width: 100%;
    text-align: center;
    text-decoration: none;
  }

  nav a.selected-link {
    color: black;
    background-color: white;
  }
}
</style>
