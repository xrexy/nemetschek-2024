<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// force tailwind's dark mode
useHead({ htmlAttrs: { class: "dark" } })
</script>
