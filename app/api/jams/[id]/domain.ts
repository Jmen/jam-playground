import { ErrorCode, Result } from "../../result";

interface Loop {
  id: string;
  created_at: string;
  audio: Audio[];
}

export interface Audio {
  id: string;
  file_path: string;
  file_name?: string;
}

export interface SignedUrls {
  id: string;
  url: string;
  file_name?: string;
}

export interface JamView {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops: LoopView[];
}

export interface LoopView {
  id: string;
  created_at: string;
  audio: {
    id: string;
    url: string;
    file_name?: string;
  }[];
}

export class Jam {
  constructor(
    private id: string,
    private name: string,
    private description: string,
    private created_at: string,
    private loops: Loop[],
  ) {}

  audio(): Audio[] {
    return this.loops.flatMap((loop) => loop.audio);
  }

  viewWithAudioUrls(audioUrls: SignedUrls[]): Result<JamView> {
    const updatedLoops: LoopView[] = [];

    for (const loop of this.loops) {
      const updatedLoop: LoopView = {
        id: loop.id,
        created_at: loop.created_at,
        audio: [],
      };

      for (const audio of loop.audio) {
        const audioUrl = audioUrls.find((audioUrl) => audioUrl.id === audio.id);

        if (!audioUrl) {
          return {
            error: {
              code: "audio_url_not_found",
              message: "Audio URL not found",
              type: ErrorCode.CLIENT_ERROR,
            },
          };
        }

        const updatedAudio = {
          id: audio.id,
          url: audioUrl.url,
          file_name: audioUrl.file_name || audio.file_name,
        };

        updatedLoop.audio.push(updatedAudio);
      }

      updatedLoops.push(updatedLoop);
    }

    return {
      data: {
        id: this.id,
        name: this.name,
        description: this.description,
        created_at: this.created_at,
        loops: updatedLoops,
      },
    };
  }
}
