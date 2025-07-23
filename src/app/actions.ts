"use server";

import {
  generateTypingStory,
  type GenerateTypingStoryInput,
} from "@/ai/flows/generate-typing-story";

export async function generateStoryAction(input: GenerateTypingStoryInput) {
  // Add validation or further processing here if needed
  return await generateTypingStory(input);
}
