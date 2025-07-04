import { z } from "zod";

export const addLoopSchema = z.object({
  audio: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export const loopSchema = z.object({
  audio: z.array(
    z.object({
      id: z.string(),
    }),
  ),
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

export const addLoopEndpointSchema = {
  requestParams: {
    path: z.object({
      id: z.string(),
    }),
    header: z.object({
      Authorization: z.string(),
      "X-Refresh-Token": z.string(),
    }),
  },
  requestBody: {
    content: {
      "application/json": { schema: addLoopSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: loopSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};
