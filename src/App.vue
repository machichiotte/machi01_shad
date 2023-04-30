<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/" active-class="selected-link">Accueil</router-link>
        <router-link to="/portfolio" active-class="selected-link">Gestion de portefeuille</router-link>
        <router-link to="/market-analysis" active-class="selected-link">Analyse de marché</router-link>
        <router-link to="/order-management" active-class="selected-link">Gestion des ordres</router-link>
        <router-link to="/admin" active-class="selected-link">Administration</router-link>
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
  padding: 10px;
  text-decoration: solid;
}

nav a:hover {
  text-decoration: underline;
}

.selected-link {
  background-color: white;
  color: #2c3e50;
  padding: 10px;
}
</style>