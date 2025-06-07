import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const getProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
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

export const postProfileEndpointSchema = {
  requestBody: {
    content: {
      "application/json": { schema: updateProfileSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: updateProfileSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};

export const getProfileEndpointSchema = {
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: getProfileSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};
