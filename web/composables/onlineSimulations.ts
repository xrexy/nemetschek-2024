export const useOnlineSimulations = () => {
  const online = useState<MinimalSimulation[]>('online-simulations', () => []);
  return online;
}
