import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "../forgotPasswordForm";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    auth: {
      forgotPassword: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ForgotPasswordForm", () => {
  it("shows Check Your Email card on success", async () => {
    vi.mocked(api.auth.forgotPassword).mockResolvedValue({
      data: {},
      error: undefined,
    });
    render(<ForgotPasswordForm />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(await screen.findByText("Check Your Email")).toBeInTheDocument();
    expect(
      screen.getByText(/If an account exists for this email/),
    ).toBeInTheDocument();
  });

  it("shows error message on failure", async () => {
    vi.mocked(api.auth.forgotPassword).mockResolvedValue({
      data: undefined,
      error: "Rate limit exceeded",
    });
    render(<ForgotPasswordForm />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(await screen.findByText("Rate limit exceeded")).toBeInTheDocument();
  });
});
