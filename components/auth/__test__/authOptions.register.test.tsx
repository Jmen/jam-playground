import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthOptions } from "../authOptions";
import { api } from "@/lib/api/client";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    auth: {
      signIn: vi.fn(),
      register: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

async function fillAndSubmitRegister(email: string, password: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: "Register" }));
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Create Account" }));
}

describe("Register", () => {
  it("switches to register form on tab click", async () => {
    render(<AuthOptions />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("tab", { name: "Register" }));

    expect(
      screen.getByRole("button", { name: "Create Account" }),
    ).toBeInTheDocument();
  });

  it("calls api and redirects on success", async () => {
    vi.mocked(api.auth.register).mockResolvedValue({
      data: {},
      error: undefined,
    });
    render(<AuthOptions />);

    await fillAndSubmitRegister("new@example.com", "password123");

    expect(api.auth.register).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on failure", async () => {
    vi.mocked(api.auth.register).mockResolvedValue({
      data: undefined,
      error: "Email already taken",
    });
    render(<AuthOptions />);

    await fillAndSubmitRegister("taken@example.com", "password123");

    expect(await screen.findByText("Email already taken")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
