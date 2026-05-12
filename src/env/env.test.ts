import { createServerEnv } from "#/env/server-parser";

describe("runtime guard", () => {
  it("blocks server env access on client runtime", () => {
    const envVariables = {
      PORT: "3000",
    };

    const env = createServerEnv({
      isServerRuntime: false,
      source: envVariables,
    });

    expect(() => env.PORT).toThrow(/serverEnv cannot be accessed on the client/);
  });
});
