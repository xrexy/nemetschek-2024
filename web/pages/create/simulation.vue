<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <h1 class="font-mono font-black text-3xl">Create Simulation</h1>
    <FormKit type="form" :actions="false"
      form-class="w-[75%] sm:max-w-[25rem] flex flex-col items-center justify-center pb-8" @submit="onSubmit">

      <h2 class="font-mono font-semibold text-lg w-full">Simulation Variables</h2>
      <FormKit type="group" name="simulationVars">
        <div class="w-full flex flex-col sm:flex-row gap-x-2">
          <FormKit outer-class="sm:w-[25%]" type="number" label="Frequency" name="frequency" step="1" number="integer"
            validation="required|numeric|min=1" min="1" placeholder="Output frequency" />

          <FormKit type="group" name="map-top-right-coordinate">
            <FormKit outer-class="flex-1" type="number" label="Pos. X" name="x" step="1" number="integer"
              validation="required|numeric|min=1" min="1" placeholder="X" />

            <FormKit outer-class="flex-1" type="number" label="Pos. Y" name="y" step="1" number="integer"
              validation="required|numeric|min=1" min="1" placeholder="Y" />
          </FormKit>
        </div>
      </FormKit>

      <h2 class="font-mono font-semibold text-lg w-full">Time Variables</h2>
      <FormKit type="group" name="output">
        <div class="w-full flex flex-col sm:flex-row gap-x-2 h-fit">
          <FormKit type="group" name="minutes" v-model="minutes">
            <FormKit outer-class="flex-1" type="number" label="Program" name="program" step="1" number="integer"
              validation="required|numeric|min=1" min="1" placeholder="Program minutes" />

            <FormKit outer-class="flex-1" type="number" label="Real(ms)" name="real" step="1" number="integer"
              validation="required|numeric|min=1" min="1" placeholder="Real minutes" />
          </FormKit>
        </div>
        <p :class="cn('w-full text-xs text-neutral-400', timeFactor ? 'opacity-100' : 'opacity-[0.0001]')">
          This will result in a time factor of: <span class="text-emerald-200">{{ timeFactor }}</span>
        </p>
      </FormKit>

      <FormInputWithCounter title="Products" group-name="product">
        <FormKit outer-class="sm:w-[15%]" name="name" type="text" label="Name" validation="required"
          placeholder="Product Name" />

        <FormKit outer-class="flex-1" type="number" label="Weight (grams)" name="weight" step="0.1" number="integer"
          validation="required|numeric|min=0" min="0" placeholder="Weight" />
      </FormInputWithCounter>

      <FormInputWithCounter title="Warehouses" group-name="warehouse">
        <FormKit outer-class="sm:w-[35%]" validation="required" name="name" type="text" label="Name"
          placeholder="Warehouse Name" />

        <FormKit outer-class="flex-1" type="number" label="Pos. X" name="x" step="1" number="integer"
          validation="required|numeric|min=1" min="1" placeholder="X" />

        <FormKit outer-class="flex-1" type="number" label="Pos. Y" name="y" step="1" number="integer"
          validation="required|numeric|min=1" min="1" placeholder="Y" />
      </FormInputWithCounter>

      <FormInputWithCounter title="Customer" group-name="customer">
        <FormKit outer-class="sm:w-[35%]" name="name" type="text" label="Name" validation="required" placeholder="Name" />

        <FormKit type="group" name="coordinates">
          <FormKit outer-class="flex-1" type="number" label="Pos. X" name="x" step="1" number="integer"
            validation="required|numeric|min=1" min="1" placeholder="X" />

          <FormKit outer-class="flex-1" type="number" label="Pos. Y" name="y" step="1" number="integer"
            validation="required|numeric|min=1" min="1" placeholder="Y" />
        </FormKit>
      </FormInputWithCounter>

      <FormInputWithCounter title="Types Of Drones" group-name="typeOfDrone">
        <FormKit outer-class="sm:w-[35%]" type="select" name="type" label="Type" placeholder="Drone Type"
          validation="required"
          :options="droneBatteryTypes.map((type) => ({ value: type, label: capitalizeViaSeparator(type, '-') }))" />

        <FormKit outer-class="flex-1" name="capacity" type="text" validation="required" label="Capacity"
          placeholder="1kW" />

        <FormKit outer-class="flex-1" name="consumption" type="text" validation="required" label="Consumption"
          placeholder="1W" />
      </FormInputWithCounter>

      <FormInputWithCounter title="Initial Orders" group-name="orders">
        <FormKit outer-class="flex-1" name="customerId" type="text" validation="required" label="Customer Id"
          placeholder="1kW" />
      </FormInputWithCounter>

      <div class="flex items-center gap-2 w-full">
        <Button class="w-full my-2" type="submit">
          Create
        </Button>
      </div>
    </FormKit>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/components/ui/toast';

const config = useRuntimeConfig()
const { toast } = useToast()

const minutes = ref<{ program: number; real: number }>();

const timeFactor = computed(() => {
  if (!minutes.value?.program || !minutes.value?.real) return null;
  return (1 / minutes.value.program) * minutes.value.real
})

async function onSubmit(input: any) {
  function parseGroupName(allKeys: string[], groupName: string) {
    const groupKeys = allKeys.filter((key) => key.startsWith(groupName));
    return groupKeys.map((key) => input[key])
  }

  function parseProducts(allKeys: string[]) {
    const groupKeys = allKeys.filter((key) => key.startsWith('product'));
    return groupKeys.reduce((acc, curr) => {
      const name = curr.split('-')[0];
      return {
        ...acc,
        [name]: input[curr].weight
      }
    }, {})
  }

  const keys = Object.keys(input);

  const data: SimulationInput = {
    orders: [],
    "map-top-right-coordinate": input.simulationVars['map-top-right-coordinate'],
    output: {
      // NOTE: implemented on the backend, but form requires it at the moment
      poweredOn: true,
      minutes: input.output.minutes
    },
    products: parseProducts(keys),
    typesOfDrones: parseGroupName(keys, 'typeOfDrone'),
    customers: parseGroupName(keys, 'customer').map((v, k) => ({ ...v, id: k + 1 })),
    warehouses: parseGroupName(keys, 'warehouse').map(({ name, x, y }) => ({
      name,
      x: Number(x),
      y: Number(y),
    })),
    deliveryStatus: {
      frequency: input.simulationVars.frequency,
      output: true
    },
    // NOTE: hard-coded because I didn't have enough time to implement them on the backend
    chargingStations: [
      {
        x: 110,
        y: 180,
        type: "cheapest"
      },
      {
        x: 10,
        y: 190,
        type: 'normal'
      },
      {
        x: 200,
        y: 120,
        type: "fast"
      }
    ]
  }

  const { dismiss: dismissCreationToast } = toast({
    title: 'We are creating your simulation...',
    description: 'Please wait a moment, we will redirect you once it is done.',
  })

  try {
    const { slug } = await $fetch<{ status: string, slug: string }>(`${config.public.apiUrl}/simulation/new`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    dismissCreationToast()
    toast({ title: 'Simulation created!' });

    await navigateTo(`/simulation/${slug}`)
  } catch (e) {
    dismissCreationToast()
    toast({ title: 'Failed to create simulation', description: 'Please check if all your inputs are correct, or try again later.' });
    console.error(e)
  }
  console.log(data);
}
</script>
