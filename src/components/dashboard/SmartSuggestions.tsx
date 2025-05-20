"use client";

import { useEffect, useState } from 'react';
import { suggestRelatedItems, type SuggestRelatedItemsInput, type SuggestRelatedItemsOutput } from '@/ai/flows/suggest-related-items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb } from 'lucide-react';

interface SmartSuggestionsProps {
  cartItemNames: string[]; // Expecting an array of product names
}

export function SmartSuggestions({ cartItemNames }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cartItemNames.length === 0) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const input: SuggestRelatedItemsInput = { cartItems: cartItemNames };
        const result: SuggestRelatedItemsOutput = await suggestRelatedItems(input);
        setSuggestions(result.suggestedItems || []);
      } catch (e) {
        console.error("Error fetching smart suggestions:", e);
        setError("Could not fetch suggestions at this time.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce or throttle this if cartItemNames updates very frequently
    const timer = setTimeout(() => {
        fetchSuggestions();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);

  }, [cartItemNames]); // Re-run when cartItemNames changes

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading suggestions...</p>
          </div>
        )}
        {!isLoading && error && (
          <p className="text-destructive text-center py-4">{error}</p>
        )}
        {!isLoading && !error && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                {item}
              </Badge>
            ))}
          </div>
        )}
        {!isLoading && !error && suggestions.length === 0 && cartItemNames.length > 0 && (
          <p className="text-muted-foreground text-center py-4">No specific suggestions right now. Keep adding items!</p>
        )}
         {!isLoading && !error && suggestions.length === 0 && cartItemNames.length === 0 && (
          <p className="text-muted-foreground text-center py-4">Add items to your cart to see suggestions.</p>
        )}
      </CardContent>
    </Card>
  );
}
