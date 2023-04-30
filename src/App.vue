<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">Accueil</router-link>
        <router-link to="/portfolio">Gestion de portefeuille</router-link>
        <router-link to="/market-analysis">Analyse de marché</router-link>
        <router-link to="/order-management">Gestion des ordres</router-link>
        <router-link to="/admin">Administration</router-link>
      </nav>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import { default as router } from './router/index';

export default {
  name: "App",
  router
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
}

nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}</style>