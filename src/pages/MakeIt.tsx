import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, Pin, PinOff, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Recipe, PinnedRecipe } from "@/components/makeit/RecipeTypes";
import { SAMPLE_RECIPE } from "@/components/makeit/RecipeTypes";
import RecipeForm from "@/components/makeit/RecipeForm";
import RecipeViewer from "@/components/makeit/RecipeViewer";
import PinnedRecipesBar from "@/components/makeit/PinnedRecipes";

const MakeIt = () => {
  const { toast } = useToast();
  const [themeColor, setThemeColor] = useState("#d4eaf7");
  const [recipeURL, setRecipeURL] = useState("https://testsite.com/recipe/");
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlOptionsDialog, setShowUrlOptionsDialog] = useState(false);
  const [showUrlInputDialog, setShowUrlInputDialog] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [pinnedRecipes, setPinnedRecipes] = useState<PinnedRecipe[]>([]);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState("");
  const [showAddMethodDialog, setShowAddMethodDialog] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: "", description: "", instructions: [""], servings: 4, prepTime: 0, cookTime: 0,
    difficulty: 1, ingredients: [""], tips: [""], nutrition: {}, images: [], owner: "", selectedImageIndex: 0
  });

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
    setCurrentRecipe(SAMPLE_RECIPE);
    const saved = localStorage.getItem("pinnedRecipes");
    if (saved) setPinnedRecipes(JSON.parse(saved));
  }, []);

  const stopSpeaking = () => { speechSynthesis.cancel(); speechRef.current = null; setIsPlaying(false); };

  const speakText = async (text: string) => {
    setIsPlaying(true);
    if (!('speechSynthesis' in window)) throw new Error('Not supported');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; utterance.volume = isMuted ? 0 : 1;
    speechRef.current = utterance;
    utterance.onend = () => { setIsPlaying(false); speechRef.current = null; };
    utterance.onerror = () => { setIsPlaying(false); speechRef.current = null; };
    speechSynthesis.speak(utterance);
  };

  const togglePlayPause = async () => {
    if (isPlaying) { stopSpeaking(); } else if (currentRecipe?.instructions[currentStep]) {
      try { await speakText(currentRecipe.instructions[currentStep]); } catch { toast({ title: "Audio Error", variant: "destructive" }); }
    }
  };

  const pinRecipe = (recipe: Recipe) => {
    const pin: PinnedRecipe = { id: recipe.id, title: recipe.title, imageUrl: recipe.imageUrl || recipe.images?.[recipe.selectedImageIndex || 0], isPinned: true };
    const updated = [...pinnedRecipes.filter(p => p.id !== recipe.id), pin];
    setPinnedRecipes(updated);
    localStorage.setItem("pinnedRecipes", JSON.stringify(updated));
  };

  const unpinRecipe = (id: string) => {
    const updated = pinnedRecipes.filter(p => p.id !== id);
    setPinnedRecipes(updated);
    localStorage.setItem("pinnedRecipes", JSON.stringify(updated));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (!valid.length) return;
    setIsUploading(true);
    const urls: string[] = [];
    try {
      for (const file of valid) {
        const name = `recipe-${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('recipe-images').upload(name, file);
        if (error) throw error;
        urls.push(supabase.storage.from('recipe-images').getPublicUrl(name).data.publicUrl);
      }
      setNewRecipe(prev => ({ ...prev, images: [...(prev.images || []), ...urls], imageUrl: prev.imageUrl || urls[0] }));
      toast({ title: "Success", description: `${urls.length} image(s) uploaded!` });
    } catch { toast({ title: "Upload Failed", variant: "destructive" }); }
    finally { setIsUploading(false); }
  };

  const saveNewRecipe = () => {
    if (!newRecipe.title?.trim()) { toast({ title: "Error", description: "Please enter a title", variant: "destructive" }); return; }
    const recipe: Recipe = {
      id: Date.now().toString(), title: newRecipe.title!, description: newRecipe.description || "",
      instructions: newRecipe.instructions?.filter(i => i.trim()) || [], servings: newRecipe.servings || 4,
      prepTime: newRecipe.prepTime || 0, cookTime: newRecipe.cookTime || 0, difficulty: newRecipe.difficulty || 1,
      ingredients: newRecipe.ingredients?.filter(i => i.trim()) || [], tips: newRecipe.tips?.filter(t => t.trim()) || [],
      nutrition: newRecipe.nutrition || {}, images: newRecipe.images?.filter(i => i.trim()) || [],
      imageUrl: newRecipe.images?.[0] || newRecipe.imageUrl
    };
    setCurrentRecipe(recipe); setIsAddingRecipe(false); setCurrentStep(0);
    setNewRecipe({ title: "", description: "", instructions: [""], servings: 4, prepTime: 0, cookTime: 0, difficulty: 1, ingredients: [""], tips: [""], nutrition: {}, images: [], owner: "", selectedImageIndex: 0 });
    toast({ title: "Success", description: "Recipe created!" });
  };

  const fetchRecipe = () => { if (!recipeURL.trim()) { toast({ title: "Error", description: "Enter a URL", variant: "destructive" }); return; } setShowUrlOptionsDialog(true); };

  const createNewRecipeFromUrl = () => {
    setShowUrlOptionsDialog(false);
    toast({ title: "Creating Recipe", description: "AI is analyzing..." });
    setTimeout(() => { setCurrentRecipe(SAMPLE_RECIPE); toast({ title: "Success" }); }, 2000);
  };

  const summarizeOnly = () => {
    setShowUrlOptionsDialog(false);
    toast({ title: "Summarizing..." });
    setTimeout(() => {
      setSummary(`Quick Recipe Summary:\n\nINGREDIENTS:\n${SAMPLE_RECIPE.ingredients.map(i => `• ${i}`).join('\n')}\n\nINSTRUCTIONS:\n${SAMPLE_RECIPE.instructions.map((s,i) => `${i+1}. ${s}`).join('\n')}\n\nServes ${SAMPLE_RECIPE.servings}. ${SAMPLE_RECIPE.prepTime}min prep.`);
      setShowSummary(true);
    }, 1500);
  };

  const updateRating = (type: 'ease' | 'quality', rating: number) => {
    if (!currentRecipe) return;
    setCurrentRecipe(prev => prev ? { ...prev, [type === 'ease' ? 'easeRating' : 'qualityRating']: rating } : null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10" style={{ backgroundColor: themeColor }} />
      <div className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="mr-4"><Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">← Dashboard</Link></Button>
          <span className="text-4xl">👨‍🍳</span> Make It With Me
        </div>
        <div className="flex items-center gap-2">
          {currentRecipe && <Button onClick={() => setShowSummary(true)} variant="outline" size="sm">Recipe Summary</Button>}
          {currentRecipe && <Button onClick={() => { const email = localStorage.getItem("userEmail") || ""; const body = encodeURIComponent(`${currentRecipe.title}\n\n${currentRecipe.ingredients.map(i=>`• ${i}`).join('\n')}`); window.location.href = `mailto:${email}?subject=Recipe: ${currentRecipe.title}&body=${body}`; }} variant="outline" size="sm" className="w-8 h-8 rounded-full p-0" title="Email">✉️</Button>}
          <Dialog open={showAddMethodDialog} onOpenChange={setShowAddMethodDialog}>
            <DialogTrigger asChild><Button className="flex items-center gap-2"><Plus className="h-4 w-4" />Add New Recipe</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>How would you like to add a recipe?</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Button onClick={() => { setShowAddMethodDialog(false); setIsAddingRecipe(true); }} className="w-full justify-start" variant="outline">Create Manually</Button>
                <Button onClick={() => { setShowAddMethodDialog(false); setShowUrlInputDialog(true); }} className="w-full justify-start" variant="outline">Provide URL</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* URL Input Dialog */}
      <Dialog open={showUrlInputDialog} onOpenChange={setShowUrlInputDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enter Recipe URL</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Recipe URL:</Label><Input type="url" placeholder="https://..." value={recipeURL} onChange={(e) => setRecipeURL(e.target.value)} className="mt-2" /></div>
            <Button onClick={() => { setShowUrlInputDialog(false); setCurrentRecipe(SAMPLE_RECIPE); toast({ title: "Recipe loaded!" }); }} className="w-full">Fetch & Analyze</Button>
          </div>
        </DialogContent>
      </Dialog>

      <RecipeForm open={isAddingRecipe} onOpenChange={setIsAddingRecipe} newRecipe={newRecipe} onChange={setNewRecipe} onSave={saveNewRecipe} onImageUpload={handleImageUpload} isUploading={isUploading} onImageOverlay={(url) => { setOverlayImageUrl(url); setShowImageOverlay(true); }} />

      <div className="ml-10 mt-9 p-8">
        <PinnedRecipesBar pinnedRecipes={pinnedRecipes} onUnpin={unpinRecipe} onImageOverlay={(url) => { setOverlayImageUrl(url); setShowImageOverlay(true); }} />

        <div className="mb-6">
          <Label className="font-semibold">Paste Recipe URL:</Label>
          <div className="flex gap-2 mt-2">
            <Input type="url" placeholder="https://..." value={recipeURL} onChange={(e) => setRecipeURL(e.target.value)} className="flex-1" />
            <Button onClick={fetchRecipe}>Fetch</Button>
          </div>
        </div>

        {currentRecipe && (
          <RecipeViewer recipe={currentRecipe} isPlaying={isPlaying} isMuted={isMuted} currentStep={currentStep}
            onTogglePlayPause={togglePlayPause}
            onToggleMute={() => { setIsMuted(!isMuted); if (!isMuted && isPlaying) stopSpeaking(); }}
            onStepChange={setCurrentStep} onResetSteps={() => { setCurrentStep(0); stopSpeaking(); }}
            onUpdateRating={updateRating}
            onImageOverlay={(url) => { setOverlayImageUrl(url); setShowImageOverlay(true); }}
          />
        )}

        {!currentRecipe && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold mb-2">Ready to Cook?</h2>
            <p className="text-muted-foreground">Add a recipe URL above or create a new recipe!</p>
          </div>
        )}
      </div>

      {/* URL Options Dialog */}
      <Dialog open={showUrlOptionsDialog} onOpenChange={setShowUrlOptionsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>What would you like to do?</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={createNewRecipeFromUrl} variant="outline" className="w-full justify-start"><Plus className="mr-2 h-4 w-4" />Create New Recipe</Button>
            <Button onClick={summarizeOnly} variant="outline" className="w-full justify-start"><Volume2 className="mr-2 h-4 w-4" />Summarize Only</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={(open) => { if (!open) { stopSpeaking(); if (currentRecipe) pinRecipe(currentRecipe); } setShowSummary(open); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{currentRecipe?.title || "Recipe Summary"}</span>
              <Button size="sm" variant="ghost" onClick={() => { if (currentRecipe && pinnedRecipes.find(p => p.id === currentRecipe.id)) { if (confirm("Remove pin?")) unpinRecipe(currentRecipe.id); } else if (currentRecipe) pinRecipe(currentRecipe); }}>
                {currentRecipe && pinnedRecipes.find(p => p.id === currentRecipe.id) ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg"><pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre></div>
            <div className="flex gap-2">
              <Button onClick={() => speakText(summary)} disabled={isPlaying}>{isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}{isPlaying ? 'Speaking...' : 'Read Aloud'}</Button>
              <Button onClick={() => { stopSpeaking(); setShowSummary(false); }} variant="outline">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Overlay */}
      <Dialog open={showImageOverlay} onOpenChange={setShowImageOverlay}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Recipe Image</DialogTitle></DialogHeader>
          <div className="flex justify-center"><img src={overlayImageUrl} alt="Recipe image" className="max-w-full max-h-[70vh] object-contain rounded-lg" /></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MakeIt;
