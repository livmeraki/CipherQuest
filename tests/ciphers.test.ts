import { describe, expect, it } from "vitest";
import { caesarDecrypt, caesarEncrypt, isAnswerAccepted, normalizeAnswer, substitutionTransform, vigenereTransform } from "@/lib/ciphers";

describe("cipher utilities", () => {
  it("encrypts and decrypts Caesar text", () => {
    expect(caesarEncrypt("HELLO, WORLD!", 3)).toBe("KHOOR, ZRUOG!");
    expect(caesarDecrypt("KHOOR, ZRUOG!", 3)).toBe("HELLO, WORLD!");
  });

  it("encrypts and decrypts substitution text", () => {
    const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";
    const encrypted = substitutionTransform("BADGE", alphabet, "encrypt");
    expect(substitutionTransform(encrypted, alphabet, "decrypt")).toBe("BADGE");
  });

  it("encrypts and decrypts Vigenere text", () => {
    const encrypted = vigenereTransform("KEY IS LOCK", "LOCK", "encrypt");
    expect(vigenereTransform(encrypted, "LOCK", "decrypt")).toBe("KEY IS LOCK");
  });

  it("normalizes classroom answers", () => {
    expect(normalizeAnswer(" Student passwords, after lunch! ")).toBe("student passwords after lunch");
    expect(isAnswerAccepted("The bad guys want student passwords and will meet at the computer lab after lunch.", ["passwords computer lab after lunch"])).toBe(true);
  });
});

