<template>
  <Dialog v-if="data" v-model:open="isOpen">
    <DialogContent class="sm:max-w-[450px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>History</DialogTitle>
        <DialogDescription>
          A list of all the events that have occurred in <span class="text-emerald-200">{{ data.slug }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="border-t border-border flex flex-col gap-6 py-4 overflow-y-auto px-6">
        <div v-for="{ event, text, timestamp } in aggregated">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ capitalizeViaSeparator(event, '-') }}</h3>
            <div class="mx-1 h-px flex-1 bg-neutral-600/50" />
            <p class="text-xs text-neutral-500">{{ new Date(timestamp).toUTCString() }}</p>
          </div>

          <p class="text-sm text-gray-400">{{ text }}</p>
        </div>
      </div>
      <DialogFooter class="p-6 pt-0">
        <Button type="submit">
          Save changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { getEffectiveConstraintOfTypeParameter } from 'typescript';

const { isOpen, data } = useHistoryDialog();

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
function format(value: number) {
  return numberFormatter.format(value)
}

type AggregatedData = {
  event: HistoryEvents,
  text: string,
  timestamp: number,
}

function aggregateEvent(entry: HistoryEntry<HistoryEvents>): AggregatedData {
  if (isHistoryEvent(entry, 'created')) {
    return {
      event: entry.event,
      text: 'Simulation created',
      timestamp: entry.createdAt,
    }
  }
  if (isHistoryEvent(entry, 'drone-battery-update')) {
    const { droneId, newCharge, oldCharge } = entry.payload;
    return {
      event: entry.event,
      timestamp: entry.createdAt,
      text: `Drone #${droneId}'s battery changed from ${oldCharge} to ${newCharge}`
    }
  }

  if (isHistoryEvent(entry, 'drone-created')) {
    const { droneId } = entry.payload;
    return {
      event: entry.event,
      timestamp: entry.createdAt,
      text: `Drone #${droneId} created`
    }
  }

  if (isHistoryEvent(entry, 'drone-returned')) {
    const { droneId, warehouseId } = entry.payload;
    return {
      event: entry.event,
      timestamp: entry.createdAt,
      text: `Drone #${droneId} returned to Warehouse #${warehouseId}`
    }
  }

  if (isHistoryEvent(entry, 'drone-sent')) {
    const { distance, droneId, order } = entry.payload;
    const { customerId, id } = order;
    return {
      event: entry.event,
      timestamp: entry.createdAt,
      // text: `Drone #${droneId} sent to warehouse #${warehouseId} to pick up order #${order} (${format(distance)}m.)`
      text: `Drone #${droneId} sent to pick up order #${id} for customer #${customerId} (${format(distance)}m.)`
    }
  }

  if (isHistoryEvent(entry, 'order-fulfilled')) {
    const { droneId, order: { customerId, id, productList } } = entry.payload;
    const normalizedProductList = Object.entries(productList).map(([product]) => product).join(', ');
    return {
      event: entry.event,
      timestamp: entry.createdAt,
      text: `Order #${id} fulfilled by drone #${droneId} for customer #${customerId} with products ${normalizedProductList}`
    }
  }

  throw new Error('Unknown event type');
}

const aggregated = computed(() => {
  if (!data.value?.history) return null;

  const history = data.value.history.data;
  return history.map(aggregateEvent);
});
</script>
