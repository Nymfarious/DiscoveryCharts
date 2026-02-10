import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

const THEME_PRESETS = [
  {
    name: "Vintage Cartographer",
    colors: { light: "#f5e6d3", medium: "#8b7355", dark: "#5c4a3a" },
    description: "Aged parchment and explorer's desk"
  },
  { name: "Blue", colors: { light: "#e3f2fd", medium: "#2196f3", dark: "#1565c0" } },
  { name: "Purple", colors: { light: "#f3e5f5", medium: "#9c27b0", dark: "#6a1b9a" } },
  { name: "Gray", colors: { light: "#f5f5f5", medium: "#757575", dark: "#424242" } },
  { name: "Pink", colors: { light: "#fce4ec", medium: "#e91e63", dark: "#ad1457" } },
  { name: "Orange", colors: { light: "#fff3e0", medium: "#ff9800", dark: "#e65100" } },
  { name: "Green", colors: { light: "#e8f5e8", medium: "#4caf50", dark: "#2e7d32" } }
];

interface ThemeSettingsProps {
  themeColor: string;
  onThemeChange: (color: string) => void;
}

export default function ThemeSettings({ themeColor, onThemeChange }: ThemeSettingsProps) {
  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Theme Customization</CardTitle>
            <CardDescription>Personalize your visual experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="favcolor" className="text-sm font-medium">Custom Color</Label>
          <div className="flex items-center gap-3">
            <input 
              id="favcolor"
              type="color"
              value={themeColor}
              onChange={(e) => onThemeChange(e.target.value)}
              className="w-16 h-10 rounded-md border-2 border-border cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">Click to choose your accent color</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Themes</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((theme) => (
              <div key={theme.name} className="space-y-2">
                <div className="flex items-center justify-center gap-1">
                  <h4 className="text-xs font-medium text-center">{theme.name}</h4>
                  {theme.name === "Vintage Cartographer" && <span className="text-sm">🗺️</span>}
                </div>
                {'description' in theme && theme.description && (
                  <p className="text-xs text-muted-foreground text-center italic leading-tight">
                    {theme.description}
                  </p>
                )}
                <div className="flex gap-1 justify-center">
                  {(['light', 'medium', 'dark'] as const).map((shade) => (
                    <button
                      key={shade}
                      onClick={() => onThemeChange(theme.colors[shade])}
                      className="w-9 h-9 rounded-md border-2 border-border hover:scale-110 hover:border-primary transition-all shadow-sm"
                      style={{ backgroundColor: theme.colors[shade] }}
                      title={`${theme.name} ${shade.charAt(0).toUpperCase() + shade.slice(1)}`}
                      aria-label={`${theme.name} ${shade} theme`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
