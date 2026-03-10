import { z } from "zod";
import {
  signInSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/app/api/auth/schema";
import { createJamSchema } from "@/app/api/jams/schema";
import { updateJamSchema } from "@/app/api/jams/[id]/schema";
import type { Jam } from "@/components/jams/JamCard";
import { addLoopSchema } from "@/app/api/jams/[id]/loops/schema";
import { updateProfileSchema } from "@/app/api/my/profile/schema";

export type ApiResult<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: string };

async function formDataRequest<T>(
  url: string,
  formData: FormData,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, { method: "POST", body: formData });
    const result = await response.json();

    if (!response.ok) {
      return {
        data: undefined,
        error: result.error?.message ?? "Request failed",
      };
    }

    return { data: result.data, error: undefined };
  } catch {
    return { data: undefined, error: "An unexpected error occurred" };
  }
}

async function jsonRequest<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const options: RequestInit = { method };
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
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
  } catch {
    return { data: undefined, error: "An unexpected error occurred" };
  }
}

export const api = {
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
      jsonRequest<{ id: string }>("POST", "/api/jams", body),

    get: (id: string) => jsonRequest<Jam>("GET", "/api/jams/" + id),

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
      return formDataRequest<{ id: string }>("/api/audio", formData);
    },

    getAll: () =>
      jsonRequest<
        {
          id: string;
          file_name: string;
          file_type: string;
          created_at: string;
        }[]
      >("GET", "/api/audio"),
  },

  profile: {
    get: () => jsonRequest<{ username: string }>("GET", "/api/my/profile"),

    update: (body: z.infer<typeof updateProfileSchema>) =>
      jsonRequest("POST", "/api/my/profile", body),
  },
};
