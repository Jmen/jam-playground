import { Context, ITestDriver } from "../drivers/ITestDriver";

export interface AudioFile {
  id: string;
}

export class Audio {
  constructor(
    private readonly driver: ITestDriver,
    private context: Context,
  ) {}

  async upload(path: string, type: string): Promise<AudioFile> {
    return await this.driver.audio.upload(this.context, path, type);
  }
}
