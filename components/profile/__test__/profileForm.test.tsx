import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "../profileForm";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    profile: {
      update: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProfileForm", () => {
  it("displays initial username from props", () => {
    render(<ProfileForm initialUsername="johndoe" />);

    expect(screen.getByDisplayValue("johndoe")).toBeInTheDocument();
  });

  it("calls api and shows success on update", async () => {
    vi.mocked(api.profile.update).mockResolvedValue({
      data: { username: "newusername" },
      error: undefined,
    });

    render(<ProfileForm initialUsername="johndoe" />);

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "newusername");
    await user.click(screen.getByRole("button", { name: "Update Profile" }));

    expect(api.profile.update).toHaveBeenCalledWith({
      username: "newusername",
    });

    expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  });

  it("shows error on update failure", async () => {
    vi.mocked(api.profile.update).mockResolvedValue({
      data: undefined,
      error: "Username already taken",
    });

    render(<ProfileForm initialUsername="johndoe" />);

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "takenuser");
    await user.click(screen.getByRole("button", { name: "Update Profile" }));

    expect(
      await screen.findByText("Username already taken"),
    ).toBeInTheDocument();
  });

  it("shows validation error for short username", async () => {
    render(<ProfileForm initialUsername="johndoe" />);

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "ab");
    await user.click(screen.getByRole("button", { name: "Update Profile" }));

    expect(
      await screen.findByText("username must be at least 3 characters"),
    ).toBeInTheDocument();
  });
});
