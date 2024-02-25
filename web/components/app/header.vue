<template>
  <header class="h-header border-b border-border flex items-center justify-between px-16">
    <NuxtLink to="/">
      <Icon name="carbon:drone-delivery" size="1.75rem" />
    </NuxtLink>


    <div class="flex gap-2 items-center">
      <AppStatus class="h-fit" />
      <NuxtLink to="/create/simulation">
        <Button size="sm" variant="outline">Create Simulation</Button>
      </NuxtLink>
    </div>
  </header>
</template>

