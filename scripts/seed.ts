import { createClient } from "@supabase/supabase-js";
import { quests } from "../lib/quest-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.");
}

const supabase = createClient(url, key);

async function main() {
  for (const quest of quests) {
    await supabase.from("quests").upsert({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      lesson: quest.lesson
    });

    for (const round of quest.rounds) {
      await supabase.from("rounds").upsert({
        id: round.id,
        quest_id: quest.id,
        order_index: round.orderIndex,
        title: round.title,
        story: round.story,
        cipher_type: round.cipherType,
        cipher_key: round.cipherKey,
        final_question: round.finalQuestion,
        accepted_answers: round.acceptedAnswers,
        explanation: round.explanation
      });

      for (const clue of round.clues) {
        await supabase.from("clues").upsert({
          id: clue.id,
          round_id: round.id,
          clue_index: clue.clueIndex,
          encrypted_text: clue.encryptedText,
          plaintext_text: clue.plaintextText,
          cipher_type: clue.cipherType,
          cipher_key: clue.cipherKey,
          hint_1: clue.hints[0],
          hint_2: clue.hints[1],
          hint_3: clue.hints[2]
        });
      }
    }
  }
}

main().then(() => console.log("Seeded CipherQuest quests.")).catch((error) => {
  console.error(error);
  process.exit(1);
});

