import { test } from "@playwright/test";
import { User } from "../dsl/user";
import { createDriver } from "../config";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const audioPath1 = "./__test__/acceptance/data/VP3_174_Drums_Loop_Apple.wav";
const audioPath2 =
  "./__test__/acceptance/data/VP3_A#m_172_Synth_Chords_Loop_SaltyBreeze.wav";
const audioPath3 =
  "./__test__/acceptance/data/VP3_A#m_174_Bass_Synth_Loop_Vintage_Full.wav";
const audioType = "audio/wav";

test.use({
  baseURL: BASE_URL,
});

test.describe("Jams", () => {
  test("can create a jam", async ({ browser }) => {
    const user = await User.register(createDriver(browser));

    const jam = await user.jams.create("Test Jam", "Test Description");

    await user.jams.contains(jam.id);

    const audio1 = await user.audio.upload(audioPath1, audioType);
    const audio2 = await user.audio.upload(audioPath2, audioType);
    const audio3 = await user.audio.upload(audioPath3, audioType);

    await user.jams.addLoop(jam.id, audio1.id);
    await user.jams.addLoop(jam.id, audio2.id);
    await user.jams.addLoop(jam.id, audio3.id);

    await user.jams.containsLoop(jam.id, audio1.id);
    await user.jams.containsLoop(jam.id, audio2.id);
    await user.jams.containsLoop(jam.id, audio3.id);
  });
});
