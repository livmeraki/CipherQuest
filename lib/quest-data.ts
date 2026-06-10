import { caesarEncrypt, vigenereTransform } from "./ciphers";
import type { Quest } from "./types";

const l1Clues = [
  "The target is not money or food.",
  "The bad guys want student passwords.",
  "The meeting place is the computer lab.",
  "The plan will happen after lunch."
];

const l2Clues = [
  "The old Caesar cipher was too easy to break.",
  "The bad guys made a fake school Wi-Fi network.",
  "The fake login page asks for student passwords.",
  "Students should use only the official school network."
];

export const quests: Quest[] = [
  {
    id: "lesson-1-school-notes",
    lesson: "Lesson 1",
    title: "The Suspicious School Notes",
    description: "Use Caesar cipher clues to discover what the bad guys are planning.",
    rounds: [
      {
        id: "l1-r1",
        orderIndex: 1,
        title: "Encrypted Notes Near the Computer Lab",
        story:
          "During lunch break, strange notes appear near the computer lab, library hallway, and teacher office. Your Cyber Safety Investigation Team needs to make the messages readable before the plan begins.",
        cipherType: "caesar",
        cipherKey: "3",
        finalQuestion: "What do the bad guys want, where will they meet, and when?",
        acceptedAnswers: [
          "student passwords computer lab after lunch",
          "bad guys want student passwords and will meet at the computer lab after lunch",
          "passwords computer lab after lunch"
        ],
        explanation:
          "A Caesar cipher shifts every letter by the same key. Once you know the shift, every clue can be decrypted. Simple ciphers are useful for learning but weak against patient attackers.",
        clues: l1Clues.map((plain, index) => ({
          id: `l1-r1-c${index + 1}`,
          clueIndex: index + 1,
          encryptedText: caesarEncrypt(plain, 3),
          plaintextText: plain,
          cipherType: "caesar",
          cipherKey: "3",
          hints: [
            "This clue uses a Caesar cipher.",
            "Try shifting each letter backward by 3.",
            `The plaintext starts with: ${plain.split(" ").slice(0, 3).join(" ")}`
          ]
        }))
      }
    ]
  },
  {
    id: "lesson-2-wifi-trap",
    lesson: "Lesson 2",
    title: "Eve Gets Smarter: The Locked Wi-Fi Trap",
    description: "Discover a Vigenere keyword, then stop a fake Wi-Fi login trap.",
    rounds: [
      {
        id: "l2-r1",
        orderIndex: 1,
        title: "The Keyword Note",
        story:
          "After the first case, the bad guys stop using obvious Caesar messages. One careless note still points to the keyword for their new cipher.",
        cipherType: "caesar",
        cipherKey: "6",
        finalQuestion: "What keyword unlocks the next set of messages?",
        acceptedAnswers: ["lock", "key is lock"],
        explanation:
          "The clue revealed the keyword LOCK. A keyword can control changing shifts, which makes the next cipher harder than a single Caesar shift.",
        clues: [
          {
            id: "l2-r1-c1",
            clueIndex: 1,
            encryptedText: caesarEncrypt("KEY IS LOCK", 6),
            plaintextText: "KEY IS LOCK",
            cipherType: "caesar",
            cipherKey: "6",
            hints: ["This clue still uses Caesar.", "Shift backward by 6.", "The plaintext starts with: KEY"]
          }
        ]
      },
      {
        id: "l2-r2",
        orderIndex: 2,
        title: "The Locked Wi-Fi Trap",
        story:
          "Eve is watching network traffic while the bad guys send instructions about a fake school Wi-Fi network. Decrypt the messages and protect student information.",
        cipherType: "vigenere",
        cipherKey: "LOCK",
        finalQuestion: "What is the attack, and how should students protect themselves?",
        acceptedAnswers: [
          "fake school wifi fake login page steal student passwords use official school network avoid suspicious login pages",
          "bad guys made a fake school wifi network and fake login page to steal student passwords students should use only the official school network",
          "use only the official school network and avoid suspicious login pages"
        ],
        explanation:
          "Vigenere uses a keyword to create different shifts across the message. This is stronger than Caesar, but modern cryptography goes much further with carefully tested symmetric and asymmetric systems such as AES and RSA.",
        clues: l2Clues.map((plain, index) => ({
          id: `l2-r2-c${index + 1}`,
          clueIndex: index + 1,
          encryptedText: vigenereTransform(plain, "LOCK", "encrypt"),
          plaintextText: plain,
          cipherType: "vigenere",
          cipherKey: "LOCK",
          hints: [
            "This clue uses a Vigenere cipher.",
            "Use the keyword LOCK.",
            `The plaintext starts with: ${plain.split(" ").slice(0, 3).join(" ")}`
          ]
        }))
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

