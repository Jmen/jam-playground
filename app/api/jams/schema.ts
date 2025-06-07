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

export const createJamSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

export const getJamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
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

export const getJamsEndpointSchema = {
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
        "application/json": { schema: z.array(getJamSchema) },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};

export const createJamEndpointSchema = {
  requestParams: {
    header: z.object({
      Authorization: z.string(),
      "X-Refresh-Token": z.string(),
    }),
  },
  requestBody: {
    content: {
      "application/json": { schema: createJamSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
      content: {
        "application/json": { schema: createJamSchema },
      },
    },
    "400": badRequest,
    "500": internalServerError,
  },
};
