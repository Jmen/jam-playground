import { ITestDriver, Context } from "../drivers/ITestDriver";
import { expect } from "@playwright/test";

export class User {
  private constructor(
    private readonly driver: ITestDriver,
    private context: Context,
    public readonly email: string,
    public readonly password: string,
  ) {}

  static uniqueEmail() {
    return `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;
  }

  static async register(driver: ITestDriver, email = User.uniqueEmail(), password = "password123"): Promise<User> {
    const context = await driver.auth.register(email, password);
    return new User(driver, context, email, password);
  }

  async signIn(email: string, password: string) {
    this.context = await this.driver.auth.signIn(email, password);
  }

  async signInIsUnauthorized(email: string, password: string) {
    await this.driver.auth.signInIsUnauthorized(email, password);
  }

  async signOut() {
    await this.driver.auth.signOut(this.context);
  }

  async resetPassword(newPassword: string) {
    await this.driver.auth.resetPassword(this.context, newPassword);
  }

  async setUsername(username: string) {
    await this.driver.user.setMyProfile(this.context, { username });
  }

  async usernameIs(expectedUsername: string): Promise<void> {
    const profile = await this.driver.user.getMyProfile(this.context);

    expect(profile.username).toBe(expectedUsername);
  }
}
