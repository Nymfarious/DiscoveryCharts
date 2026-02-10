import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface TrustedSourcesSettingsProps {
  trustedSources: string[];
  onSourcesChange: (sources: string[]) => void;
}

export default function TrustedSourcesSettings({ trustedSources, onSourcesChange }: TrustedSourcesSettingsProps) {
  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Trusted Historical Sources</CardTitle>
            <CardDescription>Configure reliable sources for research agents</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Search agents will prioritize results from these trusted domains when researching historical topics.
        </p>
        
        <div className="space-y-3">
          {trustedSources.map((source, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input 
                value={source}
                onChange={(e) => {
                  const updated = [...trustedSources];
                  updated[index] = e.target.value;
                  onSourcesChange(updated);
                }}
                placeholder="e.g., wikipedia.org"
                className="flex-1"
              />
              <Button 
                onClick={() => onSourcesChange(trustedSources.filter((_, i) => i !== index))}
                variant="ghost" size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        
        {trustedSources.length < 5 && (
          <Button 
            onClick={() => onSourcesChange([...trustedSources, ""])}
            variant="outline" size="sm" className="w-full"
          >
            + Add Source
          </Button>
        )}
        
        <p className="text-xs text-muted-foreground italic">
          Maximum 5 trusted sources. Enter domain names only (e.g., loc.gov, not https://loc.gov)
        </p>
      </CardContent>
    </Card>
  );
}
