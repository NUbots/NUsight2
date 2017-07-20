import * as seedrandom from 'seedrandom'

export class SeededRandom {
  public constructor(private prng: seedrandom.prng) {
  }

  public static of(seed: string) {
    return new SeededRandom(seedrandom(seed))
  }

  public float(): number {
    return this.prng()
  }

  public integer(min: number, max: number): number {
    return Math.floor(this.prng() * (max - min) + min)
  }

  public choice<T>(arr: T[]): T {
    const index = this.integer(0, arr.length)
    return arr[index]
  }
}
