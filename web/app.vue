<template>
  <div class="">
    <SimulationHistoryDialog />
    <SimulationDroneStatusDialog />
    <SimulationAddOrderDialog />
    <SimulationAddCustomerDialog />
    <SimulationAddWarehouseDialog />
    <SimulationAddProductDialog />
    
    <Toaster />
    <AppHeader />

    <div class="pt-16 w-full h-[calc(100svh-var(--header-height))]">
      <div
        class="fixed top-[60%] blur-[5rem] left-[50%] h-[75%] aspect-[15/9] translate-x-[-50%] translate-y-[-50%] bg-emerald-700 rounded-full -z-10 opacity-10" />

      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'

// force tailwind's dark mode
useHead({ htmlAttrs: { class: "dark" } })
</script>
