import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, Plus, Star, Volume2, VolumeX, Utensils, Clock, Users, Heart, Upload, ImageIcon, X, Pin, PinOff, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: number;
  ingredients: string[];
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  tips: string[];
  images?: string[];
  imageUrl?: string;
  easeRating?: number;
  qualityRating?: number;
  source?: string;
  owner?: string;
  selectedImageIndex?: number;
  isPinned?: boolean;
}

interface PinnedRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  isPinned: boolean;
}

const MakeIt = () => {
  const { toast } = useToast();
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [recipeURL, setRecipeURL] = useState<string>("https://testsite.com/recipe/");
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddRecipeDialog, setShowAddRecipeDialog] = useState(false);
  const [showUrlOptionsDialog, setShowUrlOptionsDialog] = useState(false);
  const [showUrlInputDialog, setShowUrlInputDialog] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [showSummary, setShowSummary] = useState(false);
  const [pinnedRecipes, setPinnedRecipes] = useState<PinnedRecipe[]>([]);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [overlayImageUrl, setOverlayImageUrl] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddMethodDialog, setShowAddMethodDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: "",
    description: "",
    instructions: [""],
    servings: 4,
    prepTime: 0,
    cookTime: 0,
    difficulty: 1,
    ingredients: [""],
    tips: [""],
    nutrition: {},
    images: [],
    owner: "",
    selectedImageIndex: 0
  });

  // Sample recipe for demonstration
  const sampleRecipe: Recipe = {
    id: "1",
    title: "Jim's Pineapple Cheese Pie",
    description: "A 5-ingredient, no-bake dessert that's a bake sale legend. Light and fruity filling with a pineapple-cheesecake flavor.",
    instructions: [
      "If using homemade crust, preheat oven to 350°F (175°C). For no-bake version, skip this step.",
      "Drain juice from canned pineapple into microwave-safe bowl, reserving the fruit for later.",
      "Warm the pineapple juice in microwave for 1 minute.",
      "Stir pineapple Jell-O into the warm juice until completely dissolved.",
      "In a large bowl, beat cream cheese and whipped topping until smooth and well combined.",
      "Add the reserved crushed pineapple to the cream cheese mixture.",
      "Stir in the gelatin mixture until everything is silky and smooth.",
      "Pour the filling into your prepared pie crust.",
      "Refrigerate for 4-5 hours until completely set.",
      "Slice and serve chilled. Enjoy your delicious pie!"
    ],
    servings: 8,
    prepTime: 20,
    cookTime: 0,
    difficulty: 1,
    ingredients: [
      "1 can crushed pineapple with juice",
      "1 package pineapple Jell-O",
      "1 container whipped cream cheese",
      "1 container frozen whipped topping (thawed)",
      "1 ready-to-serve pie crust"
    ],
    nutrition: {
      calories: 285,
      protein: "4g",
      carbs: "32g",
      fat: "16g"
    },
    tips: [
      "Recipe makes enough filling for two 9-inch pies - make extra or enjoy leftover filling in bowls",
      "Try with orange or lemon Jell-O for different flavors",
      "Graham cracker crust works beautifully with this recipe",
      "Perfect for summer potlucks and bake sales"
    ],
    images: [
      "https://www.allrecipes.com/thmb/An41acRPTpwaBryMPCfRsE3VVMs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/12478-jims-pineapple-cheese-pie-VAT-Beauty-4x3-d209c100bfff41b1942193f57811420a.jpg",
      "https://via.placeholder.com/800x600/FFB6C1/000000?text=Step+by+Step+Process",
      "https://via.placeholder.com/800x600/98FB98/000000?text=Final+Result"
    ],
    imageUrl: "https://www.allrecipes.com/thmb/An41acRPTpwaBryMPCfRsE3VVMs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/12478-jims-pineapple-cheese-pie-VAT-Beauty-4x3-d209c100bfff41b1942193f57811420a.jpg",
    easeRating: 5,
    qualityRating: 4,
    source: "Allrecipes"
  };

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
    setCurrentRecipe(sampleRecipe);
    
    // Load pinned recipes from localStorage
    const saved = localStorage.getItem("pinnedRecipes");
    if (saved) {
      setPinnedRecipes(JSON.parse(saved));
    }
  }, []);

  const fetchRecipe = async () => {
    if (!recipeURL.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe URL",
        variant: "destructive"
      });
      return;
    }

    // Show options dialog for main page URL fetch
    setShowUrlOptionsDialog(true);
  };

  const fetchAndAnalyzeFromDialog = async () => {
    if (!recipeURL.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe URL",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Fetching Recipe",
        description: "AI is analyzing the recipe URL...",
      });

      // For demo, we'll use the sample recipe
      setTimeout(() => {
        setCurrentRecipe(sampleRecipe);
        setShowUrlInputDialog(false);
        toast({
          title: "Success",
          description: "Recipe has been analyzed and loaded!",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recipe from URL",
        variant: "destructive"
      });
    }
  };

  const createNewRecipeFromUrl = () => {
    setShowUrlOptionsDialog(false);
    try {
      toast({
        title: "Creating Recipe",
        description: "AI is analyzing the recipe URL...",
      });

      setTimeout(() => {
        setCurrentRecipe(sampleRecipe);
        toast({
          title: "Success",
          description: "Recipe has been analyzed and loaded!",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recipe from URL",
        variant: "destructive"
      });
    }
  };

  const summarizeOnly = () => {
    setShowUrlOptionsDialog(false);
    try {
      toast({
        title: "Summarizing Recipe",
        description: "AI is creating a quick summary...",
      });

      setTimeout(() => {
        const quickSummary = `Quick Recipe Summary:

INGREDIENTS:
• 1 can crushed pineapple with juice
• 1 package pineapple Jell-O
• 1 container whipped cream cheese
• 1 container frozen whipped topping (thawed)
• 1 ready-to-serve pie crust

INSTRUCTIONS:
1. Drain pineapple juice and warm for 1 minute
2. Dissolve Jell-O in warm juice
3. Beat cream cheese with whipped topping
4. Mix in pineapple and gelatin mixture
5. Pour into crust and refrigerate 4-5 hours

Ready in 20 minutes prep + 4-5 hours chilling. Serves 8.`;
        
        setSummary(quickSummary);
        setShowSummary(true);
        toast({
          title: "Summary Ready",
          description: "Quick recipe summary created!",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to summarize recipe",
        variant: "destructive"
      });
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      // Stop current speech
      speechSynthesis.cancel();
      if (speechRef.current) {
        speechRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playing current step
      if (currentRecipe && currentRecipe.instructions[currentStep]) {
        try {
          await speakText(currentRecipe.instructions[currentStep]);
        } catch (error) {
          console.error('Error playing audio:', error);
          toast({
            title: "Audio Error",
            description: "Unable to play audio. Please check your internet connection.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    if (speechRef.current) {
      speechRef.current = null;
    }
    setIsPlaying(false);
  };

  const speakText = async (text: string) => {
    try {
      setIsPlaying(true);
      
      // Simple Web Speech API fallback for now
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = isMuted ? 0 : 1;
        
        speechRef.current = utterance;
        
        utterance.onend = () => {
          setIsPlaying(false);
          speechRef.current = null;
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          speechRef.current = null;
          // Don't show error toast when pausing, only on actual errors
          if (speechSynthesis.speaking) {
            toast({
              title: "Speech Error",
              description: "Unable to speak text. Please try again.",
              variant: "destructive"
            });
          }
        };
        
        speechSynthesis.speak(utterance);
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      setIsPlaying(false);
      speechRef.current = null;
      throw error;
    }
  };

  const pinRecipe = (recipe: Recipe) => {
    const pinnedRecipe: PinnedRecipe = {
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.imageUrl || recipe.images?.[recipe.selectedImageIndex || 0],
      isPinned: true
    };
    
    const updated = [...pinnedRecipes.filter(p => p.id !== recipe.id), pinnedRecipe];
    setPinnedRecipes(updated);
    localStorage.setItem("pinnedRecipes", JSON.stringify(updated));
    
    toast({
      title: "Recipe Pinned",
      description: "Recipe has been pinned to the top of the page",
    });
  };

  const unpinRecipe = (recipeId: string) => {
    const updated = pinnedRecipes.filter(p => p.id !== recipeId);
    setPinnedRecipes(updated);
    localStorage.setItem("pinnedRecipes", JSON.stringify(updated));
    
    toast({
      title: "Recipe Unpinned",
      description: "Recipe has been removed from pins",
    });
  };

  const openImageOverlay = (imageUrl: string) => {
    setOverlayImageUrl(imageUrl);
    setShowImageOverlay(true);
  };

  const openImagesTab = () => {
    // Find the Images tab and activate it
    const imagesTabTrigger = document.querySelector('[data-tab="images"]') as HTMLElement;
    if (imagesTabTrigger) {
      imagesTabTrigger.click();
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!newRecipe.images) return;
    
    const images = [...newRecipe.images];
    const [moved] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, moved);
    
    setNewRecipe(prev => ({
      ...prev,
      images: images
    }));
  };

  const selectSummaryImage = (imageIndex: number) => {
    if (currentRecipe) {
      setCurrentRecipe(prev => prev ? {
        ...prev,
        selectedImageIndex: imageIndex
      } : null);
    }
  };

  const checkFamilyTreeMatch = (name: string) => {
    // Mock family tree check - replace with actual logic
    const familyMembers = ["Alice Johnson", "Great Aunt Alice", "Uncle Bob", "Grandma Rose"];
    const lowerName = name.toLowerCase();
    
    for (const member of familyMembers) {
      if (member.toLowerCase().includes(lowerName) || lowerName.includes(member.toLowerCase().split(' ')[0])) {
        return { 
          match: true, 
          suggestion: `Is this the same ${member} from your family tree?` 
        };
      }
    }
    return { match: false, suggestion: '' };
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ""]
    }));
  };

  const addTip = () => {
    setNewRecipe(prev => ({
      ...prev,
      tips: [...(prev.tips || []), ""]
    }));
  };

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), ""]
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.map((ing, i) => i === index ? value : ing) || []
    }));
  };

  const updateTip = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      tips: prev.tips?.map((tip, i) => i === index ? value : tip) || []
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions?.map((inst, i) => i === index ? value : inst) || []
    }));
  };

  const saveNewRecipe = async () => {
    if (!newRecipe.title?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe title",
        variant: "destructive"
      });
      return;
    }

    const recipe: Recipe = {
      id: Date.now().toString(),
      title: newRecipe.title,
      description: newRecipe.description || "",
      instructions: newRecipe.instructions?.filter(inst => inst.trim()) || [],
      servings: newRecipe.servings || 4,
      prepTime: newRecipe.prepTime || 0,
      cookTime: newRecipe.cookTime || 0,
      difficulty: newRecipe.difficulty || 1,
      ingredients: newRecipe.ingredients?.filter(ing => ing.trim()) || [],
      tips: newRecipe.tips?.filter(tip => tip.trim()) || [],
      nutrition: newRecipe.nutrition || {},
      images: newRecipe.images?.filter(img => img.trim()) || [],
      imageUrl: newRecipe.images?.[0] || newRecipe.imageUrl
    };

    setCurrentRecipe(recipe);
    setIsAddingRecipe(false);
      setNewRecipe({
        title: "",
        description: "",
        instructions: [""],
        servings: 4,
        prepTime: 0,
        cookTime: 0,
        difficulty: 1,
        ingredients: [""],
        tips: [""],
        nutrition: {},
        images: [],
        owner: "",
        selectedImageIndex: 0
      });
    setCurrentStep(0);

    toast({
      title: "Success",
      description: "Recipe created successfully!",
    });
  };

  const clearForm = () => {
    setNewRecipe({
      title: "",
      description: "",
      instructions: [""],
      servings: 4,
      prepTime: 0,
      cookTime: 0,
      difficulty: 1,
      ingredients: [""],
      tips: [""],
      nutrition: {},
      images: [],
      owner: "",
      selectedImageIndex: 0
    });
    setIsAddingRecipe(false);
    setCurrentStep(0);
  };

  const updateRating = (type: 'ease' | 'quality', rating: number) => {
    if (!currentRecipe) return;
    
    setCurrentRecipe(prev => prev ? {
      ...prev,
      [type === 'ease' ? 'easeRating' : 'qualityRating']: rating
    } : null);

    toast({
      title: "Rating Updated",
      description: `${type === 'ease' ? 'Ease of cooking' : 'Quality'} rated ${rating} stars`,
    });
  };

  const exportToNotion = () => {
    if (!currentRecipe) return;
    toast({
      title: "Exporting to Notion",
      description: "Recipe will be sent to your connected Notion workspace",
    });
  };

  const emailRecipe = () => {
    if (!currentRecipe) return;
    const email = localStorage.getItem("userEmail") || "";
    const subject = `Recipe: ${currentRecipe.title}`;
    const body = encodeURIComponent(
      `${currentRecipe.title}\n\nIngredients:\n${currentRecipe.ingredients.map(ing => `• ${ing}`).join('\n')}\n\nInstructions:\n${currentRecipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nServes: ${currentRecipe.servings}\nPrep: ${currentRecipe.prepTime}min | Cook: ${currentRecipe.cookTime}min`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const nextStep = () => {
    if (currentRecipe && currentStep < currentRecipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file types
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of validFiles) {
        const fileName = `recipe-${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setNewRecipe(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), ...uploadedUrls],
        imageUrl: prev.imageUrl || uploadedUrls[0] // Set first image as main if none exists
      }));
      
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully!`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10"
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Header */}
      <div 
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center justify-between"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="mr-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
              ← Dashboard
            </Link>
          </Button>
          <span className="text-4xl">👨‍🍳</span>
          Make It With Me
        </div>
        
        <div className="flex items-center gap-2">
          {/* Recipe Summary Button */}
          {(currentRecipe || summary) && (
            <Button
              onClick={() => setShowSummary(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Recipe Summary
            </Button>
          )}
          
          {/* Notion Button - Circular */}
          {currentRecipe && (
            <Button
              onClick={exportToNotion}
              variant="outline"
              size="sm"
              className="w-8 h-8 rounded-full p-0"
              title="Export to Notion"
            >
              📝
            </Button>
          )}
          
          {/* Email Button - Circular */}
          {currentRecipe && (
            <Button
              onClick={emailRecipe}
              variant="outline"
              size="sm"
              className="w-8 h-8 rounded-full p-0"
              title="Email Recipe"
            >
              ✉️
            </Button>
          )}
          
          <Dialog open={showAddMethodDialog} onOpenChange={setShowAddMethodDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>How would you like to add a recipe?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setShowAddMethodDialog(false);
                    setIsAddingRecipe(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Create Manually
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddMethodDialog(false);
                    setShowUrlInputDialog(true);
                  }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Provide URL
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* URL Input Dialog */}
      <Dialog open={showUrlInputDialog} onOpenChange={setShowUrlInputDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Recipe URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dialogRecipeURL">Recipe URL:</Label>
              <Input
                id="dialogRecipeURL"
                type="url"
                placeholder="https://testsite.com/recipe/..."
                value={recipeURL}
                onChange={(e) => setRecipeURL(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={fetchAndAnalyzeFromDialog} className="w-full">
              Fetch & Analyze
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Recipe Dialog */}
      <Dialog open={isAddingRecipe} onOpenChange={setIsAddingRecipe}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Recipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  value={newRecipe.title || ""}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter recipe title"
                />
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={newRecipe.servings || 4}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="owner">Original Recipe Owner</Label>
              <Input
                id="owner"
                value={newRecipe.owner || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewRecipe(prev => ({ ...prev, owner: value }));
                  
                  // Check for family tree matches when typing
                  if (value.length > 3) {
                    const match = checkFamilyTreeMatch(value);
                    if (match.match && value.trim()) {
                      toast({
                        title: "Family Tree Match?",
                        description: match.suggestion,
                        duration: 5000,
                      });
                    }
                  }
                }}
                placeholder="Who created this recipe originally?"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRecipe.description || ""}
                onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the recipe"
              />
            </div>

            <div>
              <Label>Ingredients</Label>
              {newRecipe.ingredients?.map((ingredient, index) => (
                <Input
                  key={index}
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                  className="mt-2"
                />
              ))}
              <Button type="button" onClick={addIngredient} className="mt-2" variant="outline">
                Add Ingredient
              </Button>
            </div>

            <div>
              <Label>Instructions</Label>
              {newRecipe.instructions?.map((instruction, index) => (
                <Textarea
                  key={index}
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  className="mt-2"
                />
              ))}
              <Button type="button" onClick={addInstruction} className="mt-2" variant="outline">
                Add Step
              </Button>
            </div>

            <div>
              <Label>Images</Label>
              <div className="mt-2">
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload multiple recipe images
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB each
                      </span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2 text-sm text-blue-600">
                    Uploading images...
                  </div>
                )}
                {newRecipe.images && newRecipe.images.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newRecipe.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Recipe ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border cursor-pointer"
                            onClick={() => openImageOverlay(image)}
                          />
                          
                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                            onClick={() => {
                              setNewRecipe(prev => ({
                                ...prev,
                                images: prev.images?.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          {/* Pin as Main Image Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`absolute bottom-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white ${
                              newRecipe.selectedImageIndex === index ? 'bg-primary/80 text-white' : ''
                            }`}
                            onClick={() => {
                              setNewRecipe(prev => ({
                                ...prev,
                                imageUrl: image,
                                selectedImageIndex: index
                              }));
                              toast({
                                title: "Main Image Set",
                                description: "This image is now the main recipe image",
                              });
                            }}
                            title="Set as main image"
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          
                          {/* Reorder Controls */}
                          <div className="absolute left-1 top-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 bg-white/80 hover:bg-white"
                                onClick={() => moveImage(index, index - 1)}
                                title="Move up"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                            )}
                            {index < (newRecipe.images?.length || 0) - 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 bg-white/80 hover:bg-white"
                                onClick={() => moveImage(index, index + 1)}
                                title="Move down"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Main Image Indicator */}
                          {newRecipe.selectedImageIndex === index && (
                            <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                              Main
                            </div>
                          )}
                          
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={newRecipe.prepTime || 0}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={newRecipe.cookTime || 0}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Select
                  value={newRecipe.difficulty?.toString() || "1"}
                  onValueChange={(value) => setNewRecipe(prev => ({ ...prev, difficulty: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Textarea
                  key={index}
                  value={tip}
                  onChange={(e) => updateTip(index, e.target.value)}
                  placeholder={`Tip ${index + 1}`}
                  className="mt-2"
                />
              ))}
              <Button type="button" onClick={addTip} className="mt-2" variant="outline">
                Add Tip
              </Button>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={saveNewRecipe} className="flex-1">
                Create Recipe
              </Button>
              <Button onClick={clearForm} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        {/* Pinned Recipes */}
        {pinnedRecipes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Pinned Recipes</h3>
            <div className="flex gap-3 flex-wrap">
              {pinnedRecipes.map((recipe) => (
                <Card key={recipe.id} className="w-64 cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {recipe.imageUrl && (
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title}
                          className="w-16 h-16 object-cover rounded-lg"
                          onClick={() => openImageOverlay(recipe.imageUrl!)}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{recipe.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 px-2 text-xs"
                          onClick={() => {
                            if (confirm("Remove pin?")) {
                              unpinRecipe(recipe.id);
                            }
                          }}
                        >
                          <PinOff className="h-3 w-3 mr-1" />
                          Unpin
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recipe URL Input */}
        <div className="mb-6">
          <Label htmlFor="recipeURL" className="font-semibold">
            Paste Recipe URL:
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="recipeURL"
              type="url"
              placeholder="https://testsite.com/recipe/..."
              value={recipeURL}
              onChange={(e) => setRecipeURL(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchRecipe}>
              Fetch
            </Button>
          </div>
        </div>

        {/* Recipe Display */}
        {currentRecipe && (
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Recipe Image */}
                  {(currentRecipe.imageUrl || (currentRecipe.images && currentRecipe.images.length > 0)) && (
                  <div className="flex-shrink-0">
                    <img 
                      src={currentRecipe.imageUrl || currentRecipe.images?.[currentRecipe.selectedImageIndex || 0] || currentRecipe.images?.[0]} 
                      alt={currentRecipe.title}
                      className="w-24 h-24 object-cover rounded-lg border shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageOverlay(currentRecipe.imageUrl || currentRecipe.images?.[currentRecipe.selectedImageIndex || 0] || currentRecipe.images?.[0] || "")}
                    />
                      {currentRecipe.images && currentRecipe.images.length > 1 && (
                        <Badge 
                          variant="secondary" 
                          className="mt-1 text-xs cursor-pointer hover:bg-secondary/80"
                          onClick={openImagesTab}
                        >
                          +{currentRecipe.images.length - 1} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                      {!currentRecipe.imageUrl && (!currentRecipe.images || currentRecipe.images.length === 0) && <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                      {currentRecipe.title}
                    </CardTitle>
                    <p className="text-muted-foreground mb-4">{currentRecipe.description}</p>
                    
                    {/* Recipe Info Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Serves {currentRecipe.servings}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {currentRecipe.prepTime + currentRecipe.cookTime} min total
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        Difficulty: {currentRecipe.difficulty}/5
                      </Badge>
                      {currentRecipe.source && (
                        <Badge variant="outline">
                          Source: {currentRecipe.source}
                        </Badge>
                      )}
                    </div>

                  {/* Rating System */}
                  <div className="flex gap-6 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Ease of Cooking:</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 cursor-pointer ${
                              star <= (currentRecipe.easeRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => updateRating('ease', star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quality/Taste:</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 cursor-pointer ${
                              star <= (currentRecipe.qualityRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => updateRating('quality', star)}
                          />
                        ))}
                      </div>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Voice Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={togglePlayPause}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={!currentRecipe.instructions[currentStep]}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Read Aloud'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted && isPlaying) {
                        speechSynthesis.cancel();
                        setIsPlaying(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
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
                  <TabsTrigger value="images" data-value="images">Images</TabsTrigger>
                </TabsList>

                <TabsContent value="instructions" className="mt-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Cooking Instructions</h3>
                      <div className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {currentRecipe.instructions.length}
                      </div>
                    </div>
                    
                    {/* Current Step Display - Fixed height to prevent jumping */}
                    <div className="mb-6">
                      <div className="bg-background border-2 border-primary/20 rounded-lg p-6 min-h-[120px] flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">Step {currentStep + 1}</Badge>
                          {isPlaying && (
                            <Badge variant="default" className="animate-pulse">
                              🔊 Reading...
                            </Badge>
                          )}
                        </div>
                         <p className="text-lg leading-relaxed">
                           {currentRecipe.instructions[currentStep]}
                           {/* Check if step has image reference or matches step number */}
                           {(currentRecipe.instructions[currentStep].toLowerCase().includes('image') || 
                             currentRecipe.instructions[currentStep].toLowerCase().includes('photo') ||
                             currentRecipe.instructions[currentStep].toLowerCase().includes('picture') ||
                             (currentRecipe.images && currentRecipe.images.length > currentStep + 1)) && (
                             <Button
                               size="sm"
                               variant="ghost"
                               className="ml-2 h-6 w-6 p-0 text-primary hover:text-primary/80"
                                onClick={() => {
                                  // Open the large image overlay for the step-related image
                                  if (currentRecipe.images && currentStep < currentRecipe.images.length) {
                                    openImageOverlay(currentRecipe.images[currentStep]);
                                  }
                                }}
                               title="View step image"
                             >
                               <Camera className="h-4 w-4" />
                             </Button>
                           )}
                         </p>
                      </div>
                    </div>

                    {/* Navigation Controls - Aligned to left and dynamic */}
                    <div className="flex gap-2 justify-start">
                      <Button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        variant={currentStep === 0 ? "ghost" : "outline"}
                        size="sm"
                        className={currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        ← Previous
                      </Button>
                      <Button
                        onClick={resetSteps}
                        variant="outline"
                        size="sm"
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={currentStep === currentRecipe.instructions.length - 1}
                        variant={currentStep === currentRecipe.instructions.length - 1 ? "ghost" : "outline"}
                        size="sm"
                        className={currentStep === currentRecipe.instructions.length - 1 ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        Next →
                      </Button>
                    </div>

                    {/* All Steps Overview */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3 text-muted-foreground">All Steps Overview:</h4>
                      <ol className="space-y-3">
                        {currentRecipe.instructions.map((step, index) => (
                          <li 
                            key={index} 
                            className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              index === currentStep 
                                ? 'bg-primary/10 border border-primary/30' 
                                : 'bg-muted/30 hover:bg-muted/50'
                            }`}
                            onClick={() => setCurrentStep(index)}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === currentStep 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted-foreground/20 text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className={index === currentStep ? 'font-medium' : ''}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    {(currentRecipe.prepTime > 0 || currentRecipe.cookTime > 0) && (
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center gap-4 text-sm">
                          {currentRecipe.prepTime > 0 && (
                            <span><strong>Prep:</strong> {currentRecipe.prepTime} min</span>
                          )}
                          {currentRecipe.cookTime > 0 && (
                            <span><strong>Cook:</strong> {currentRecipe.cookTime} min</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="ingredients" className="mt-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 text-lg">Ingredients</h3>
                    <ul className="space-y-2">
                      {currentRecipe.ingredients.map((ingredient, index) => (
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
                    {currentRecipe.tips.length > 0 ? (
                      <ul className="space-y-3">
                        {currentRecipe.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No tips available for this recipe.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="nutrition" className="mt-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 text-lg">Nutrition Information</h3>
                    {currentRecipe.nutrition && Object.keys(currentRecipe.nutrition).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {currentRecipe.nutrition.calories && (
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-primary">{currentRecipe.nutrition.calories}</div>
                            <div className="text-sm text-muted-foreground">Calories</div>
                          </div>
                        )}
                        {currentRecipe.nutrition.protein && (
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{currentRecipe.nutrition.protein}</div>
                            <div className="text-sm text-muted-foreground">Protein</div>
                          </div>
                        )}
                        {currentRecipe.nutrition.carbs && (
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-yellow-600">{currentRecipe.nutrition.carbs}</div>
                            <div className="text-sm text-muted-foreground">Carbs</div>
                          </div>
                        )}
                        {currentRecipe.nutrition.fat && (
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-orange-600">{currentRecipe.nutrition.fat}</div>
                            <div className="text-sm text-muted-foreground">Fat</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No nutrition information available for this recipe.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="mt-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 text-lg">Recipe Images</h3>
                    {currentRecipe.images && currentRecipe.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentRecipe.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                            onClick={() => openImageOverlay(image)}
                          >
                            <img
                              src={image}
                              alt={`Recipe step ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white text-black px-2 py-1 rounded text-sm">
                                  Click to enlarge
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="absolute bottom-2 left-2 bg-white/90"
                            >
                              Step {index + 1}
                            </Badge>
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
        )}

        {!currentRecipe && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold mb-2">Ready to Cook?</h2>
            <p className="text-muted-foreground mb-6">Add a recipe URL above or create a new recipe to get started!</p>
          </div>
        )}
      </div>

      {/* URL Options Dialog */}
      <Dialog open={showUrlOptionsDialog} onOpenChange={setShowUrlOptionsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What would you like to do?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button 
              onClick={createNewRecipeFromUrl}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Recipe
            </Button>
            <Button 
              onClick={summarizeOnly}
              className="w-full justify-start"
              variant="outline"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Summarize Only
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={(open) => {
        if (!open) {
          stopSpeaking();
          // Pin by default when closing
          if (currentRecipe) {
            pinRecipe(currentRecipe);
          }
        }
        setShowSummary(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 {currentRecipe?.images && currentRecipe.images.length > 0 && (
                   <div className="relative">
                     {currentRecipe.images.length > 1 ? (
                       <div className="flex items-center gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-8 w-8 p-0"
                           onClick={() => {
                             const prevIndex = (currentRecipe.selectedImageIndex || 0) > 0 
                               ? (currentRecipe.selectedImageIndex || 0) - 1 
                               : currentRecipe.images!.length - 1;
                             selectSummaryImage(prevIndex);
                           }}
                         >
                           <ChevronLeft className="h-4 w-4" />
                         </Button>
                         <img 
                           src={currentRecipe.images[currentRecipe.selectedImageIndex || 0]} 
                           alt={currentRecipe.title}
                           className="w-12 h-12 object-cover rounded-lg border shadow-sm cursor-pointer"
                           onClick={() => {
                             openImageOverlay(currentRecipe.images![currentRecipe.selectedImageIndex || 0]);
                           }}
                         />
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-8 w-8 p-0"
                           onClick={() => {
                             const nextIndex = (currentRecipe.selectedImageIndex || 0) < currentRecipe.images!.length - 1 
                               ? (currentRecipe.selectedImageIndex || 0) + 1 
                               : 0;
                             selectSummaryImage(nextIndex);
                           }}
                         >
                           <ChevronRight className="h-4 w-4" />
                         </Button>
                       </div>
                     ) : (
                       <img 
                         src={currentRecipe.images[0]} 
                         alt={currentRecipe.title}
                         className="w-12 h-12 object-cover rounded-lg border shadow-sm cursor-pointer"
                         onClick={() => {
                           openImageOverlay(currentRecipe.images![0]);
                         }}
                       />
                     )}
                   </div>
                 )}
                 <div>
                   <div className="font-semibold">
                     {summary.includes("Quick Recipe Summary") 
                       ? "Quick Recipe Summary" 
                       : currentRecipe?.title || "Recipe Summary"
                     }
                   </div>
                   {currentRecipe?.images && currentRecipe.images.length > 1 && (
                     <div className="text-xs text-muted-foreground">
                       Image {(currentRecipe.selectedImageIndex || 0) + 1} of {currentRecipe.images.length}
                     </div>
                   )}
                 </div>
               </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (currentRecipe && pinnedRecipes.find(p => p.id === currentRecipe.id)) {
                    if (confirm("Remove pin?")) {
                      unpinRecipe(currentRecipe.id);
                    }
                  } else if (currentRecipe) {
                    pinRecipe(currentRecipe);
                  }
                }}
              >
                {currentRecipe && pinnedRecipes.find(p => p.id === currentRecipe.id) ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => speakText(summary)}
                disabled={isPlaying}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Speaking...' : 'Read Aloud'}
              </Button>
              <Button
                onClick={() => {
                  stopSpeaking();
                  setShowSummary(false);
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Overlay */}
      <Dialog open={showImageOverlay} onOpenChange={setShowImageOverlay}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Recipe Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={overlayImageUrl} 
              alt="Recipe image enlarged"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MakeIt;