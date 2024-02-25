<template>
  <Dialog v-if="data" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[375px] grid-rows-[auto_minmax(0,1fr)_auto] p-0">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Add Warehouse</DialogTitle>
        <DialogDescription>
          Add a new warehouse to <span class="text-emerald-200">{{ data.slug }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="border-t border-border flex flex-col gap-4 py-4 overflow-y-auto px-6">
        <FormKit type="form" :actions="false" @submit="onSubmit">
          <div class="w-full sm:flex-row gap-x-2">
            <FormKit type="text" label="Name" name="name" step="1" validation="required" placeholder="Warehouse name" />

            <div class="flex gap-2">
              <FormKit outer-class="flex-1" type="number" label="Pos. X" name="x" step="1" number="integer"
                validation="required|numeric|min=1" min="1" placeholder="X" />

              <FormKit outer-class="flex-1" type="number" label="Pos. Y" name="y" step="1" number="integer"
                validation="required|numeric|min=1" min="1" placeholder="Y" />
            </div>
          </div>

          <div class="flex items-center gap-2 w-full">
            <Button class="w-full my-2" type="submit">
              Add
            </Button>
          </div>
        </FormKit>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
const { data, isOpen, close } = useAddWarehouseDialog();

const adding = ref(false);
async function onSubmit(e: any) {
  if (adding.value) return;
  console.log(e);
  if (!data.value) {
    console.error('No data');
    return;
  }

  adding.value = true;

  data.value.add({
    name: e.name,
    x: e.x,
    y: e.y,
  })

  close();
  adding.value = false;
}

</script>
