import { Context, ITestDriver } from "../drivers/ITestDriver";

export class Audio {
  constructor(
    private readonly driver: ITestDriver,
    private context: Context,
  ) {}

  async upload(path: string, type: string): Promise<{ id: string }> {
    return await this.driver.audio.upload(this.context, path, type);
  }
}
