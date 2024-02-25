<template>
  <div class="flex flex-col gap-1 bg-gray-700/25 rounded-sm p-2">
    <div class="w-full flex items-start justify-between">
      <p class="font-semibold pb-2">Order #{{ order.id }}</p>
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
  </div>
</template>

<script setup lang="ts">
const $props = defineProps<{ order: Order }>();

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function format(value: number) {
  return numberFormatter.format(value)
}

const droneData = computed(() => {
  const { customer, status, weight } = $props.order

  return [
    { title: "Customer", icon: "material-symbols-light:deployed-code-account-outline", value: customer.name },
    { title: "Location", icon: "material-symbols:pin-drop-outline", value: `X: ${customer.coordinates.x}; Y: ${customer.coordinates.y}` },
    { title: "Weight", icon: "material-symbols:weight-outline", value: `${format(weight)} kg` },
    { title: "Status", icon: "ph:pulse", value: status },
  ]
});
</script>
