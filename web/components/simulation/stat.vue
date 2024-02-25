<template>
  <div class="w-full group flex items-center justify-between text-sm font-mono"
    >
    <div class="flex items-center gap-1">
      <Icon :name="icon" size="1rem" />
      <p>{{ title }}</p>
    </div>
    <div class="mx-1 h-px flex-1 transition duration-300 bg-neutral-400/20 group-hover:bg-emerald-500/60" />
    <p class="text-emerald-200">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string, title: string, value: string | number }>()
</script>
