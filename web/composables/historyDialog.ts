import type { History } from "#imports";

type Data = { history: History, slug: string };

export const useHistoryDialog = () => {
  const isOpen = useState('history-dialog-isOpen', () => false);

  const data = useState<Data | null>('history-dialog-data', () => null);

  const open = (d: Data) => {
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
