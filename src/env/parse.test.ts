import * as z from "zod";

import { parseEnv } from "#/env/parse";

describe("parseEnv", () => {
  it("should parse valid environment variables", () => {
    const schema = z.object({
      PORT: z.string().transform((val) => parseInt(val, 10)),
      DATABASE_URL: z.string(),
    });

    const parsed = parseEnv(
      schema,
      { PORT: "3000", DATABASE_URL: "postgres://user:pass@localhost:5432/db" },
      "server",
    );
    expect(parsed).toEqual({ PORT: 3000, DATABASE_URL: "postgres://user:pass@localhost:5432/db" });
  });

  it("should throw an error for invalid environment variables", () => {
    const schema = z.object({
      PORT: z.coerce.number(),
      DATABASE_URL: z.string(),
    });

    expect(() =>
      parseEnv(
        schema,
        { PORT: "not-a-number", DATABASE_URL: "postgres://user:pass@localhost:5432/db" },
        "server",
      ),
    ).toThrow(/Invalid server environment variables/u);
  });
});
