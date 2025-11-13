// 'use server'; // Commented out to allow static export for Capacitor

// import { generateAiSummary } from '@/ai/flows/generate-ai-summary';
// import { generateAiRecommendations } from '@/ai/flows/generate-ai-recommendations';
// import { generateAiUsername } from '@/ai/flows/generate-ai-username';
// import { extractBookTitle } from '@/ai/flows/extract-book-title';
// import { z } from 'zod';
// import { recommendationsInputSchema } from '@/lib/books';

// const summaryInputSchema = z.object({
//   bookTitle: z.string().min(1, 'Book title is required.'),
//   bookDescription: z.string().min(1, 'Book description is required.'),
// });

// export async function getAiSummaryAction(input: {
//   bookTitle: string;
//   bookDescription: string;
// }) {
//   const parsedInput = summaryInputSchema.safeParse(input);
//   if (!parsedInput.success) {
//     console.error('Invalid input for AI summary:', parsedInput.error);
//     throw new Error('Invalid input provided for AI summary generation.');
//   }

//   try {
//     const result = await generateAiSummary(parsedInput.data);
//     return result;
//   } catch (error) {
//     console.error('AI summary generation failed:', error);
//     // Return a structured error to the client
//     return { error: 'Could not generate summary. Please try again later.' };
//   }
// }

// export async function getAiRecommendationsAction(input: {
//     bookTitle: string;
//     bookAuthor: string;
//     bookGenres: string[];
// }) {
//     const parsedInput = recommendationsInputSchema.safeParse(input);
//     if (!parsedInput.success) {
//         console.error('Invalid input for AI recommendations:', parsedInput.error);
//         throw new Error('Invalid input provided for AI recommendation generation.');
//     }

//     try {
//         const result = await generateAiRecommendations(parsedInput.data);
//         return result;
//     } catch (error) {
//         console.error('AI recommendation generation failed:', error);
//         return { error: 'Could not generate recommendations. Please try again later.' };
//     }
// }

// export async function generateAiUsernameAction() {
//     try {
//         const result = await generateAiUsername();
//         return result;
//     } catch (error) {
//         console.error('AI username generation failed:', error);
//         return { error: 'Could not generate username. Please try again later.' };
//     }
// }

// const extractTitleInputSchema = z.object({
//   imageDataUri: z.string(),
// });

// export async function extractBookTitleAction(input: { imageDataUri: string }) {
//   const parsedInput = extractTitleInputSchema.safeParse(input);
//   if (!parsedInput.success) {
//     console.error('Invalid input for title extraction:', parsedInput.error);
//     return { error: 'Invalid image data provided.' };
//   }
//   try {
//     const result = await extractBookTitle(parsedInput.data);
//     return result;
//   } catch (error) {
//     console.error('AI title extraction failed:', error);
//     return { error: 'Could not extract title from image. Please try again.' };
//   }
// }
