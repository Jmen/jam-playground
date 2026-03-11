import { z } from "zod";
import { ApiDriver, ApiContext } from "../drivers/apiDriver";
import { audioFileSchema } from "@/app/api/audio/schema";

export type AudioFile = z.infer<typeof audioFileSchema>;

export class Audio {
  constructor(
    private readonly driver: ApiDriver,
    private context: ApiContext,
  ) {}

  async upload(path: string, type: string): Promise<AudioFile> {
    return await this.driver.audio.upload(this.context, path, type);
  }
}
