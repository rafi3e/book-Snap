'use server';

/**
 * @fileOverview A flow to generate AI-powered book recommendations.
 *
 * - generateAiRecommendations - A function that handles the AI recommendation process.
 * - GenerateAiRecommendationsInput - The input type for the function.
 * - GenerateAiRecommendationsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendedBookSchema = z.object({
  title: z.string().describe('The title of the recommended book.'),
  author: z.string().describe('The author of the recommended book.'),
  reason: z.string().describe('A short, compelling reason (1-2 sentences) why this book is a good recommendation based on the original book.'),
});

const GenerateAiRecommendationsInputSchema = z.object({
  bookTitle: z.string().describe('The title of the book to base recommendations on.'),
  bookAuthor: z.string().describe('The author of the book.'),
  bookGenres: z.array(z.string()).describe('A list of genres for the book.'),
});
export type GenerateAiRecommendationsInput = z.infer<typeof GenerateAiRecommendationsInputSchema>;

const GenerateAiRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendedBookSchema).describe('A list of 3-5 recommended books.'),
});
export type GenerateAiRecommendationsOutput = z.infer<typeof GenerateAiRecommendationsOutputSchema>;


export async function generateAiRecommendations(input: GenerateAiRecommendationsInput): Promise<GenerateAiRecommendationsOutput> {
  return generateAiRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiRecommendationsPrompt',
  input: {schema: GenerateAiRecommendationsInputSchema},
  output: {schema: GenerateAiRecommendationsOutputSchema},
  prompt: `You are a literary expert who provides thoughtful book recommendations.

  Given the following book, recommend 3 to 5 other books that the reader might enjoy. For each recommendation, provide a brief (1-2 sentence) reason why it's a good fit. Focus on thematic similarities, author styles, or genre connections.

  Original Book:
  - Title: {{{bookTitle}}}
  - Author: {{{bookAuthor}}}
  - Genres: {{#each bookGenres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Please provide your recommendations in the specified format.
`,
});

const generateAiRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateAiRecommendationsFlow',
    inputSchema: GenerateAiRecommendationsInputSchema,
    outputSchema: GenerateAiRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
