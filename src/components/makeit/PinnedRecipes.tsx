import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PinOff } from "lucide-react";
import type { PinnedRecipe } from "./RecipeTypes";

interface PinnedRecipesProps {
  pinnedRecipes: PinnedRecipe[];
  onUnpin: (id: string) => void;
  onImageOverlay: (url: string) => void;
}

export default function PinnedRecipes({ pinnedRecipes, onUnpin, onImageOverlay }: PinnedRecipesProps) {
  if (pinnedRecipes.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Pinned Recipes</h3>
      <div className="flex gap-3 flex-wrap">
        {pinnedRecipes.map((recipe) => (
          <Card key={recipe.id} className="w-64 cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {recipe.imageUrl && (
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-16 h-16 object-cover rounded-lg" onClick={() => onImageOverlay(recipe.imageUrl!)} />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{recipe.title}</h4>
                  <Button size="sm" variant="ghost" className="mt-2 h-6 px-2 text-xs" onClick={() => { if (confirm("Remove pin?")) onUnpin(recipe.id); }}>
                    <PinOff className="h-3 w-3 mr-1" />Unpin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
