import { Context, ITestDriver } from "../drivers/ITestDriver";
import { expect } from "@playwright/test";
export class Jams {
  constructor(
    private readonly driver: ITestDriver,
    private context: Context,
  ) {}

  async create(name: string, description: string): Promise<void> {
    return await this.driver.jams.create(this.context, name, description);
  }

  async contains(name: string): Promise<void> {
    const jam = await this.driver.jams.get(this.context, name);
    
    expect(jam).toBeTruthy();
  }
}
