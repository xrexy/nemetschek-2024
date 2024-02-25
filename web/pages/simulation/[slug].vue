<template>
  <div class="flex flex-col items-center justify-start gap-4">
    <div class="flex items-center gap-2">
      <h1 class="font-mono font-black text-3xl">{{ slug }}</h1>
      <Button :disabled="!simulation" @click="dialogs.open('history')" variant="ghost" size="icon" title="History">
        <Icon name="solar:history-bold" size="1.3rem" />
      </Button>
      <Button :disabled="!simulation" @click="dialogs.open('droneStatus')" variant="ghost" size="icon"
        title="Drone Statuses">
        <Icon name="carbon:drone-front" size="1.3rem" />
      </Button>
    </div>

    <p class="opacity-50" v-if="!ready">
      Preparing simulation...
    </p>
    <p class="opacity-50" v-else-if="!simulation">
      We couldn't find a simulation with that slug.
    </p>
    <div v-else class="w-[65%] min-h-fit flex flex-col lg:flex-row gap-4">
      <div
        class="max-h-[40rem] overflow-auto flex-1 p-5 flex flex-col gap-4 rounded-md bg-gradient-to-t from-emerald-700/5 to-gray-800/25 transition duration-150 border-2 border-emerald-500/20 hover:border-emerald-500/30">
        <div>
          <div class="w-full flex items-center justify-between">
            <p class="font-semibold text-xl pb-2">Warehouses</p>
            <Button @click="dialogs.open('addWarehouse')" variant="link">
              Add Warehouse
            </Button>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <SimulationItem :key="name" v-for="{ droneIds, position, name } in simulation.warehouses" :title="name"
              :stats="[
                { label: 'Drones Stored', icon: 'eos-icons:drone', value: droneIds.length },
                { label: 'Location', icon: 'material-symbols:pin-drop-outline', value: `X: ${position.x}; Y: ${position.y}` }
              ]" />
          </div>
        </div>

        <div>
          <p class="font-semibold text-xl pb-2">Drones</p>
          <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            <SimulationItem :key="id" v-for="{ battery, id, status } in simulation.drones" :title="`Drone #${id}`" :stats="[
              { label: 'Status', icon: 'ph:pulse', value: status },
              { label: 'Battery', icon: 'material-symbols:battery-horiz-000-rounded', value: `${format(battery.currentCharge)}/${format(battery.capacity)}` },
            ]" />
          </div>
        </div>

        <div>
          <div class="w-full flex items-center justify-between">
            <p class="font-semibold text-xl pb-2">Orders</p>
            <Button @click="dialogs.open('addOrder')" variant="link">
              Add Order
            </Button>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            <SimulationItem :key="id" v-for="{ customer, status, weight, id } in simulation.orders"
              :title="`Order #${id}`" :stats="[
                { label: 'Customer', icon: 'material-symbols-light:deployed-code-account-outline', value: customer.name },
                { label: 'Location', icon: 'material-symbols:pin-drop-outline', value: `X: ${customer.coordinates.x}; Y: ${customer.coordinates.y}` },
                { label: 'Weight', icon: 'material-symbols:weight-outline', value: `${format(weight)} kg` },
                { label: 'Status', icon: 'ph:pulse', value: status },
              ]" />
          </div>
        </div>

        <div>
          <div class="w-full flex items-center justify-between">
            <p class="font-semibold text-xl pb-2">Customers</p>
            <Button @click="dialogs.open('addCustomer')" variant="link">
              Add Customer
            </Button>
          </div>
          <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            <SimulationItem :key="name" v-for="{ name, coordinates } in simulation.customers"
              :title="name" :stats="[
                { label: 'Location', icon: 'material-symbols:pin-drop-outline', value: `X: ${coordinates.x}; Y: ${coordinates.y}` },
              ]" />
          </div>
        </div>

      </div>

      <div
        class="lg:w-[25%] min-w-[22rem] p-5 rounded-md bg-gradient-to-t from-emerald-700/5 to-gray-800/25 transition duration-150 border-2 border-emerald-500/20 hover:border-emerald-500/30">
        <p class="font-semibold text-xl pb-2">Analytics</p>

        <div v-if="!analytics" class="">Something went wrong.</div>
        <div class="flex flex-col gap-1.5" v-else>
          <div v-for=" { icon, title, value }  in  analytics "
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
import { useToast } from '~/components/ui/toast';
import { useAddCustomerDialog } from '~/composables/dialog';

