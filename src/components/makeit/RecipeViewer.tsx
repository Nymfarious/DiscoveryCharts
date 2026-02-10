import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Star, Volume2, VolumeX, Utensils, Clock, Users, Heart, ImageIcon, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Recipe } from "./RecipeTypes";

interface RecipeViewerProps {
  recipe: Recipe;
  isPlaying: boolean;
  isMuted: boolean;
  currentStep: number;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onStepChange: (step: number) => void;
  onResetSteps: () => void;
  onUpdateRating: (type: 'ease' | 'quality', rating: number) => void;
  onImageOverlay: (url: string) => void;
}

export default function RecipeViewer({
  recipe, isPlaying, isMuted, currentStep,
  onTogglePlayPause, onToggleMute, onStepChange, onResetSteps, onUpdateRating, onImageOverlay
}: RecipeViewerProps) {
  const mainImage = recipe.imageUrl || recipe.images?.[recipe.selectedImageIndex || 0] || recipe.images?.[0];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {mainImage && (
              <div className="flex-shrink-0">
                <img src={mainImage} alt={recipe.title} className="w-24 h-24 object-cover rounded-lg border shadow-md cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onImageOverlay(mainImage)} />
                {recipe.images && recipe.images.length > 1 && (
                  <Badge variant="secondary" className="mt-1 text-xs">+{recipe.images.length - 1} more</Badge>
                )}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                {!mainImage && <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                {recipe.title}
              </CardTitle>
              <p className="text-muted-foreground mb-4">{recipe.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1"><Users className="h-3 w-3" />Serves {recipe.servings}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.prepTime + recipe.cookTime} min total</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Utensils className="h-3 w-3" />Difficulty: {recipe.difficulty}/5</Badge>
                {recipe.source && <Badge variant="outline">Source: {recipe.source}</Badge>}
              </div>
              <div className="flex gap-6 mb-4">
                {(['ease', 'quality'] as const).map((type) => (
                  <div key={type}>
                    <Label className="text-sm font-medium">{type === 'ease' ? 'Ease of Cooking' : 'Quality/Taste'}:</Label>
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-4 w-4 cursor-pointer ${star <= (type === 'ease' ? recipe.easeRating || 0 : recipe.qualityRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} onClick={() => onUpdateRating(type, star)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onTogglePlayPause} variant="outline" size="sm" disabled={!recipe.instructions[currentStep]}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Read Aloud'}
            </Button>
            <Button onClick={onToggleMute} variant="outline" size="sm">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="tips">Tips & Notes</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-6">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Cooking Instructions</h3>
                <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {recipe.instructions.length}</div>
              </div>
              <div className="mb-6">
                <div className="bg-background border-2 border-primary/20 rounded-lg p-6 min-h-[120px] flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Step {currentStep + 1}</Badge>
                    {isPlaying && <Badge variant="default" className="animate-pulse">🔊 Reading...</Badge>}
                  </div>
                  <p className="text-lg leading-relaxed">
                    {recipe.instructions[currentStep]}
                    {recipe.images && recipe.images.length > currentStep + 1 && (
                      <Button size="sm" variant="ghost" className="ml-2 h-6 w-6 p-0 text-primary" onClick={() => recipe.images && onImageOverlay(recipe.images[currentStep])} title="View step image">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-start">
                <Button onClick={() => onStepChange(currentStep - 1)} disabled={currentStep === 0} variant="outline" size="sm">← Previous</Button>
                <Button onClick={onResetSteps} variant="outline" size="sm">Reset</Button>
                <Button onClick={() => onStepChange(currentStep + 1)} disabled={currentStep === recipe.instructions.length - 1} variant="outline" size="sm">Next →</Button>
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="font-medium mb-3 text-muted-foreground">All Steps Overview:</h4>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${index === currentStep ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50'}`} onClick={() => onStepChange(index)}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>{index + 1}</div>
                      <span className={index === currentStep ? 'font-medium' : ''}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="mt-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Tips & Notes</h3>
              {recipe.tips.length > 0 ? (
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3"><Heart className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /><span>{tip}</span></li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground">No tips available.</p>}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Nutrition Information</h3>
              {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {recipe.nutrition.calories && <div className="text-center p-4 bg-background rounded-lg border"><div className="text-2xl font-bold text-primary">{recipe.nutrition.calories}</div><div className="text-sm text-muted-foreground">Calories</div></div>}
                  {recipe.nutrition.protein && <div className="text-center p-4 bg-background rounded-lg border"><div className="text-2xl font-bold text-green-600">{recipe.nutrition.protein}</div><div className="text-sm text-muted-foreground">Protein</div></div>}
                  {recipe.nutrition.carbs && <div className="text-center p-4 bg-background rounded-lg border"><div className="text-2xl font-bold text-yellow-600">{recipe.nutrition.carbs}</div><div className="text-sm text-muted-foreground">Carbs</div></div>}
                  {recipe.nutrition.fat && <div className="text-center p-4 bg-background rounded-lg border"><div className="text-2xl font-bold text-orange-600">{recipe.nutrition.fat}</div><div className="text-sm text-muted-foreground">Fat</div></div>}
                </div>
              ) : <p className="text-muted-foreground">No nutrition information available.</p>}
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Recipe Images</h3>
              {recipe.images && recipe.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recipe.images.map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => onImageOverlay(image)}>
                      <img src={image} alt={`Recipe step ${index + 1}`} className="w-full h-48 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                      <Badge variant="secondary" className="absolute bottom-2 left-2 bg-card/90">Step {index + 1}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>No images available for this recipe</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
