import { ApiDriver } from "./drivers/apiDriver";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const createDriver = (): ApiDriver => {
  return new ApiDriver(BASE_URL);
};
