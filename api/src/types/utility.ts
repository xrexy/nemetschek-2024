export function assetNever(value: never, message = "assetNever received unexpected object"): never {
  throw new Error(message);
}
