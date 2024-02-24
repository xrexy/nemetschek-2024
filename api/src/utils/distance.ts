import type { Position } from "../types/position"

export function distanceBetween(from: Position, to: Position) {
  return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2))
}
