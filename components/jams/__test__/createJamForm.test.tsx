import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateJamForm } from "../createJamForm";
import { api } from "@/lib/api/client";

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    jams: {
      create: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateJamForm", () => {
  it("calls api and redirects on success", async () => {
    vi.mocked(api.jams.create).mockResolvedValue({
      data: {
        id: "jam-123",
        name: "My Jam",
        description: "A cool jam",
        created_at: "2021-01-01",
      },
      error: undefined,
    });
    render(<CreateJamForm />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Name"), "My Jam");
    await user.type(screen.getByLabelText("Description"), "A cool jam");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(api.jams.create).toHaveBeenCalledWith({
      name: "My Jam",
      description: "A cool jam",
    });
    expect(mockRouterPush).toHaveBeenCalledWith("/jams/jam-123");
  });

  it("shows error on failure", async () => {
    vi.mocked(api.jams.create).mockResolvedValue({
      data: undefined,
      error: "Failed to create jam",
    });
    render(<CreateJamForm />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Name"), "My Jam");
    await user.type(screen.getByLabelText("Description"), "A cool jam");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Failed to create jam")).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
