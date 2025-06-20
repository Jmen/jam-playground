import "zod-openapi/extend";
import { createDocument } from "zod-openapi";
import {
  getProfileEndpointSchema,
  postProfileEndpointSchema,
} from "./my/profile/schema";
import { createJamEndpointSchema, getJamsEndpointSchema } from "./jams/schema";
import {
  registerEndpointSchema,
  signInEndpointSchema,
  signOutEndpointSchema,
  forgotPasswordEndpointSchema,
  resetPasswordEndpointSchema,
} from "./auth/schema";
import { getJamEndpointSchema } from "./jams/[id]/schema";
import { addLoopEndpointSchema } from "./jams/[id]/loops/schema";
import {
  getAudioEndpointSchema,
  uploadAudioEndpointSchema,
} from "./audio/schema";

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Jam Playground API",
    version: "0.0.1",
  },
  paths: {
    "/api/auth/register": {
      post: registerEndpointSchema,
    },
    "/api/auth/sign-in": {
      post: signInEndpointSchema,
    },
    "/api/auth/sign-out": {
      post: signOutEndpointSchema,
    },
    "/api/auth/forgot-password": {
      post: forgotPasswordEndpointSchema,
    },
    "/api/auth/reset-password": {
      post: resetPasswordEndpointSchema,
    },
    "/api/jams": {
      get: getJamsEndpointSchema,
      post: createJamEndpointSchema,
    },
    "/api/jams/{id}": {
      get: getJamEndpointSchema,
    },
    "/api/jams/{id}/loops": {
      post: addLoopEndpointSchema,
    },
    "/api/audio": {
      get: getAudioEndpointSchema,
      post: uploadAudioEndpointSchema,
    },
    "/api/my/profile": {
      get: getProfileEndpointSchema,
      post: postProfileEndpointSchema,
    },
  },
});
