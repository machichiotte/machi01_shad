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
        <router-link to="/active-orders" active-class="selected-link">Ordres ouverts</router-link>
        <router-link to="/show-data" active-class="selected-link">Montrer données</router-link>
        <router-link to="/shad" active-class="selected-link">SHAD</router-link>
        <router-link to="/strat" active-class="selected-link">Stratégie</router-link>
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
}

.menu-button {
  font-size: 24px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  position: absolute;
  top: 10px;
  right: 10px;
}

.show-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 64px;
  right: 0;
  width: 100%;
  background-color: #2c3e50;
  transition: transform 0.3s ease-in-out;
  transform: translateX(100%);
}

.show-menu.show {
  transform: translateX(0);
}

.show-menu a {
  color: white;
  padding: 10px;
  text-align: center;
  width: 100%;
  text-decoration: none;
}

.selected-link {
  background-color: white;
  color: #2c3e50;
  padding: 10px;
}

.site-title {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightgray;
  max-height: 80px;
  padding: 4px 0;
}

.site-title img {
  max-height: 100%;
  width: auto;
}
</style>