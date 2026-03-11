import { z } from "zod";
import { createApi } from "@/lib/api/client";
import { getProfileSchema } from "@/app/api/my/profile/schema";
import { addLoopSchema } from "@/app/api/jams/[id]/loops/schema";
import { getJamSchema } from "@/app/api/jams/[id]/schema";
import { createJamResponseSchema } from "@/app/api/jams/schema";
import { audioFileSchema } from "@/app/api/audio/schema";

export interface ApiContext {
  accessToken?: string;
  refreshToken?: string;
}

export class ApiDriver {
  constructor(private readonly baseUrl: string) {}

  private client(context?: ApiContext) {
    return createApi({
      baseUrl: this.baseUrl,
      getHeaders: context
        ? () => ({
            Authorization: `Bearer ${context.accessToken}`,
            "X-Refresh-Token": context.refreshToken || "",
          })
        : undefined,
    });
  }

  auth = {
    register: async (email: string, password: string): Promise<ApiContext> => {
      const result = await this.client().auth.register({ email, password });
      if (result.error) throw new Error(result.error);
      return result.data as ApiContext;
    },
    signIn: async (email: string, password: string): Promise<ApiContext> => {
      const result = await this.client().auth.signIn({ email, password });
      if (result.error) throw new Error(result.error);
      return result.data as ApiContext;
    },
    signInIsUnauthorized: async (
      email: string,
      password: string,
    ): Promise<void> => {
      const result = await this.client().auth.signIn({ email, password });
      if (!result.error) throw new Error("Expected unauthorized");
    },
    signOut: async (context: ApiContext): Promise<void> => {
      const result = await this.client(context).auth.signOut();
      if (result.error) throw new Error(result.error);
    },
    resetPassword: async (
      context: ApiContext,
      newPassword: string,
    ): Promise<void> => {
      const result = await this.client(context).auth.resetPassword({
        password: newPassword,
      });
      if (result.error) throw new Error(result.error);
    },
  };

  user = {
    setMyProfile: async (
      context: ApiContext,
      profile: { username: string },
    ): Promise<void> => {
      const result = await this.client(context).profile.update(profile);
      if (result.error) throw new Error(result.error);
    },
    getMyProfile: async (
      context: ApiContext,
    ): Promise<z.infer<typeof getProfileSchema>> => {
      const result = await this.client(context).profile.get();
      if (result.error) throw new Error(result.error);
      return result.data as z.infer<typeof getProfileSchema>;
    },
  };

  jams = {
    create: async (
      context: ApiContext,
      name: string,
      description: string,
    ): Promise<z.infer<typeof createJamResponseSchema>> => {
      const result = await this.client(context).jams.create({
        name,
        description,
      });
      if (result.error) throw new Error(result.error);
      return result.data as z.infer<typeof createJamResponseSchema>;
    },
    getAll: async (
      context: ApiContext,
    ): Promise<z.infer<typeof createJamResponseSchema>[]> => {
      const result = await this.client(context).jams.getAll();
      if (result.error) throw new Error(result.error);
      return result.data as z.infer<typeof createJamResponseSchema>[];
    },
    get: async (
      context: ApiContext,
      jamId: string,
    ): Promise<z.infer<typeof getJamSchema> | undefined> => {
      const result = await this.client(context).jams.get(jamId);
      if (result.error) throw new Error(result.error);
      return result.data as z.infer<typeof getJamSchema>;
    },
    addLoop: async (
      context: ApiContext,
      jamId: string,
      draftLoop: z.infer<typeof addLoopSchema>,
    ): Promise<void> => {
      const result = await this.client(context).loops.add(jamId, draftLoop);
      if (result.error) throw new Error(result.error);
    },
    makePublic: async (context: ApiContext, jamId: string): Promise<void> => {
      const result = await this.client(context).jams.makePublic(jamId);
      if (result.error) throw new Error(result.error);
    },
    makePublicNotAllowed: async (
      context: ApiContext,
      jamId: string,
    ): Promise<void> => {
      await this.client(context).jams.makePublic(jamId);
      // API returns 200 even when non-owner; update matches 0 rows so jam stays private
    },
  };

  audio = {
    upload: async (
      context: ApiContext,
      path: string,
      type: string,
    ): Promise<z.infer<typeof audioFileSchema>> => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      const audioData = fs.readFileSync(path);
      const fileName = path.split("/").pop();
      const audioFile = new File([audioData], fileName!, { type });

      const result = await this.client(context).audio.upload(audioFile);
      if (result.error) throw new Error(result.error);
      return result.data as z.infer<typeof audioFileSchema>;
    },
  };
}
