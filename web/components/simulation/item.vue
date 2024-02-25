<template>
  <div class="flex flex-col gap-1 bg-gray-700/25 rounded-sm p-2">
    <p class="font-semibold pb-2">{{ title }}</p>

    <div class="w-full group flex items-center justify-between text-sm font-mono" v-for="{ icon, label, value } in stats">
      <div class="flex items-center gap-1">
        <Icon :name="icon" size="1rem" />
        <p>{{ label }}</p>
      </div>
      <div class="mx-1 h-px flex-1 transition duration-300 bg-neutral-400/20 group-hover:bg-emerald-500/60" />
      <p class="text-emerald-200">{{ value }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string, stats: { icon: string, label: string, value: string | number }[] }>();
</script>
