<template>
  <div :class="cn(
    'flex items-center gap-2  rounded-sm py-1.5 px-3 font-semibold text-xs text-emerald-100',
    isOnline ? 'bg-emerald-800/25' : 'bg-red-700/25'
  )">
    <div :class="cn(
      'h-1 aspect-square animate-ping rounded-full',
      isOnline ? 'bg-emerald-600' : 'bg-red-600'
    )" />
    {{ isOnline ? 'ONLINE' : "OFFLINE" }}
  </div>
</template>

<script setup lang="ts">
const POLLING_INTERVAL = 5000;
const POLLING_ONLINE_MULTIPLIER = 3;

const config = useRuntimeConfig();
const isOnline = useApiOnline();

function pollHealth() {
  fetch(`${config.public.apiUrl}/health`)
    .then((response) => {
      isOnline.value = response.ok;
    })
    .catch(() => {
      isOnline.value = false;
    })
    .finally(() => {
      const interval = isOnline.value ? POLLING_INTERVAL * POLLING_ONLINE_MULTIPLIER : POLLING_INTERVAL;
      setTimeout(pollHealth, interval);
    });
}

onBeforeMount(pollHealth)
</script>
