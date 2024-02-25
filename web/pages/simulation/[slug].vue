<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <h1 class="font-mono font-black text-3xl">{{ slug }}</h1>

    <p class="opacity-50" v-if="!ready">
      Preparing simulation...
    </p>
    <p class="opacity-50" v-else-if="!simulation">
      We couldn't find a simulation with that slug.
    </p>
    <div v-else class="w-[65%] min-h-fit flex gap-4">
      <div
        class="max-h-[40rem] overflow-auto flex-1 p-5 flex flex-col gap-4 rounded-md bg-gradient-to-t from-emerald-700/5 to-gray-800/25 transition duration-150 border-2 border-emerald-500/20 hover:border-emerald-500/30">
        <div>
          <p class="font-semibold text-xl pb-2">Warehouses</p>
          <div class="grid grid-cols-2 gap-2">
            <SimulationWarehouse v-for="warehouse in simulation.warehouses" :warehouse="warehouse" :key="warehouse.id" />
          </div>
        </div>

        <div>
          <p class="font-semibold text-xl pb-2">Drones</p>
          <div class="grid grid-cols-3 gap-2">
            <SimulationDrone v-for="drone in simulation.drones" :drone="drone" :key="drone.id" />
          </div>
        </div>

        <div>
          <p class="font-semibold text-xl pb-2">Orders</p>
          <div class="grid grid-cols-3 gap-2">
            <SimulationOrder v-for="order in simulation.orders" :order="order" :key="order.id" />
          </div>
        </div>

      </div>

      <div
        class="w-[25%] min-w-[22rem] p-5 rounded-md bg-gradient-to-t from-emerald-700/5 to-gray-800/25 transition duration-150 border-2 border-emerald-500/20 hover:border-emerald-500/30">
        <p class="font-semibold text-xl pb-2">Analytics</p>

        <div v-if="!analytics" class="">Something went wrong.</div>
        <div class="flex flex-col gap-1.5" v-else>
          <div v-for="{ icon, title, value } in analytics"
            class="w-full group flex items-center justify-between text-sm font-mono">
            <div class="flex items-center gap-1">
              <Icon :name="icon" size="1.25rem" />
              <p>{{ title }}</p>
            </div>
            <div class="mx-1 h-px flex-1 transition duration-300 bg-neutral-400/20 group-hover:bg-emerald-500/60" />
            <p class="tabular-nums">{{ value }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Separator } from 'radix-vue';

type Analytic = keyof Simulation['analytics'];

const route = useRoute();
const _slug = route.params.slug;
const slug = Array.isArray(_slug) ? _slug[0] : _slug;

const ready = ref(false);
const simulation = shallowRef<Simulation | null>(null);

const analytics = useAnalytics();

let socket: WebSocket;
onBeforeMount(() => {
  socket = new WebSocket(`ws://localhost:8080/ws/${slug}`);

  socket.onmessage = (event) => {
    if (event.data.startsWith('No data found for slug')) {
      ready.value = true;
      return;
    }

    try {
      const data = JSON.parse(event.data) as Simulation;
      simulation.value = data;
      ready.value = true;
    } catch (e) {
      console.error("Couldn't parse data", e);
    }
  };
})

onUnmounted(() => {
  socket.close();
});

function useAnalytics() {
  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  });

  const analyticsTitles: Record<Analytic, string> = {
    droneCount: 'Drone Count',
    openOrders: 'Open Orders',
    averageDistancePerDrone: 'Avg. Distance (drone)',
    averageDistancePerOrder: 'Avg. Distance (order)',
    hasOpenOrders: 'Has Open Orders',
    totalDistanceCovered: 'Total Distance',
    totalOrdersDelivered: 'Delivered Orders',
  }

  const analyticsIcons: Record<Analytic, string> = {
    droneCount: 'eos-icons:drone',
    openOrders: 'lucide:package',
    averageDistancePerDrone: 'material-symbols-light:conversion-path',
    averageDistancePerOrder: 'material-symbols-light:conversion-path',
    hasOpenOrders: 'lucide:package-search',
    totalDistanceCovered: 'material-symbols:conversion-path',
    totalOrdersDelivered: 'mdi:package-variant-closed-check',
  }

  function formatValue(value: unknown): string {
    switch (typeof value) {
      case 'number':
        return numberFormatter.format(value);
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'string':
        return value;
      default:
        return 'Unknown';
    }
  }

  const order: Analytic[] = [
    'droneCount',
    'openOrders',
    'totalOrdersDelivered',
    'hasOpenOrders',
    'totalDistanceCovered',
    'averageDistancePerDrone',
    'averageDistancePerOrder',
  ];

  return computed(() => {
    if (!simulation.value) return null;

    const data = Object.entries(simulation.value.analytics).map(([key, value]) => ({
      title: analyticsTitles[key as Analytic],
      icon: analyticsIcons[key as Analytic],
      value: formatValue(value),
    }));

    const orderedData = order.map((key) => data.find((d) => d.title === analyticsTitles[key])!);
    return orderedData;
  });

}
</script>
