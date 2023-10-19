<script setup lang="ts">
useHead({
  title: `Estella's playground`,
  meta: [
    { name: 'description', content: 'My amazing site.' }
  ],
});
</script>

<template>
  <div id="container">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
