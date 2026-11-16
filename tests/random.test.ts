import { describe, expect, it, vi } from 'vitest'
import { shuffleArray } from '../src/sim/random'

describe('shuffleArray', () => {
  it('devuelve una copia y conserva todos los elementos', () => {
    const input = ['a', 'b', 'c', 'd']
    const result = shuffleArray(input, () => 0.5)
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
    expect(result).not.toBe(input)
    expect(input).toEqual(['a', 'b', 'c', 'd'])
  })

  it('permite controlar la fuente aleatoria para pruebas reproducibles', () => {
    const random = vi.fn().mockReturnValue(0)
    expect(shuffleArray([1, 2, 3], random)).toEqual([2, 3, 1])
    expect(random).toHaveBeenCalledTimes(2)
  })
})
