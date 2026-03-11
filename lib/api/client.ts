import { z } from "zod";
import {
  signInSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/app/api/auth/schema";
import {
  createJamSchema,
  createJamResponseSchema,
  getJamSchema as getJamListSchema,
} from "@/app/api/jams/schema";
import { getJamSchema, updateJamSchema } from "@/app/api/jams/[id]/schema";
import { addLoopSchema } from "@/app/api/jams/[id]/loops/schema";
import {
  getProfileSchema,
  updateProfileSchema,
} from "@/app/api/my/profile/schema";
import { audioFileSchema } from "@/app/api/audio/schema";

export type ApiResult<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: string };

export type ApiConfig = {
  baseUrl?: string;
  getHeaders?: () => Record<string, string>;
};

export function createApi(config: ApiConfig = {}) {
  const baseUrl = config.baseUrl ?? "";
  const getHeaders = config.getHeaders ?? (() => ({}));

  async function formDataRequest<T>(
    path: string,
    formData: FormData,
  ): Promise<ApiResult<T>> {
    try {
      const url = baseUrl + path;
      const headers = getHeaders();
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          data: undefined,
          error: result.error?.message ?? "Request failed",
        };
      }

      return { data: result.data, error: undefined };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      return { data: undefined, error: message };
    }
  }

  async function jsonRequest<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> {
    try {
      const url = baseUrl + path;
      const headers: Record<string, string> = { ...getHeaders() };
      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      const options: RequestInit = { method };
      if (Object.keys(headers).length > 0) {
        options.headers = headers;
      }
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        return {
          data: undefined,
          error: result.error?.message ?? "Request failed",
        };
      }

      return { data: result.data, error: undefined };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      return { data: undefined, error: message };
    }
  }

  return {
    auth: {
      signIn: (body: z.infer<typeof signInSchema>) =>
        jsonRequest("POST", "/api/auth/sign-in", body),

      register: (body: z.infer<typeof registerSchema>) =>
        jsonRequest("POST", "/api/auth/register", body),

      signOut: () => jsonRequest("POST", "/api/auth/sign-out"),

      forgotPassword: (body: z.infer<typeof forgotPasswordSchema>) =>
        jsonRequest("POST", "/api/auth/forgot-password", body),

      resetPassword: (body: z.infer<typeof resetPasswordSchema>) =>
        jsonRequest("POST", "/api/auth/reset-password", body),
    },

    jams: {
      create: (body: z.infer<typeof createJamSchema>) =>
        jsonRequest<z.infer<typeof createJamResponseSchema>>(
          "POST",
          "/api/jams",
          body,
        ),

      getAll: () =>
        jsonRequest<z.infer<typeof getJamListSchema>[]>("GET", "/api/jams"),

      get: (id: string) =>
        jsonRequest<z.infer<typeof getJamSchema>>("GET", "/api/jams/" + id),

      makePublic: (id: string) =>
        jsonRequest("PUT", "/api/jams/" + id, {
          public: true,
        } satisfies z.infer<typeof updateJamSchema>),
    },

    loops: {
      add: (jamId: string, body: z.infer<typeof addLoopSchema>) =>
        jsonRequest("POST", "/api/jams/" + jamId + "/loops", body),
    },

    audio: {
      upload: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return formDataRequest<z.infer<typeof audioFileSchema>>(
          "/api/audio",
          formData,
        );
      },

      getAll: () =>
        jsonRequest<z.infer<typeof audioFileSchema>[]>("GET", "/api/audio"),
    },

    profile: {
      get: () =>
        jsonRequest<z.infer<typeof getProfileSchema>>("GET", "/api/my/profile"),

      update: (body: z.infer<typeof updateProfileSchema>) =>
        jsonRequest("POST", "/api/my/profile", body),
    },
  };
}

export const api = createApi();
