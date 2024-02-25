<template>
  <div class="w-full flex justify-between">
    <h2 class="font-mono font-semibold text-lg">{{ title }}</h2>
    <div class="space-x-2">
      <button type="button" class="btn btn-primary" @click="increment">
        <Icon name="material-symbols:add" />
      </button>
      <button type="button" class="btn btn-primary" @click="decrement">
        <Icon name="ic:outline-minus" />
      </button>
    </div>
  </div>

  <FormKit type="group" v-for="i in count" :key="i" :name="`${groupName}-${i-1}`">
    <div class="w-full flex flex-col sm:flex-row gap-x-2" >
      <slot />
    </div>
  </FormKit>
</template>

<script setup lang="ts">
defineProps<{ title: string, groupName: string }>();
const { count, decrement, increment } = useCounter();
</script>
