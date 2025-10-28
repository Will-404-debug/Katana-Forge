import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/validation";

describe("auth schemas", () => {
  it("rejects invalid email and weak password on register", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "123",
      name: "A",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      email: "claire@example.com",
      password: "StrongPass!1",
      name: "Claire",
    });

    expect(result.success).toBe(true);
  });

  it("requires password for login", () => {
    const result = loginSchema.safeParse({
      email: "aiko@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
