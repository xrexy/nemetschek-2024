<template>
  <Dialog v-if="data" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[375px] grid-rows-[auto_minmax(0,1fr)_auto] p-0">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Add Order</DialogTitle>
        <DialogDescription>
          Add a new order to <span class="text-emerald-200">{{ data.slug }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="border-t border-border flex flex-col gap-4 py-4 overflow-y-auto px-6">
        <FormKit type="form" :actions="false" @submit="onSubmit">
          <FormKit type="select" name="customerId" label="Customer" placeholder="Choose a customer" validation="required"
            :options="data.customers.map((customer) => ({ value: customer.id, label: customer.name }))" />

          <div class="border-y border-border p-3 mt-1 max-h-[20rem] overflow-y-auto">
            <FormInputWithCounter title="Products" groupName="product">
              <FormKit outer-class="sm:w-[20%]" type="select" name="name" label="Name" placeholder="Choose a product"
                validation="required"
                :options="Object.entries(data.products).map(([product]) => ({ value: product, label: product }))" />

              <FormKit outer-class="flex-1" type="number" label="Count" name="count" step="1" number="integer"
                validation="required|numeric|min=1" min="1" placeholder="Count" />
            </FormInputWithCounter>
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
const { data, isOpen, close } = useAddOrderDialog();

async function onSubmit(e: any) {
  if (!data.value) {
    console.error('No data');
    return;
  }


  const productKeys = Object.entries(e).filter(([name]) => name.startsWith('product-'));
  data.value.addOrder({
    customerId: e.customerId,
    productList: productKeys.reduce((acc, curr: any) => ({
      ...acc,
      [curr[1].name]: curr[1].count
    }), {})
  })

  close()

}

</script>
