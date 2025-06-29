import { Context, ITestDriver } from "../drivers/ITestDriver";
import { expect } from "@playwright/test";

export interface DraftLoop {
  audio: {
    id: string;
  }[];
}

export interface Loop {
  audio: {
    id: string;
    url: string;
  }[];
}

export interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops: Loop[];
}

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

  async addLoop(jamId: string, draftLoop: DraftLoop): Promise<void> {
    await this.driver.jams.addLoop(this.context, jamId, draftLoop);
  }

  async loopAtPositionIs(
    jamId: string,
    position: number,
    expectedLoop: DraftLoop,
  ): Promise<void> {
    const jam = await this.driver.jams.get(this.context, jamId);

    expect(jam).toBeTruthy();
    expect(jam?.loops).toBeTruthy();

    for (const audio of expectedLoop.audio) {
      const foundAudio = jam?.loops[position].audio.find(
        (a) => a.id === audio.id,
      );

      expect(foundAudio).toBeTruthy();
      expect(foundAudio?.id).toBeTruthy();
    }
  }
}
