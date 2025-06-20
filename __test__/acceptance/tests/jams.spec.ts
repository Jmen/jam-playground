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
  test("solo, private, and public jams", async ({ browser }) => {
    // solo jam
    const user = await User.register(createDriver(browser));

    const jam = await user.jams.create("Cool Jam", "This is a cool jam");

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

    // private collaborative jam
    // const user2 = await User.register(createDriver(browser));
    // await user.jams.invite(user2.id, jam.id);

    // await user2.jams.invites.contains(jam.id);

    // await user2.jams.join(jam.id);

    // await user2.jams.contains(jam.id);

    // const audio4 = await user2.audio.upload(audioPath1, audioType);
    // const audio5 = await user2.audio.upload(audioPath2, audioType);
    // const audio6 = await user2.audio.upload(audioPath3, audioType);

    // await user2.jams.addAudio(jam.id, audio4.id);
    // await user2.jams.addAudio(jam.id, audio5.id);
    // await user2.jams.addAudio(jam.id, audio6.id);

    // await user2.jams.loopsAre(jam.id, 3, [audio4.id, audio5.id, audio6.id]);
    // await user2.jams.loopsAre(jam.id, 4, [audio5.id, audio6.id]);
    // await user2.jams.loopsAre(jam.id, 5, [audio6.id]);
  });
});
