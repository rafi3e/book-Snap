'use server';

/**
 * @fileOverview A flow to generate an AI-powered summary or quote of the day for a given book.
 *
 * - generateAiSummary - A function that handles the AI summary generation process.
 * - GenerateAiSummaryInput - The input type for the generateAiSummary function.
 * - GenerateAiSummaryOutput - The return type for the generateAiSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiSummaryInputSchema = z.object({
  bookTitle: z.string().describe('The title of the book.'),
  bookDescription: z.string().describe('A detailed description of the book.'),
});
export type GenerateAiSummaryInput = z.infer<typeof GenerateAiSummaryInputSchema>;

const GenerateAiSummaryOutputSchema = z.object({
  aiSummary: z.string().describe('The AI-generated summary or quote of the day for the book.'),
});
export type GenerateAiSummaryOutput = z.infer<typeof GenerateAiSummaryOutputSchema>;

export async function generateAiSummary(input: GenerateAiSummaryInput): Promise<GenerateAiSummaryOutput> {
  return generateAiSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiSummaryPrompt',
  input: {schema: GenerateAiSummaryInputSchema},
  output: {schema: GenerateAiSummaryOutputSchema},
  prompt: `You are an AI assistant designed to provide a concise summary or quote of the day for a book.

  Given the title and description of a book, generate either a short summary (2-3 sentences) that captures the essence of the book, or provide a quote from the book that encapsulates its main theme or message.

  Book Title: {{{bookTitle}}}
  Book Description: {{{bookDescription}}}

  AI Summary or Quote:
`,
});

const generateAiSummaryFlow = ai.defineFlow(
  {
    name: 'generateAiSummaryFlow',
    inputSchema: GenerateAiSummaryInputSchema,
    outputSchema: GenerateAiSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
