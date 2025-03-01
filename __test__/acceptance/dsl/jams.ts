import { Context, Jam, ITestDriver } from "../drivers/ITestDriver";
import { expect } from "@playwright/test";
export class Jams {
  constructor(
    private readonly driver: ITestDriver,
    private context: Context,
  ) {}

  async create(name: string): Promise<Jam> {
    console.log(this.driver);

    return await this.driver.jams.create(this.context, name);
  }

  async contains(jam: Jam): Promise<void> {
    const jams = await this.driver.jams.getAll(this.context);

    expect(jams).toContain(jam);
  }
}
