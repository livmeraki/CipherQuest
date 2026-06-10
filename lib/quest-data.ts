import { caesarEncrypt, vigenereTransform } from "./ciphers";
import type { Quest } from "./types";

type PlainClue = {
  text: string;
  shift?: number;
  hints: [string, string, string];
};

const buildCaesarClues = (roundId: string, shift: number, clues: PlainClue[]) =>
  clues.map((clue, index) => {
    const clueShift = clue.shift ?? shift;
    return {
      id: `${roundId}-c${index + 1}`,
      clueIndex: index + 1,
      encryptedText: caesarEncrypt(clue.text, clueShift),
      plaintextText: clue.text,
      cipherType: "caesar" as const,
      cipherKey: String(clueShift),
      hints: clue.hints
    };
  });

const buildVigenereClues = (roundId: string, keyword: string, clues: PlainClue[]) =>
  clues.map((clue, index) => ({
    id: `${roundId}-c${index + 1}`,
    clueIndex: index + 1,
    encryptedText: vigenereTransform(clue.text, keyword, "encrypt"),
    plaintextText: clue.text,
    cipherType: "vigenere" as const,
    cipherKey: keyword,
    hints: clue.hints
  }));

const lesson1Level1: PlainClue[] = [
  {
    text: "The review guide waits where quiet pages turn.",
    shift: 3,
    hints: [
      "This frozen LMS note uses a Caesar shift.",
      "The shift number is 3; move each letter backward.",
      "After decrypting, think about a school place with quiet pages."
    ]
  },
  {
    text: "Do not refresh; follow the first bell to the books.",
    shift: 5,
    hints: [
      "Punctuation stays the same, but letters move.",
      "This strip uses shift 5; move each letter backward.",
      "This clue points away from the screen and toward shelves."
    ]
  },
  {
    text: "The first clue hides where printers hum softly.",
    shift: 8,
    hints: [
      "Look for the same shift on every alphabet letter.",
      "Use shift 8 for this clue; try one short word first.",
      "Printers and books can share the same school space."
    ]
  },
  {
    text: "Bring your team to the place where whispers beat alarms.",
    shift: 11,
    hints: [
      "This is still Caesar, not a new cipher yet.",
      "Move letters backward by 11 to recover this plaintext.",
      "A place that rewards whispers is probably not the cafeteria."
    ]
  }
];

const lesson1Level2: PlainClue[] = [
  {
    text: "The next signal blinks where thirty keyboards wait.",
    shift: 7,
    hints: [
      "The printer trail uses Caesar again, but the key changed.",
      "Use shift 7 this time; the old shift will make nonsense.",
      "Thirty keyboards suggest a room built for screens."
    ]
  },
  {
    text: "A quiet room of screens knows the second code.",
    shift: 2,
    hints: [
      "A different Caesar shift means a different key.",
      "Move the ciphertext letters backward by 2.",
      "Eliminate places without screens or keyboards."
    ]
  },
  {
    text: "Follow the wires, not the hallway noise.",
    shift: 13,
    hints: [
      "The clue is evidence, not the final answer by itself.",
      "This clue uses shift 13; the key controls how ciphertext becomes plaintext.",
      "Wires and network maps usually live near computers."
    ]
  },
  {
    text: "The review files left footprints near the network map.",
    shift: 19,
    hints: [
      "Do not guess from one word; decrypt the whole strip.",
      "Shift each letter backward by the same number: 19.",
      "A network map is a strong location clue."
    ]
  }
];

const lesson1Level3: PlainClue[] = [
  {
    text: "Every message left a shadow.",
    shift: 4,
    hints: [
      "This final log entry still uses Caesar, but the name is hidden in a pattern.",
      "Use shift 4, then write the decrypted clue on your evidence sheet.",
      "Do not answer from this clue alone; compare its first letter with the next clues."
    ]
  },
  {
    text: "Voices travel farther than we think.",
    shift: 9,
    hints: [
      "This clue describes messages being heard beyond the intended team.",
      "Move letters backward by 9 to reveal this log line.",
      "Keep the first letter of this decrypted clue beside the first one."
    ]
  },
  {
    text: "Encrypted notes can still be watched.",
    shift: 14,
    hints: [
      "The log is about observation, not changing or breaking the trail.",
      "The Caesar key is 14 for this error log clue.",
      "The first letters of the first three decrypted clues spell the name."
    ]
  }
];

