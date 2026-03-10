import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "../resetPasswordForm";
import { api } from "@/lib/api/client";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    auth: {
      resetPassword: vi.fn(),
    },
  },
}));

const emailUser = {
  app_metadata: { providers: ["email"] },
} as unknown as Parameters<typeof ResetPasswordForm>[0]["user"];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("renders nothing for non-email users", () => {
    const { container } = render(
      <ResetPasswordForm
        user={
          { app_metadata: { providers: ["google"] } } as unknown as Parameters<
            typeof ResetPasswordForm
          >[0]["user"]
        }
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows success message on successful reset", async () => {
    vi.mocked(api.auth.resetPassword).mockResolvedValue({
      data: {},
      error: undefined,
    });
    render(<ResetPasswordForm user={emailUser} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm Password"),
      "newpassword123",
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(
      await screen.findByText("Your password has been successfully reset."),
    ).toBeInTheDocument();
  });

  it("shows error on failure", async () => {
    vi.mocked(api.auth.resetPassword).mockResolvedValue({
      data: undefined,
      error: "Token expired",
    });
    render(<ResetPasswordForm user={emailUser} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm Password"),
      "newpassword123",
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    expect(await screen.findByText("Token expired")).toBeInTheDocument();
  });
});
