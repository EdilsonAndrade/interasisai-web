import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./adminSession";

const SECRET = "test-secret-with-enough-entropy";

describe("adminSession", () => {
  it("creates and verifies a signed token", () => {
    const token = createAdminSessionToken(SECRET, 1_000, 300);

    expect(verifyAdminSessionToken(token, SECRET, 1_100)).toEqual({
      subject: "admin",
      issuedAt: 1_000,
      expiresAt: 1_300,
    });
  });

  it("rejects expired and modified tokens", () => {
    const token = createAdminSessionToken(SECRET, 1_000, 300);

    expect(verifyAdminSessionToken(token, SECRET, 1_301)).toBeNull();
    expect(verifyAdminSessionToken(`${token}x`, SECRET, 1_100)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createAdminSessionToken(SECRET, 1_000, 300);

    expect(verifyAdminSessionToken(token, "another-secret", 1_100)).toBeNull();
  });
});