const lesson2Level4: PlainClue[] = [
  {
    text: "Mallory made a fake LMS login page.",
    hints: [
      "This clue uses Vigenere, not Caesar.",
      "Use the keyword FINAL.",
      "Mallory is changing the system, not just watching it."
    ]
  },
  {
    text: "Eve can watch messages that are not protected.",
    hints: [
      "Repeat the keyword above the message before shifting letters.",
      "Decrypt with keyword FINAL.",
      "This clue reminds you what Eve represents."
    ]
  },
  {
    text: "Use official links and check the page address.",
    hints: [
      "Each keyword letter creates a different Caesar-style shift.",
      "Try decrypting the first few letters with F I N A L.",
      "This clue is about safe behavior during finals week."
    ]
  },
  {
    text: "Modern encryption protects messages with stronger keys.",
    hints: [
      "Vigenere is stronger than one Caesar shift, but still not modern security.",
      "Symmetric encryption uses a shared secret key.",
      "Asymmetric encryption uses public and private keys, like the basic idea behind RSA."
    ]
  }
];

export const quests: Quest[] = [
  {
    id: "lesson-1-school-notes",
    lesson: "Lesson 1",
    title: "Follow the Secret Message",
    description: "Intro to Cryptography: How to Make a Message Secret",
    rounds: [
      {
        id: "l1-r1",
        orderIndex: 1,
        title: "The Frozen Review Guide",
        story:
          "It is the week before finals. Students open the LMS to download the final review guide, but the file is replaced by a short encrypted message. The teacher smiles and says it may be a cryptography trail. The first level sends the Cipher Recovery Team away from the screen and into the school.",
        cipherType: "caesar",
        cipherKey: "varies",
        finalQuestion: "Where does the first clue send the team?",
        acceptedAnswers: ["library", "the library", "media center", "library desk", "where books are", "where printers are"],
        explanation:
          "A Caesar cipher shifts every letter by the same number. When your team used the key, the frozen LMS message became readable and pointed to the library or media center.",
        clues: buildCaesarClues("l1-r1", 3, lesson1Level1)
      },
      {
        id: "l1-r2",
        orderIndex: 2,
        title: "The Printer Trail",
        story:
          "At the library, the printer wakes up and sends out thin strips of encrypted paper like finals-week fortune cookies. Each strip gives part of the next step. The old key no longer works, so the team must notice that the cipher key matters.",
        cipherType: "caesar",
        cipherKey: "varies",
        finalQuestion: "Where should the team go next? A. Cafeteria B. Computer Lab C. Gym D. Nurse Office",
        acceptedAnswers: ["b", "computer lab", "the computer lab", "room with computers", "room with keyboards", "network room"],
        explanation:
          "The next location was the computer lab. A different Caesar shift means a different key, and the key controls how ciphertext becomes plaintext.",
        clues: buildCaesarClues("l1-r2", 7, lesson1Level2)
      },
      {
        id: "l1-r3",
        orderIndex: 3,
        title: "The Error Log",
        story:
          "In the computer lab, the LMS error log opens on the main screen. It does not show that anyone broke the system. Instead, it shows that someone has been observing the encrypted trail. The final level asks the team to decrypt the evidence and type the name the trail reveals.",
        cipherType: "caesar",
        cipherKey: "varies",
        finalQuestion: "What name does the trail reveal?",
        acceptedAnswers: ["eve", "the name is eve", "the watcher is eve"],
        explanation:
          "The first three decrypted clues begin with E, V, and E. Today you learned how messages can be hidden using Caesar cipher, and the trail revealed Eve. Eve is not necessarily someone who changes or attacks messages. In cryptography, Eve represents an eavesdropper: someone who silently watches communication. Next lesson, you will learn why stopping Eve is difficult and why modern encryption is needed.",
        clues: buildCaesarClues("l1-r3", 4, lesson1Level3)
      }
    ]
  },
  {
    id: "lesson-2-wifi-trap",
    lesson: "Lesson 2",
    title: "The Final Bell Cipher: Mallory Enters the System",
    description: "Intro to Cryptography: Can You Stop Eve? From Caesar Cipher to Modern Encryption",
    rounds: [
      {
        id: "l2-r1",
        orderIndex: 1,
        title: "Eve Tries Every Shift",
        story:
          "Now that the Cipher Recovery Team knows Eve can watch messages, the class tests a scary idea: if a message uses Caesar cipher, Eve can simply try every shift until one makes sense.",
        cipherType: "caesar",
        cipherKey: "varies",
        finalQuestion: "Why is Caesar cipher weak against Eve?",
        acceptedAnswers: ["eve can try every shift", "only 25 shifts", "brute force", "try all shifts", "caesar has too few keys"],
        explanation:
          "Eve is like someone quietly looking over your shoulder. Caesar cipher has so few possible keys that Eve can try every shift and look for readable text.",
        clues: buildCaesarClues("l2-r1", 9, [
          {
            text: "Eve can test each shift before the final bell.",
            shift: 9,
            hints: ["This uses Caesar with shift 9.", "Try shifting backward by 9.", "Count how many Caesar shifts Eve would need to try."]
          },
          {
            text: "Twenty five wrong keys is not enough protection.",
            shift: 17,
            hints: ["The alphabet only has 26 positions.", "This clue uses shift 17; move backward to test it.", "This is the idea of brute force."]
          }
        ])
      },
      {
        id: "l2-r2",
        orderIndex: 2,
        title: "Mallory's Fake Announcement",
        story:
          "During finals week, the LMS announcement changes by itself. This is not just watching anymore. Mallory has entered the system and is trying to trick students with a fake update.",
        cipherType: "caesar",
        cipherKey: "varies",
        finalQuestion: "Who is changing or attacking the LMS?",
        acceptedAnswers: ["mallory", "the attacker is mallory", "mallory is attacking", "mallory changed it"],
        explanation:
          "Eve watches messages. Mallory changes, tricks, or attacks. Mallory is like someone trying to change the worksheet, steal the answer key, or trick you into opening a fake LMS page.",
        clues: buildCaesarClues("l2-r2", 5, [
          {
            text: "Mallory changed the finals announcement.",
            shift: 5,
            hints: ["This message is Caesar again.", "Shift backward by 5.", "The clue names someone who acts, not someone who only watches."]
          },
          {
            text: "The new link points away from the real LMS.",
            shift: 12,
            hints: ["Decrypt the whole clue before deciding what happened.", "Use key 12.", "A fake link is a trick, not eavesdropping."]
          }
        ])
      },
      {
        id: "l2-r3",
        orderIndex: 3,
        title: "The Keyword Before the Final Bell",
        story:
          "Mallory switches to a stronger classroom puzzle. A sticky note near the computer lab gives the keyword needed for the next cipher.",
        cipherType: "caesar",
        cipherKey: "6",
        finalQuestion: "What keyword unlocks the final messages?",
        acceptedAnswers: ["final", "key is final", "keyword final"],
        explanation:
          "The keyword FINAL controls a changing set of shifts in Vigenere cipher. That makes it harder than using one Caesar shift for the whole message.",
        clues: [
          {
            id: "l2-r3-c1",
            clueIndex: 1,
            encryptedText: caesarEncrypt("KEY IS FINAL", 6),
            plaintextText: "KEY IS FINAL",
            cipherType: "caesar",
            cipherKey: "6",
            hints: ["This keyword clue still uses Caesar.", "Shift backward by 6.", "The plaintext starts with KEY."]
          }
        ]
      },
      {
        id: "l2-r4",
        orderIndex: 4,
        title: "Stop Mallory, Protect Against Eve",
        story:
          "The final LMS clues are encrypted with Vigenere. Mallory is trying to lure students to a fake page, while Eve can still observe unprotected messages. The team must decrypt the evidence and choose safer online habits.",
        cipherType: "vigenere",
        cipherKey: "FINAL",
        finalQuestion: "What is Mallory doing, and how should students protect themselves?",
        acceptedAnswers: [
          "mallory made a fake lms login page use official links check the page address",
          "fake lms login page use official links",
          "mallory is tricking students with a fake page and students should use official links",
          "protect messages with stronger encryption and use official links"
        ],
        explanation:
          "Mallory is the malicious attacker who changes, tricks, or attacks. Eve is the eavesdropper who watches. Modern cryptography uses stronger designs than Caesar or Vigenere, including symmetric encryption with shared secret keys and asymmetric encryption with public and private keys such as the basic idea behind RSA.",
        clues: buildVigenereClues("l2-r4", "FINAL", lesson2Level4)
      }
    ]
  }
];

export function getQuest(questId: string) {
  return quests.find((quest) => quest.id === questId);
}

export function getRound(questId: string, roundId: string) {
  return getQuest(questId)?.rounds.find((round) => round.id === roundId);
}
