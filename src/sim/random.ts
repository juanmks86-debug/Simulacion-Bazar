/** Devuelve una copia mezclada con Fisher–Yates (uniforme si `random` es uniforme). */
export function shuffleArray<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const sample = random()
    const j = Math.min(i, Math.max(0, Math.floor(sample * (i + 1))))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
