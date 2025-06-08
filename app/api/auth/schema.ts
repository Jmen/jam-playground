import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const signOutSchema = z.object({});

export const signInEndpointSchema = {
  requestBody: {
    content: {
      "application/json": { schema: signInSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
    },
  },
};

export const registerEndpointSchema = {
  requestBody: {
    content: {
      "application/json": { schema: registerSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
    },
  },
};

export const forgotPasswordEndpointSchema = {
  requestBody: {
    content: {
      "application/json": { schema: forgotPasswordSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
    },
  },
};

export const resetPasswordEndpointSchema = {
  requestBody: {
    content: {
      "application/json": { schema: resetPasswordSchema },
    },
  },
  responses: {
    "200": {
      description: "200 OK",
    },
  },
};

export const signOutEndpointSchema = {
  responses: {
    "200": {
      description: "200 OK",
    },
  },
};
