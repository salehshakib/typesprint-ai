'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating typing stories with customizable options.
 *
 * The flow allows users to generate stories with or without punctuation and numbers, catering to specific typing practice needs.
 * It exports:
 * - `generateTypingStory`: The main function to generate a typing story.
 * - `GenerateTypingStoryInput`: The input type for the `generateTypingStory` function.
 * - `GenerateTypingStoryOutput`: The output type for the `generateTypingStory` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTypingStoryInputSchema = z.object({
  includePunctuation: z
    .boolean()
    .describe('Whether or not to include punctuation in the generated story.'),
  includeNumbers: z
    .boolean()
    .describe('Whether or not to include numbers in the generated story.'),
  includeAlphabet: z
    .boolean()
    .describe('Whether or not to include the alphabet in the generated story.'),
  wordCount: z
    .number()
    .describe('The approximate number of words the generated story should contain.'),
  seed: z
    .string()
    .describe('A random seed to ensure story uniqueness.'),
});
export type GenerateTypingStoryInput = z.infer<typeof GenerateTypingStoryInputSchema>;

const GenerateTypingStoryOutputSchema = z.object({
  story: z.string().describe('The generated typing story.'),
});
export type GenerateTypingStoryOutput = z.infer<typeof GenerateTypingStoryOutputSchema>;

export async function generateTypingStory(
  input: GenerateTypingStoryInput
): Promise<GenerateTypingStoryOutput> {
  return generateTypingStoryFlow(input);
}

const typingStoryPrompt = ai.definePrompt({
  name: 'typingStoryPrompt',
  input: {schema: GenerateTypingStoryInputSchema},
  output: {schema: GenerateTypingStoryOutputSchema},
  prompt: `You are an AI that generates typing stories based on user preferences.

  Generate a story with approximately {{wordCount}} words.

  {{~#if includePunctuation}}
  Include punctuation in the story.
  {{~else}}
  Do not include punctuation in the story.
  {{~/if}}

  {{~#if includeNumbers}}
  Include numbers in the story.
  {{~else}}
  Do not include numbers in the story.
  {{~/if}}

  {{~#if includeAlphabet}}
  Include the full alphabet "abcdefghijklmnopqrstuvwxyz" somewhere in the story.
  {{~/if}}

  To ensure variety, use this random seed to make each story unique: {{seed}}

  Story:`,
});

const generateTypingStoryFlow = ai.defineFlow(
  {
    name: 'generateTypingStoryFlow',
    inputSchema: GenerateTypingStoryInputSchema,
    outputSchema: GenerateTypingStoryOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await typingStoryPrompt(input);
    return output!;
  }
);
