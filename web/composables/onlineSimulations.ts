export const useOnlineSimulations = () => {
  const online = useState<MinimalSimulationData[]>('online-simulations', () => []);
  return online;
}
