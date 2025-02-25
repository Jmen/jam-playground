import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiResponseBuilder {
  static success<T>(data: T): ApiResponse<T> {
    return {
      data,
    };
  }

  static error(code: string, message: string): ApiResponse<never> {
    return {
      error: {
        code,
        message,
      },
    };
  }
}

export const ok = function <T>(data?: T) {
  return NextResponse.json(ApiResponseBuilder.success(data));
};

export const badRequest = function (code: string = "bad_request", message: string = "Bad request") {
  return NextResponse.json(ApiResponseBuilder.error(code, message), {
    status: 400,
  });
};

export const unauthorised = function (error: string = "Unauthorised") {
  return NextResponse.json(ApiResponseBuilder.error("unauthorised", error), {
    status: 401,
  });
};

export const internalServerError = function () {
  return NextResponse.json(ApiResponseBuilder.error("internal_server_error", "Internal server error"), { status: 500 });
};
