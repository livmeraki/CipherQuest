const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function normalizeShift(shift: number) {
  return ((shift % 26) + 26) % 26;
}

function shiftLetter(letter: string, shift: number) {
  const upper = letter.toUpperCase();
  const index = ALPHABET.indexOf(upper);
  if (index === -1) return letter;
  const next = ALPHABET[(index + normalizeShift(shift)) % 26];
  return letter === upper ? next : next.toLowerCase();
}

export function caesarEncrypt(text: string, shift: number) {
  return [...text].map((letter) => shiftLetter(letter, shift)).join("");
}

export function caesarDecrypt(text: string, shift: number) {
  return caesarEncrypt(text, -shift);
}

export function substitutionTransform(text: string, substitutionAlphabet: string, mode: "encrypt" | "decrypt") {
  const clean = substitutionAlphabet.toUpperCase().replace(/[^A-Z]/g, "");
  if (new Set(clean).size !== 26 || clean.length !== 26) {
    throw new Error("Substitution alphabet must contain 26 unique letters.");
  }

  return [...text]
    .map((letter) => {
      const upper = letter.toUpperCase();
      const source = mode === "encrypt" ? ALPHABET : clean;
      const target = mode === "encrypt" ? clean : ALPHABET;
      const index = source.indexOf(upper);
      if (index === -1) return letter;
      const next = target[index];
      return letter === upper ? next : next.toLowerCase();
    })
    .join("");
}

export function vigenereTransform(text: string, keyword: string, mode: "encrypt" | "decrypt") {
  const key = keyword.toUpperCase().replace(/[^A-Z]/g, "");
  if (!key) return text;
  let keyIndex = 0;

  return [...text]
    .map((letter) => {
      const upper = letter.toUpperCase();
      const alphaIndex = ALPHABET.indexOf(upper);
      if (alphaIndex === -1) return letter;
      const keyShift = ALPHABET.indexOf(key[keyIndex % key.length]);
      keyIndex += 1;
      return shiftLetter(letter, mode === "encrypt" ? keyShift : -keyShift);
    })
    .join("");
}

export function repeatedKeywordFor(text: string, keyword: string) {
  const key = keyword.toUpperCase().replace(/[^A-Z]/g, "");
  if (!key) return "";
  let keyIndex = 0;
  return [...text]
    .map((letter) => {
      if (!/[a-z]/i.test(letter)) return " ";
      const next = key[keyIndex % key.length];
      keyIndex += 1;
      return next;
    })
    .join("");
}

export function normalizeAnswer(answer: string) {
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAnswerAccepted(answer: string, acceptedAnswers: string[]) {
  const normalized = normalizeAnswer(answer);
  return acceptedAnswers.some((accepted) => {
    const expected = normalizeAnswer(accepted);
    const expectedTokens = expected.split(" ").filter(Boolean);
    const answerTokens = new Set(normalized.split(" ").filter(Boolean));
    const hasExpectedIdea = expectedTokens.length > 0 && expectedTokens.every((token) => answerTokens.has(token));
    return normalized === expected || normalized.includes(expected) || expected.includes(normalized) || hasExpectedIdea;
  });
}

export function randomSubstitutionAlphabet() {
  const letters = ALPHABET.split("");
  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [letters[index], letters[swap]] = [letters[swap], letters[index]];
  }
  return letters.join("");
}

export { ALPHABET };
