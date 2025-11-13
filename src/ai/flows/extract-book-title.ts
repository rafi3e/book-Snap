'use server';
/**
 * @fileOverview A flow to extract a book title from an image using OCR.
 *
 * - extractBookTitle - A function that handles the OCR process.
 * - ExtractBookTitleInput - The input type for the function.
 * - ExtractBookTitleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractBookTitleInputSchema = z.object({
  imageDataUri: z.string().describe(
    "A photo of a book cover, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractBookTitleInput = z.infer<typeof ExtractBookTitleInputSchema>;

const ExtractBookTitleOutputSchema = z.object({
  title: z.string().describe("The extracted book title from the image. If no title is found, this should be an empty string."),
});
export type ExtractBookTitleOutput = z.infer<typeof ExtractBookTitleOutputSchema>;


export async function extractBookTitle(input: ExtractBookTitleInput): Promise<ExtractBookTitleOutput> {
  return extractBookTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractBookTitlePrompt',
  input: {schema: ExtractBookTitleInputSchema},
  output: {schema: ExtractBookTitleOutputSchema},
  prompt: `You are an expert OCR tool specializing in identifying book titles from cover images. Analyze the provided image and extract the main title of the book. Ignore author names, subtitles, or other text. If a clear title cannot be identified, return an empty string.

  Image: {{media url=imageDataUri}}
  `,
});

const extractBookTitleFlow = ai.defineFlow(
  {
    name: 'extractBookTitleFlow',
    inputSchema: ExtractBookTitleInputSchema,
    outputSchema: ExtractBookTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