type Analytic = keyof Simulation['analytics'];

const { toast } = useToast();
const route = useRoute();
const _slug = route.params.slug;
const slug = Array.isArray(_slug) ? _slug[0] : _slug;

const ready = ref(false);
const simulation = shallowRef<Simulation | null>(null);

const dialogs = useDialogs();
const analytics = useAnalytics();

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function format(value: number) {
  return numberFormatter.format(value)
}

const lastHistoryIdx = ref(0);
watch(() => simulation.value?.history, (history, oldHistory) => {
  if (!history || !oldHistory) return;
  if (history.data.length === oldHistory.data.length) return;
  const data = history.data.slice(lastHistoryIdx.value);

  if (data.length === 0) return;

  toast({
    title: "History Updated",
    description: `New data has been added to the simulation history. (+${data.length} entries)`,
    duration: 1250,
  })

  lastHistoryIdx.value = history.data.length;
})

let socket: WebSocket;
onUnmounted(() => socket.close());
onBeforeMount(() => {
  socket = new WebSocket(`ws://localhost:8080/ws/${slug}`);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.slug) {
        simulation.value = data;
        ready.value = true;
        return;
      }

      if (data.ok === false) {
        toast({
          title: "Error",
          description: data.message,
        })
        return;
      }

      if (data.event === 'add-order') {
        toast({
          title: "Order Added",
          description: "The order has been added to the simulation.",
        })
      }

      if (data.event === 'add-warehouse') {
        toast({
          title: "Warehouse Added",
          description: "The warehouse has been added to the simulation.",
        })
      }

      if (data.event === 'add-customer') {
        toast({
          title: "Customer Added",
          description: "The customer has been added to the simulation.",
        })
      }
    } catch (e) {
      console.error("Couldn't parse data", e);
    }
  };
})

/** I know, could be lot cleaner with generics and better use of functions, but I have no time at the moment. */
function useDialogs() {
  const addOrderDialog = useAddOrderDialog();
  const addWarehouseDialog = useAddWarehouseDialog();
  const addCustomerDialog = useAddCustomerDialog();

  const droneStatusDialog = useDroneStatusDialog();
  const historyDialog = useHistoryDialog();

  function openAddOrderDialog() {
    if (!simulation.value) return;

    addOrderDialog.open({
      add: (order) => {
        if (socket.readyState !== WebSocket.OPEN) {
          toast({
            title: "Error",
            description: "The simulation is not ready yet.",
          });
          return;
        }

        socket.send(JSON.stringify({
          event: 'add-order',
          payload: order,
        }));
      },
      customers: simulation.value.customers,
      products: simulation.value.products,
      slug,
    });
  }

  function openAddWarehouseDialog() {
    if (!simulation.value) return;

    addWarehouseDialog.open({
      add: (warehouse) => {
        if (socket.readyState !== WebSocket.OPEN) {
          toast({
            title: "Error",
            description: "The simulation is not ready yet.",
          });
          return;
        }

        socket.send(JSON.stringify({
          event: 'add-warehouse',
          payload: warehouse,
        }));
      },
      slug,
    });
  }

  function openAddCustomerDialog() {
    if (!simulation.value) return;

    addCustomerDialog.open({
      add: (customer) => {
        if (socket.readyState !== WebSocket.OPEN) {
          toast({
            title: "Error",
            description: "The simulation is not ready yet.",
          });
          return;
        }

        socket.send(JSON.stringify({
          event: 'add-customer',
          payload: customer,
        }));
      },
      customers: simulation.value.customers,
      slug,
    });
  }

  return {
    open: (type: 'history' | 'addOrder' | 'droneStatus' | 'addWarehouse' | 'addCustomer') => {
      if (type === 'history') {
        if (!simulation.value?.history) return;

        historyDialog.open({
          slug,
          history: simulation.value.history,
        });

        return;
      }

      if (type === 'droneStatus') {
        if (!simulation.value?.drones) return;

        droneStatusDialog.open({
          slug,
          drones: simulation.value.drones,
        });
        return;
      }

      if (type === 'addOrder') {
        openAddOrderDialog()
        return;
      }

      if (type === 'addWarehouse') {
        openAddWarehouseDialog()
        return;
      }

      if (type === 'addCustomer') {
        openAddCustomerDialog()
        return;
      }

      assertNever(type)
    },
    historyDialog,
    addOrderDialog,
    droneStatusDialog,
  }
}

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
