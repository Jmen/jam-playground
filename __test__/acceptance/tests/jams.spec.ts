import { test } from "@playwright/test";
import { User } from "../dsl/user";
import { createDriver } from "../config";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const dataFolder = "./__test__/acceptance/data";
const wavMimeType = "audio/wav";

const textAudioFile1 = `${dataFolder}/VP3_174_Drums_Loop_Apple.wav`;
const textAudioFile2 = `${dataFolder}/VP3_A#m_172_Synth_Chords_Loop_SaltyBreeze.wav`;
const textAudioFile3 = `${dataFolder}/VP3_A#m_174_Bass_Synth_Loop_Vintage_Full.wav`;

test.use({
  baseURL: BASE_URL,
});

test.describe("Jams", () => {
  test("solo", async () => {
    const user = await User.register(createDriver());

    const jam = await user.jams.create("Solo Jam", "This is a solo jam");

    await user.jams.contains(jam.id);

    const file1 = await user.audio.upload(textAudioFile1, wavMimeType);
    const file2 = await user.audio.upload(textAudioFile2, wavMimeType);
    const file3 = await user.audio.upload(textAudioFile3, wavMimeType);

    const firstLoop = [{ id: file1.id }];
    const secondLoop = [{ id: file1.id }, { id: file2.id }];
    const thirdLoop = [{ id: file1.id }, { id: file2.id }, { id: file3.id }];

    await user.jams.addLoop(jam.id, { audio: firstLoop });
    await user.jams.addLoop(jam.id, { audio: secondLoop });
    await user.jams.addLoop(jam.id, { audio: thirdLoop });

    await user.jams.loopAtPositionIs(jam.id, 0, { audio: thirdLoop });
    await user.jams.loopAtPositionIs(jam.id, 1, { audio: secondLoop });
    await user.jams.loopAtPositionIs(jam.id, 2, { audio: firstLoop });
  });

  test("public", async () => {
    const user = await User.register(createDriver());

    const jam = await user.jams.create("Public Jam", "This is a public jam");

    const user2 = await User.register(createDriver());

    await user2.jams.doesNotContain(jam.id);

    await user.jams.makePublic(jam.id);

    await user2.jams.contains(jam.id);
  });

  test("non-owners cannot change jam access", async () => {
    const owner = await User.register(createDriver());
    const nonOwner = await User.register(createDriver());

    const jam = await owner.jams.create(
      "Private Jam",
      "This jam should stay private",
    );

    await owner.jams.accessIs(jam.id, "private");

    await nonOwner.jams.makePublicNotAllowed(jam.id);

    await owner.jams.accessIs(jam.id, "private");
  });
});
