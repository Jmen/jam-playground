import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JamDetail } from "../jamDetail";
import type { Jam } from "../JamCard";
import { api } from "@/lib/api/client";

vi.mock("@/components/audio/LoopPlayer", () => ({
  LoopPlayer: () => null,
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    jams: {
      get: vi.fn(),
      makePublic: vi.fn(),
    },
    audio: {
      getAll: vi.fn(),
    },
    loops: {
      add: vi.fn(),
    },
  },
}));

const privateJam: Jam = {
  id: "jam-1",
  name: "Test Jam",
  description: "A test jam",
  created_at: "2024-01-01T00:00:00Z",
  access: "private",
  loops: [],
};

const publicJam: Jam = {
  ...privateJam,
  id: "jam-2",
  access: "public",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("JamDetail", () => {
  it("renders JamCard with jam data", () => {
    render(<JamDetail initialJam={privateJam} />);

    expect(screen.getByTestId("jam-card")).toBeInTheDocument();
    expect(screen.getByTestId("jam-name")).toHaveTextContent("Test Jam");
    expect(screen.getByTestId("jam-description")).toHaveTextContent(
      "A test jam",
    );
    expect(screen.getByTestId("jam-access")).toHaveTextContent(
      "Access: private",
    );
  });

  it("opens Add Loop modal and loads audio files", async () => {
    vi.mocked(api.audio.getAll).mockResolvedValue({
      data: [
        {
          id: "audio-1",
          owner_id: "user-1",
          created_at: "",
          file_hash: "",
          file_path: "",
          file_name: "track.mp3",
          file_size: 0,
          file_type: "audio/mpeg",
        },
      ],
      error: undefined,
    });
    render(<JamDetail initialJam={privateJam} />);

    await userEvent.click(screen.getByTestId("add-loop-button"));

    expect(api.audio.getAll).toHaveBeenCalled();
    expect(await screen.findByTestId("audio-item-audio-1")).toBeInTheDocument();
    expect(screen.getByText("track.mp3")).toBeInTheDocument();
  });

  it("adds loop when selecting audio and clicking Add", async () => {
    vi.mocked(api.audio.getAll).mockResolvedValue({
      data: [
        {
          id: "audio-1",
          owner_id: "user-1",
          created_at: "",
          file_hash: "",
          file_path: "",
          file_name: "track.mp3",
          file_size: 0,
          file_type: "audio/mpeg",
        },
      ],
      error: undefined,
    });
    vi.mocked(api.loops.add).mockResolvedValue({
      data: {},
      error: undefined,
    });
    vi.mocked(api.jams.get).mockResolvedValue({
      data: {
        id: "jam-1",
        name: "Test Jam",
        description: "A test jam",
        created_at: "2024-01-01T00:00:00Z",
        access: "private",
        loops: [
          {
            id: "loop-1",
            created_at: "2024-01-02T00:00:00Z",
            audio: [
              {
                id: "audio-1",
                url: "https://example.com/audio/track.mp3",
                file_name: "track.mp3",
              },
            ],
          },
        ],
      },
      error: undefined,
    });
    render(<JamDetail initialJam={privateJam} />);

    await userEvent.click(screen.getByTestId("add-loop-button"));
    await screen.findByTestId("audio-item-audio-1");
    await userEvent.click(screen.getByTestId("audio-item-audio-1"));
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(api.loops.add).toHaveBeenCalledWith("jam-1", {
      audio: [{ id: "audio-1" }],
    });
    expect(api.jams.get).toHaveBeenCalledWith("jam-1");
  });

  it("shows no audio message when audio list is empty", async () => {
    vi.mocked(api.audio.getAll).mockResolvedValue({
      data: [],
      error: undefined,
    });
    render(<JamDetail initialJam={privateJam} />);

    await userEvent.click(screen.getByTestId("add-loop-button"));

    expect(
      await screen.findByText("No audio files available. Upload some first."),
    ).toBeInTheDocument();
  });

  it("calls makePublic and refetches on Make Public click", async () => {
    vi.mocked(api.jams.makePublic).mockResolvedValue({
      data: {},
      error: undefined,
    });
    vi.mocked(api.jams.get).mockResolvedValue({
      data: {
        id: "jam-1",
        name: "Test Jam",
        description: "A test jam",
        created_at: "2024-01-01T00:00:00Z",
        access: "public",
        loops: [],
      },
      error: undefined,
    });
    render(<JamDetail initialJam={privateJam} />);

    await userEvent.click(screen.getByTestId("make-public-button"));

    expect(api.jams.makePublic).toHaveBeenCalledWith("jam-1");
    expect(api.jams.get).toHaveBeenCalledWith("jam-1");
  });

  it("disables Make Public button when jam is already public", () => {
    render(<JamDetail initialJam={publicJam} />);

    const button = screen.getByTestId("make-public-button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Public");
  });
});
