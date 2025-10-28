import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/quotes/route";
import fixtures from "@/docs/tests/fixtures.json";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({ id: "usr_test" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    katanaQuote: {
      create: createMock,
    },
  },
}));

const makeRequest = (body: unknown) =>
  new Request("http://127.0.0.1/api/quotes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("POST /api/quotes security", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects XSS payload injected in colors", async () => {
    const maliciousPayload = fixtures.quote_malicious;
    process.env.BASE_PRICE = "420";

    const response = await POST(makeRequest(maliciousPayload));

    expect(response.status).toBe(422);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects SQLi-style string for numeric fields", async () => {
    const payload = {
      ...fixtures.quote_valid,
      metalness: "0; DROP TABLE Quote;" as unknown as number,
    };

    const response = await POST(makeRequest(payload));

    expect(response.status).toBe(422);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("accepts a valid payload and persists the quote", async () => {
    const response = await POST(makeRequest(fixtures.quote_valid));

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: expect.any(Number),
          currency: "EUR",
        }),
      }),
    );
  });
});
