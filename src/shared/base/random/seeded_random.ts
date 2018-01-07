import * as seedrandom from 'seedrandom'

/**
 * A seeded pseudo-random number generator. When given the same seed, it will always produce the same set of values.
 *
 * Useful in tests or fakes to generate a predictable range of values that will be the same each time the test is run.
 */
export class SeededRandom {
  public constructor(private prng: () => number) {
  }

  public static of(seed: string) {
    return new SeededRandom(seedrandom(seed))
  }

  public float(min: number = 0, max: number = min + 1): number {
    return this.prng() * (max - min) + min
  }

  public integer(min: number, max: number): number {
    return Math.floor(this.float(min, max))
  }

  public choice<T>(arr: T[]): T {
    const index = this.integer(0, arr.length)
    return arr[index]
  }
}
