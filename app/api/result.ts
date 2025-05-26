export enum ErrorCode {
  USER_ERROR = "user_error",
  SERVER_ERROR = "server_error",
}

export type Result<T> = { data: T } | { error: { code: string; message: string; type: ErrorCode } };

export const isOk = <T>(result: Result<T>): result is { data: T } => "data" in result;

export const isUserError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  "error" in result && result.error.type === ErrorCode.USER_ERROR;

export const isServerError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  "error" in result && result.error.type === ErrorCode.SERVER_ERROR;

export const isError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  isUserError(result) || isServerError(result);
