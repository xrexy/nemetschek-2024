export function useCounter(initialValue = 1, step = 1) {
  const count = ref(initialValue);

  return {
    count,
    increment: () => {
      count.value+=step;
    },
    decrement: () => {
      const newValue = count.value - step;
      count.value = newValue < step ? step : newValue;
    },
  };
}
