<template>
  <Dialog v-if="data" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[375px] grid-rows-[auto_minmax(0,1fr)_auto] p-0">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Add Product</DialogTitle>
        <DialogDescription>
          Add a new product to <span class="text-emerald-200">{{ data.slug }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="border-t border-border flex flex-col gap-4 py-4 overflow-y-auto px-6">
        <FormKit type="form" :actions="false" @submit="onSubmit">
          <div class="w-full sm:flex-row gap-x-2">
            <FormKit type="text" label="Name" name="name" step="1" validation="required" placeholder="Product name" />

            <FormKit outer-class="flex-1" type="number" label="Weight" name="weight" step="1" number="integer"
              validation="required|numeric|min=1" min="1" placeholder="Product weight in grams" />
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
const { data, isOpen, close } = useAddProductDialog();

const adding = ref(false);
async function onSubmit(e: any) {
  if (adding.value) return;
  if (!data.value) {
    console.error('No data');
    return;
  }

  adding.value = true;

  data.value.add({
    name: e.name,
    weight: e.weight
  })

  close();
  adding.value = false;
}

</script>
