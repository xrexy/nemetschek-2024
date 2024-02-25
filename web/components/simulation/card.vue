<template>
  <div
    class="opacity-80 hover:opacity-100 group p-5 rounded-md bg-gradient-to-t from-emerald-700/5 to-gray-800/25 hover:bg-gray-900/30 transition duration-150 border-2 border-emerald-500/20 hover:border-emerald-500/50 min-w-[25rem]">
    <NuxtLink :to="`/simulation/${simulation.slug}`" class="">
      <h2 class="text-2xl w-full truncate font-bold" :title="simulation.slug">
        {{ simulation.slug }}
      </h2>
      <div class="mt-4 flex flex-col gap-y-1 px-1">
        <div v-for="{ text, title } in entries" class="w-full flex justify-between">
          <p class="font-bold text-emerald-400 uppercase">{{ title }}</p>
          <p>{{ text }}</p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
type Entry = { text: string | number, title: string }

const { simulation } = defineProps<{
  simulation: MinimalSimulation
}>()

const entries: Entry[] = [
  { title: 'Drones', text: simulation.analytics.droneCount },
  { title: 'Warehouses', text: simulation.warehouses.length },
  { title: 'Delivered Orders', text: simulation.analytics.totalOrdersDelivered },
]
</script>
