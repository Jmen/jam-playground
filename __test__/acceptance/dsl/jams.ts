import { Context, ITestDriver, Jam } from "../drivers/ITestDriver";
import { expect } from "@playwright/test";
export class Jams {
  constructor(
    private readonly driver: ITestDriver,
    private context: Context,
  ) {}

  async create(name: string, description: string): Promise<Jam> {
    return await this.driver.jams.create(this.context, name, description);
  }

  async contains(jamId: string): Promise<void> {
    const jams = await this.driver.jams.getAll(this.context);

    const jam = jams.find((j) => j.id === jamId);

    if (!jam) {
      console.log("jamId", jamId);
      console.log("jams", jams);
    }

    expect(jam).toBeTruthy();
  }
}
