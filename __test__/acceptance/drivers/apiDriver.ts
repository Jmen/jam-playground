import { ITestDriver } from "./ITestDriver";
import { DraftLoop, Jam } from "../dsl/jams";
import { AudioFile } from "@/__test__/acceptance/dsl/audio";

export interface ApiContext {
  accessToken?: string;
  refreshToken?: string;
}

export class ApiDriver implements ITestDriver {
  constructor(private readonly baseUrl: string) {}

  async checkResponse<T = unknown>(
    request: Request,
    response: Response,
    expectedStatusCode: number = 200,
  ): Promise<T> {
    if (response.status !== expectedStatusCode) {
      console.error("REQUEST:");
      console.error(` method: ${request.method}`);
      console.error(` path: ${request.url}`);
      console.error(` data: ${JSON.stringify(request.body)}`);
      console.error("RESPONSE:");
      console.error(` expected status: ${expectedStatusCode}`);
      console.error(` actual   status: ${response.status}`);
      console.error(` data: ${JSON.stringify(await response.json())}`);

      throw new Error(response.statusText);
    }

    return (await response.json()) as T;
  }

  auth = {
    register: async (email: string, password: string): Promise<ApiContext> => {
      const request = new Request(`${this.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: ApiContext }>(
        request,
        response,
      );

      return body.data;
    },
    signIn: async (email: string, password: string): Promise<ApiContext> => {
      const request = new Request(`${this.baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: ApiContext }>(
        request,
        response,
      );

      return body.data;
    },
    signInIsUnauthorized: async (
      email: string,
      password: string,
    ): Promise<void> => {
      const request = new Request(`${this.baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const response = await fetch(request);

      await this.checkResponse(request, response, 400);
    },
    signOut: async (context: ApiContext): Promise<void> => {
      const request = new Request(`${this.baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
      });

      const response = await fetch(request);

      await this.checkResponse(request, response);
    },
    resetPassword: async (
      context: ApiContext,
      newPassword: string,
    ): Promise<void> => {
      const request = new Request(`${this.baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "Content-Type": "application/json",
          "X-Refresh-Token": context.refreshToken || "",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const response = await fetch(request);

      await this.checkResponse(request, response);
    },
  };

  user = {
    setMyProfile: async (
      context: ApiContext,
      profile: { username: string },
    ): Promise<void> => {
      const request = new Request(`${this.baseUrl}/api/my/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const response = await fetch(request);

      await this.checkResponse(request, response);
    },
    getMyProfile: async (
      context: ApiContext,
    ): Promise<{ username: string }> => {
      const request = new Request(`${this.baseUrl}/api/my/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: { username: string } }>(
        request,
        response,
      );

      return body.data;
    },
  };

  jams = {
    create: async (
      context: ApiContext,
      name: string,
      description: string,
    ): Promise<Jam> => {
      const request = new Request(`${this.baseUrl}/api/jams`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: Jam }>(request, response);

      return body.data;
    },
    getAll: async (context: ApiContext): Promise<Jam[]> => {
      const request = new Request(`${this.baseUrl}/api/jams`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: Jam[] }>(request, response);

      return body.data;
    },
    get: async (
      context: ApiContext,
      jamId: string,
    ): Promise<Jam | undefined> => {
      const request = new Request(`${this.baseUrl}/api/jams/${jamId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: Jam }>(request, response);

      return body.data;
    },
    addLoop: async (
      context: ApiContext,
      jamId: string,
      draftLoop: DraftLoop,
    ): Promise<void> => {
      const request = new Request(`${this.baseUrl}/api/jams/${jamId}/loops`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftLoop),
      });

      const response = await fetch(request);

      await this.checkResponse(request, response);
    },
  };

  audio = {
    upload: async (
      context: ApiContext,
      path: string,
      type: string,
    ): Promise<AudioFile> => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      const audioData = fs.readFileSync(path);
      const fileName = path.split("/").pop();
      const audioFile = new File([audioData], fileName!, { type });

      const formData = new FormData();
      formData.append("file", audioFile);

      const request = new Request(`${this.baseUrl}/api/audio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
        body: formData,
      });

      const response = await fetch(request);

      const body = await this.checkResponse<{ data: AudioFile }>(
        request,
        response,
      );

      return body.data;
    },
  };
}
