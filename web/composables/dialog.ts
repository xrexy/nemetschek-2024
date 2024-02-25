import type { History } from "#imports";

export const useDialog = <T>(prefix: string) => {
  const isOpen = useState(`${prefix}-dialog-isOpen`, () => false);

  const data = useState<T | null>(`${prefix}-dialog-data`, () => null);

  watch(isOpen, (open) => {
    if(!open) data.value = null;
  })

  const open = (d: T) => {
    isOpen.value = true;
    data.value = d;
  }

  const close = () => {
    isOpen.value = false;
    data.value = null;
  }

  return {
    isOpen,
    data,
    open,
    close
  }
}

export const useHistoryDialog = () => useDialog<{ history: History, slug: string }>('history')
export const useDroneStatusDialog = () => useDialog<{ drones: Drone[], slug: string }>('drone-status')
export const useAddOrderDialog =  () =>  useDialog<{ addOrder: (order: InputOrder) => void, products: ProductList, customers: Customer[], slug: string }>('add-order')
