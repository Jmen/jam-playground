import { ITestDriver } from "./ITestDriver";

export interface ApiContext {
  accessToken?: string;
  refreshToken?: string;
}

export class ApiDriver implements ITestDriver {
  constructor(private readonly baseUrl: string) {}

  async checkResponse(request: Request, response: Response, expectedStatusCode: number = 200): Promise<any> {
    const responseBody = await response.json();

    if (response.status !== expectedStatusCode) {
      console.error("REQUEST:");
      console.error(` method: ${request.method}`);
      console.error(` path: ${request.url}`);
      console.error(` data: ${JSON.stringify(request.body)}`);
      console.error("RESPONSE:");
      console.error(` expected status: ${expectedStatusCode}`);
      console.error(` actual   status: ${response.status}`);
      console.error(` data: ${JSON.stringify(responseBody)}`);

      throw new Error(response.statusText);
    }

    return responseBody;
  }

  auth = {
    register: async (email: string, password: string): Promise<ApiContext> => {
      const request = new Request(`${this.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const response = await fetch(request);

      const body = await this.checkResponse(request, response);

      return {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
      };
    },

    signIn: async (email: string, password: string): Promise<ApiContext> => {
      const request = new Request(`${this.baseUrl}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const response = await fetch(request);

      const body = await this.checkResponse(request, response);

      return {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
      };
    },

    signInIsUnauthorized: async (email: string, password: string): Promise<void> => {
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

    resetPassword: async (context: ApiContext, newPassword: string): Promise<void> => {
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
    setMyProfile: async (context: ApiContext, profile: { username: string }): Promise<void> => {
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
    getMyProfile: async (context: ApiContext): Promise<{ username: string }> => {
      const request = new Request(`${this.baseUrl}/api/my/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.accessToken}`,
          "X-Refresh-Token": context.refreshToken || "",
        },
      });

      const response = await fetch(request);

      const body = await this.checkResponse(request, response);

      return body.data;
    },
  };
}
