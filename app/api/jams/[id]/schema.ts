import { z } from "zod";

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

export const getJamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  loops: z.array(
    z.object({
      audio: z.array(
        z.object({
          id: z.string(),
        }),
      ),
    }),
  ),
});

export const getJamEndpointSchema = {
  requestParams: {
    path: z.object({
      id: z.string(),
    }),
    header: z.object({
      Authorization: z.string(),
      "X-Refresh-Token": z.string(),
    }),
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: getJamSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};
