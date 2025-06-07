import { logger } from "@/lib/logger";
import { badRequest, internalServerError, ok } from "./apiResponse";

export enum ErrorCode {
  CLIENT_ERROR = "client_error",
  SERVER_ERROR = "server_error",
}

export type Result<T> =
  | { data: T }
  | { error: { code: string; message: string; type: ErrorCode } };

export const isOk = <T>(result: Result<T>): result is { data: T } =>
  "data" in result;

export const isUserError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  "error" in result && result.error.type === ErrorCode.CLIENT_ERROR;

export const isServerError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  "error" in result && result.error.type === ErrorCode.SERVER_ERROR;

export const isError = <T>(
  result: Result<T>,
): result is { error: { code: string; message: string; type: ErrorCode } } =>
  isUserError(result) || isServerError(result);

export const createResponse = async <T>(
  result: Result<T>,
  body: unknown,
  action: string,
) => {
  if (isUserError(result)) {
    logger.error({ error: result.error, body }, `Failed to ${action}`);
    return badRequest(result.error.message);
  }

  if (isServerError(result)) {
    logger.error({ error: result.error, body }, `Failed to ${action}`);
    return internalServerError();
  }

  return ok(result.data);
};
