import { ApiContext } from "./apiDriver";
import { WebContext } from "./webDriver";

export type Context = ApiContext | WebContext;

export interface Jam {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITestDriver {
  auth: {
    register(email: string, password: string): Promise<Context>;
    signIn(email: string, password: string): Promise<Context>;
    signInIsUnauthorized(email: string, password: string): Promise<void>;
    signOut(context: Context): Promise<void>;
    resetPassword(context: Context, newPassword: string): Promise<void>;
  };
  user: {
    setMyProfile(context: Context, profile: { username: string }): Promise<void>;
    getMyProfile(context: Context): Promise<{ username: string }>;
  };
  jams: {
    create(context: Context, name: string, description: string): Promise<void>;
    getAll(context: Context): Promise<Jam[]>;
    get(context: Context, name: string): Promise<Jam | undefined>;
  };
}
