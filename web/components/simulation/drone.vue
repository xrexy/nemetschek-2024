<template>
  <div class="flex flex-col gap-1 bg-gray-700/25 rounded-sm p-2">
    <div class="w-full flex items-start justify-between">
      <p class="font-semibold pb-2">Drone #{{ drone.id }}</p>
      <button class="h-fit" @click="() => { }">
        <!-- TODO implement me(modal with <pre>statusData</pre>) -->
        <Icon name="material-symbols-light:data-object" size="1.15rem" />
      </button>
    </div>

    <div class="w-full group flex items-center justify-between text-sm font-mono"
      v-for="{ icon, title, value } in droneData">
      <div class="flex items-center gap-1">
        <Icon :name="icon" size="1rem" />
        <p>{{ title }}</p>
      </div>
      <div class="mx-1 h-px flex-1 transition duration-300 bg-neutral-400/20 group-hover:bg-emerald-500/60" />
      <p class="text-emerald-200">{{ value }}</p>
    </div>

    <p class="sr-only">Battery charge visualization</p>
    <div class="bg-gray-700/25 h-1.5 rounded-full">
      <div class="bg-emerald-500/25 h-full rounded-full"
        :style="{ width: (drone.battery.currentCharge / drone.battery.capacity) * 100 + '%' }" />
    </div>

  </div>
</template>

<script setup lang="ts">
const $props = defineProps<{ drone: Drone }>();

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function format(value: number) {
  return numberFormatter.format(value)
}

const droneData = computed(() => {
  const { battery } = $props.drone

  return [
    { title: "Status", icon: "ph:pulse", value: $props.drone.status },
    { title: "Battery", icon: "material-symbols:battery-horiz-000-rounded", value: `${format(battery.currentCharge)}/${format(battery.capacity)}` },
  ]
});
</script>
