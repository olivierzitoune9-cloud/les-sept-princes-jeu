export class SeededRandom {
  private state: number;

  public constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  public chance(probability: number): boolean {
    return this.next() < Math.max(0, Math.min(1, probability));
  }
}
