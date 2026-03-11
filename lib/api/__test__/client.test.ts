import { api } from "../client";

const mockFdefault = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = mockFdefault;
});

function givenResponseIsSuccess<T>(data: T) {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data }),
  } as Response);
}

function givenResponseIsError(message: string) {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: false,
    json: async () => ({ error: { code: "error_code", message } }),
  } as Response);
}

function givenNetworkError() {
  vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));
}

describe("jsonRequest", () => {
  it("returns data on success", async () => {
    givenResponseIsSuccess({ id: "123" });

    const result = await api.auth.signIn({
      email: "test@example.com",
      password: "password",
    });

    expect(result).toEqual({ data: { id: "123" } });
  });

  it("sends correct method, headers, and body", async () => {
    givenResponseIsSuccess({});

    await api.auth.signIn({
      email: "test@example.com",
      password: "password",
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password",
      }),
    });
  });

  it("returns error message on API error", async () => {
    givenResponseIsError("Invalid credentials");

    const result = await api.auth.signIn({
      email: "test@example.com",
      password: "wrong",
    });

    expect(result).toEqual({ error: "Invalid credentials" });
  });

  it("returns generic error on network failure", async () => {
    givenNetworkError();

    const result = await api.auth.signIn({
      email: "test@example.com",
      password: "password",
    });

    expect(result).toEqual({ error: "Network error" });
  });

  it("omits body for bodyless requests", async () => {
    givenResponseIsSuccess({});

    await api.auth.signOut();

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/sign-out", {
      method: "POST",
    });
  });
});

describe("formDataRequest", () => {
  it("sends FormData without Content-Type header", async () => {
    givenResponseIsSuccess({ id: "audio-1" });
    const file = new File(["audio"], "test.mp3", { type: "audio/mpeg" });

    await api.audio.upload(file);

    const [url, options] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe("/api/audio");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);
    expect(options?.headers).toBeUndefined();
  });
});
