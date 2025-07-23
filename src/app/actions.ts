"use server";

import {
  generateTypingStory,
  type GenerateTypingStoryInput,
} from "@/ai/flows/generate-typing-story";

export async function generateStoryAction(input: GenerateTypingStoryInput) {
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
  return await generateTypingStory(input);
}
