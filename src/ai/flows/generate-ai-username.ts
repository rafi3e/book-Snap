'use server';

/**
 * @fileOverview A flow to generate a random, book-related username.
 *
 * - generateAiUsername - A function that handles the AI username generation process.
 * - GenerateAiUsernameOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiUsernameOutputSchema = z.object({
  username: z.string().describe('A creative, book-related username.'),
});
export type GenerateAiUsernameOutput = z.infer<typeof GenerateAiUsernameOutputSchema>;

export async function generateAiUsername(): Promise<GenerateAiUsernameOutput> {
  return generateAiUsernameFlow();
}

const prompt = ai.definePrompt({
  name: 'generateAiUsernamePrompt',
  output: {schema: GenerateAiUsernameOutputSchema},
  prompt: `You are an AI assistant that creates fun, creative, and book-related usernames.
  
  Generate a single username that is clever and related to books, reading, or literature.
  
  Examples:
  - PageTurner
  - TheBookworm
  - InkyThoughts
  - ChapterMaster
  - NovelIdea
  
  Please provide one new username.`,
});

const generateAiUsernameFlow = ai.defineFlow(
  {
    name: 'generateAiUsernameFlow',
    outputSchema: GenerateAiUsernameOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
