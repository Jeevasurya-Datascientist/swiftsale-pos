'use server';

/**
 * @fileOverview AI-powered related item suggestions for POS.
 *
 * - suggestRelatedItems - A function that suggests related items based on the current cart items.
 * - SuggestRelatedItemsInput - The input type for the suggestRelatedItems function.
 * - SuggestRelatedItemsOutput - The output type for the suggestRelatedItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedItemsInputSchema = z.object({
  cartItems: z
    .array(z.string())
    .describe('The list of items currently in the shopping cart.'),
});
export type SuggestRelatedItemsInput = z.infer<typeof SuggestRelatedItemsInputSchema>;

const SuggestRelatedItemsOutputSchema = z.object({
  suggestedItems: z
    .array(z.string())
    .describe('A list of items suggested to be added to the cart.'),
});
export type SuggestRelatedItemsOutput = z.infer<typeof SuggestRelatedItemsOutputSchema>;

export async function suggestRelatedItems(input: SuggestRelatedItemsInput): Promise<SuggestRelatedItemsOutput> {
  return suggestRelatedItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedItemsPrompt',
  input: {schema: SuggestRelatedItemsInputSchema},
  output: {schema: SuggestRelatedItemsOutputSchema},
  prompt: `You are a retail sales expert. Given the current items in a customer's shopping cart, suggest other items that they might be interested in purchasing.

Current Cart Items:
{{#each cartItems}}- {{{this}}}
{{/each}}

Suggested Items:`, //Note: No 'else' case for the Handlebars 'if' helper because the cartItems is always expected.
});

const suggestRelatedItemsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedItemsFlow',
    inputSchema: SuggestRelatedItemsInputSchema,
    outputSchema: SuggestRelatedItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
