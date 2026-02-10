import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Recipe } from "./RecipeTypes";

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRecipe: Partial<Recipe>;
  onChange: (recipe: Partial<Recipe>) => void;
  onSave: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  onImageOverlay: (url: string) => void;
}

export default function RecipeForm({
  open, onOpenChange, newRecipe, onChange, onSave, onImageUpload, isUploading, onImageOverlay
}: RecipeFormProps) {
  const { toast } = useToast();

  const addItem = (field: 'ingredients' | 'instructions' | 'tips') => {
    onChange({ ...newRecipe, [field]: [...(newRecipe[field] || []), ""] });
  };

  const updateItem = (field: 'ingredients' | 'instructions' | 'tips', index: number, value: string) => {
    onChange({
      ...newRecipe,
      [field]: newRecipe[field]?.map((item: string, i: number) => i === index ? value : item) || []
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!newRecipe.images) return;
    const images = [...newRecipe.images];
    const [moved] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, moved);
    onChange({ ...newRecipe, images });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Recipe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input id="title" value={newRecipe.title || ""} onChange={(e) => onChange({ ...newRecipe, title: e.target.value })} placeholder="Enter recipe title" />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" value={newRecipe.servings || 4} onChange={(e) => onChange({ ...newRecipe, servings: parseInt(e.target.value) || 4 })} />
            </div>
          </div>

          <div>
            <Label htmlFor="owner">Original Recipe Owner</Label>
            <Input id="owner" value={newRecipe.owner || ""} onChange={(e) => onChange({ ...newRecipe, owner: e.target.value })} placeholder="Who created this recipe originally?" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={newRecipe.description || ""} onChange={(e) => onChange({ ...newRecipe, description: e.target.value })} placeholder="Brief description of the recipe" />
          </div>

          <div>
            <Label>Ingredients</Label>
            {newRecipe.ingredients?.map((ingredient, index) => (
              <Input key={index} value={ingredient} onChange={(e) => updateItem('ingredients', index, e.target.value)} placeholder={`Ingredient ${index + 1}`} className="mt-2" />
            ))}
            <Button type="button" onClick={() => addItem('ingredients')} className="mt-2" variant="outline">Add Ingredient</Button>
          </div>

          <div>
            <Label>Instructions</Label>
            {newRecipe.instructions?.map((instruction, index) => (
              <Textarea key={index} value={instruction} onChange={(e) => updateItem('instructions', index, e.target.value)} placeholder={`Step ${index + 1}`} className="mt-2" />
            ))}
            <Button type="button" onClick={() => addItem('instructions')} className="mt-2" variant="outline">Add Step</Button>
          </div>

          <div>
            <Label>Images</Label>
            <div className="mt-2 border border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <Label htmlFor="image-upload" className="cursor-pointer block mt-2 text-sm font-medium">Upload multiple recipe images</Label>
              <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB each</span>
              <Input id="image-upload" type="file" className="hidden" accept="image/*" multiple onChange={onImageUpload} disabled={isUploading} />
            </div>
            {isUploading && <div className="mt-2 text-sm text-primary">Uploading images...</div>}
            {newRecipe.images && newRecipe.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {newRecipe.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image} alt={`Recipe ${index + 1}`} className="w-full h-24 object-cover rounded-lg border cursor-pointer" onClick={() => onImageOverlay(image)} />
                    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0 bg-card/80 hover:bg-card" onClick={() => onChange({ ...newRecipe, images: newRecipe.images?.filter((_, i) => i !== index) })}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className={`absolute bottom-1 right-1 h-6 w-6 p-0 bg-card/80 hover:bg-card ${newRecipe.selectedImageIndex === index ? 'bg-primary/80 text-primary-foreground' : ''}`}
                      onClick={() => { onChange({ ...newRecipe, imageUrl: image, selectedImageIndex: index }); toast({ title: "Main Image Set" }); }} title="Set as main image">
                      <Pin className="h-3 w-3" />
                    </Button>
                    <div className="absolute left-1 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && <Button size="sm" variant="ghost" className="h-5 w-5 p-0 bg-card/80" onClick={() => moveImage(index, index - 1)}><ChevronLeft className="h-3 w-3" /></Button>}
                      {index < (newRecipe.images?.length || 0) - 1 && <Button size="sm" variant="ghost" className="h-5 w-5 p-0 bg-card/80" onClick={() => moveImage(index, index + 1)}><ChevronRight className="h-3 w-3" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Prep Time (min)</Label>
              <Input type="number" value={newRecipe.prepTime || 0} onChange={(e) => onChange({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Cook Time (min)</Label>
              <Input type="number" value={newRecipe.cookTime || 0} onChange={(e) => onChange({ ...newRecipe, cookTime: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Difficulty (1-5)</Label>
              <Select value={newRecipe.difficulty?.toString() || "1"} onValueChange={(value) => onChange({ ...newRecipe, difficulty: parseInt(value) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Easy</SelectItem>
                  <SelectItem value="2">2 - Easy</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Hard</SelectItem>
                  <SelectItem value="5">5 - Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tips & Notes</Label>
            {newRecipe.tips?.map((tip, index) => (
              <Textarea key={index} value={tip} onChange={(e) => updateItem('tips', index, e.target.value)} placeholder={`Tip ${index + 1}`} className="mt-2" />
            ))}
            <Button type="button" onClick={() => addItem('tips')} className="mt-2" variant="outline">Add Tip</Button>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={onSave} className="flex-1">Create Recipe</Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
