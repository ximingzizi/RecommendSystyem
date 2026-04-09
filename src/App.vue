<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body, #app {
  min-height: 100%;
}

#app {
  min-height: 100vh;
}
</style>
