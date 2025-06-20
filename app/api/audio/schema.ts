import { z } from "zod";

export const audioFileSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  created_at: z.string(),
  file_hash: z.string(),
  file_path: z.string(),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
});

const badRequest = {
  description: "400 Bad Request",
  content: {
    "application/json": {
      schema: z.object({
        error: z.object({
          code: z.string(),
          message: z.string(),
        }),
      }),
    },
  },
};

const internalServerError = {
  description: "500 Internal Server Error",
  content: {
    "application/json": {
      schema: z.object({
        error: z.object({
          code: z.string(),
          message: z.string(),
        }),
      }),
    },
  },
};

export const getAudioEndpointSchema = {
  requestParams: {
    header: z.object({
      Authorization: z.string(),
      "X-Refresh-Token": z.string(),
    }),
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: z.array(audioFileSchema) },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};

export const uploadAudioEndpointSchema = {
  requestParams: {
    header: z.object({
      Authorization: z.string(),
      "X-Refresh-Token": z.string(),
    }),
  },
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: z.object({
          file: z.any().describe("Audio file to upload"),
        }),
      },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: audioFileSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};
