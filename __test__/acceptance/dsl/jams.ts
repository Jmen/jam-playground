import { z } from "zod";
import { ApiDriver, ApiContext } from "../drivers/apiDriver";
import { expect } from "vitest";
import { addLoopSchema } from "@/app/api/jams/[id]/loops/schema";
import { getJamSchema } from "@/app/api/jams/[id]/schema";
import { createJamResponseSchema } from "@/app/api/jams/schema";

export type DraftLoop = z.infer<typeof addLoopSchema>;

export type Loop = z.infer<typeof getJamSchema>["loops"][number];

export type Jam =
  | z.infer<typeof getJamSchema>
  | (z.infer<typeof createJamResponseSchema> & {
      access?: string;
      loops?: Loop[];
    });

export class Jams {
  constructor(
    private readonly driver: ApiDriver,
    private context: ApiContext,
  ) {}

  async create(name: string, description: string): Promise<Jam> {
    return await this.driver.jams.create(this.context, name, description);
  }

  async contains(jamId: string): Promise<void> {
    const maxAttempts = 3;
    const delayMs = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const jams = await this.driver.jams.getAll(this.context);
      const jam = jams.find((j) => j.id === jamId);

      if (jam) {
        expect(jam).toBeTruthy();
        return;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const jams = await this.driver.jams.getAll(this.context);
    const jam = jams.find((j) => j.id === jamId);

    if (!jam) {
      console.log("jamId", jamId);
      console.log("jams", jams);
    }

    expect(jam).toBeTruthy();
  }

  async doesNotContain(jamId: string): Promise<void> {
    const jams = await this.driver.jams.getAll(this.context);

    const jam = jams.find((j) => j.id === jamId);

    expect(jam).toBeFalsy();
  }

  async makePublic(jamId: string): Promise<void> {
    await this.driver.jams.makePublic(this.context, jamId);
  }

  async addLoop(jamId: string, draftLoop: DraftLoop): Promise<void> {
    await this.driver.jams.addLoop(this.context, jamId, draftLoop);
  }

  async accessIs(
    jamId: string,
    expectedAccess: "public" | "private",
  ): Promise<void> {
    const jam = await this.driver.jams.get(this.context, jamId);
    expect(jam?.access).toBe(expectedAccess);
  }

  async makePublicNotAllowed(jamId: string): Promise<void> {
    await this.driver.jams.makePublicNotAllowed(this.context, jamId);
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
