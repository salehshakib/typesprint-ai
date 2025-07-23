"use server";

import {
  generateTypingStory,
  type GenerateTypingStoryInput,
} from "@/ai/flows/generate-typing-story";

export async function generateStoryAction(input: Omit<GenerateTypingStoryInput, 'seed'>) {
  // Add validation or further processing here if needed
  if (
    !input.includeAlphabet &&
    !input.includeNumbers &&
    !input.includePunctuation
  ) {
    if (input.wordCount === 0) {
      return { story: "" };
    }
  }

  const seededInput = {
    ...input,
    seed: Math.random().toString(36).substring(7),
  }

  return await generateTypingStory(seededInput);
}
