export interface Recipe {
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

export interface PinnedRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  isPinned: boolean;
}

export const SAMPLE_RECIPE: Recipe = {
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
  nutrition: { calories: 285, protein: "4g", carbs: "32g", fat: "16g" },
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
