<template>
  <Dialog v-if="data" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[450px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Drone Statuses</DialogTitle>
        <DialogDescription>
          The current status of all drones in <span class="text-emerald-200">{{ data.slug }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="border-t border-border flex flex-col gap-6 py-4 overflow-y-auto px-6">
        <div v-for="{ status, text, timestampDiff, id } in aggregated">
          <div class="flex items-center justify-between">
            <h3 class="font-bold">Drone #{{ id }}</h3>
            <div class="mx-1 h-px flex-1 bg-neutral-600/50" />
            <p class="text-xs text-neutral-500">{{ capitalizeViaSeparator(status, '-') }} for {{ formatDate(timestampDiff)
            }}</p>
          </div>

          <p class="text-sm text-gray-400">{{ text }}</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
const { isOpen, data } = useDroneStatusDialog();

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function format(value: number) {
  return numberFormatter.format(value)
}

function formatDate(diff: number) {
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  if (seconds > 0) return `${seconds}s`;
  return `${diff}ms`;
}

type AggregatedData = {
  status: DroneStatus,
  id: number,
  text: string,
  timestampDiff: number
}

function aggregateEvent(drone: Drone): AggregatedData {
  const now = Date.now();
  if (drone.status === 'charging') {
    return {
      status: drone.status,
      id: drone.id,
      text: `INTERNAL___UNIMPLEMENTED`,
      timestampDiff: 0
    };
  }

  if (drone.status === 'delivering') {
    const { distance, distanceCovered, orderId, startedAt } = getStatusData(drone, drone.status)!;
    const percentageDone = (distanceCovered / distance) * 100;
    return {
      status: drone.status,
      id: drone.id,
      text: `Delivering order #${orderId} (${format(percentageDone)}% done)`,
      timestampDiff: now - startedAt
    };
  }

  if (drone.status === 'idle') {
    const { arrivedAt, warehouseId } = getStatusData(drone, drone.status)!;
    return {
      status: drone.status,
      id: drone.id,
      text: `Idle at Warehouse #${warehouseId}`,
      timestampDiff: now - arrivedAt
    };
  }

  if (drone.status === 'pre-deployment') {
    const { distance, orderId, originWarehouseId, startedAt } = getStatusData(drone, drone.status)!
    return {
      status: drone.status,
      id: drone.id,
      text: `Preparing to deliver order #${orderId} from Warehouse #${originWarehouseId} (${format(distance)}m.)`,
      timestampDiff: now - startedAt
    }
  }

  if (drone.status === 'resupplying') {
    const { startedAt, warehouseIdx } = getStatusData(drone, drone.status)!;
    return {
      status: drone.status,
      id: drone.id,
      text: `Resupplying at Warehouse #${warehouseIdx}`,
      timestampDiff: now - startedAt
    }
  }

  if (drone.status === 'returning') {
    const { distance, distanceCovered, goingTo: { warehouseId }, startedAt } = getStatusData(drone, drone.status)!;
    const percentageDone = (distanceCovered / distance) * 100;
    return {
      status: drone.status,
      id: drone.id,
      text: `Returning to Warehouse #${warehouseId} (${format(percentageDone)}% done)`,
      timestampDiff: now - startedAt
    }
  }

  assertNever(drone.status);
}

const aggregated = computed(() => {
  if (!data.value) return null;
  return data.value.drones.map(aggregateEvent);
});
</script>
