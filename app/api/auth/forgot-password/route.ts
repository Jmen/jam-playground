import { forgotPasswordAction } from "@/components/auth/actions";
import { badRequest, ok } from "../../apiResponse";
import { ApiHandlerBuilder } from "../../apiHandlerBuilder";

export const POST = new ApiHandlerBuilder().build(async (request: Request) => {
  const { email } = await request.json();

  const result = await forgotPasswordAction(email);

  if (result?.error) {
    return badRequest(result.error.code, result.error.message);
  }

  return ok();
});
