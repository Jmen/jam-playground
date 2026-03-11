import { ApiDriver } from "./drivers/apiDriver";

export const createDriver = (): ApiDriver => {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  return new ApiDriver(baseUrl);
};
