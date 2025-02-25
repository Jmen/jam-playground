import { forgotPasswordAction } from "@/components/auth/actions";
import { badRequest, ok } from "../../apiResponse";
import { withErrorHandler } from "../../handlers";

export const POST = withErrorHandler(async (request: Request) => {
  const { email } = await request.json();

  const result = await forgotPasswordAction(email);

  if (result?.error) {
    return badRequest(result.error.code, result.error.message);
  }

  return ok();
});
