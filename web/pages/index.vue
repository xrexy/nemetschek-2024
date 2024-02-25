<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <h1 class="font-mono font-black text-4xl">Online Simulations</h1>

    <p class="opacity-50" v-if="online.length === 0">
      There are no online simulations available at the moment.
    </p>


    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <SimulationCard v-for="(simulation, k) in online" :key="k" :simulation="simulation" />
    </div>
  </div>
</template>

<script setup lang="ts">
const online = useOnlineSimulations()
</script>
