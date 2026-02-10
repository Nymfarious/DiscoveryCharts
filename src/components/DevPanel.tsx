import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, X, ChevronUp, Map, Upload } from "lucide-react";
import AdminIngest from "@/pages/AdminIngest";
import HDAdmin from "@/pages/HDAdmin";

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevPanel({ isOpen, onClose }: DevPanelProps) {
  // Auth stubbed — always admin
  const isAdmin = true;

  if (!isAdmin) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Bottom Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '85vh',
          background: 'linear-gradient(to top, hsl(var(--leather)), hsl(var(--brass)/0.3))',
        }}
      >
        {/* Handle Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b-2 border-[hsl(var(--brass))]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[hsl(var(--gold))]" />
            <h2 className="text-lg font-bold text-[hsl(var(--parchment))]" 
                style={{ fontFamily: 'Georgia, serif' }}>
              Developer Tools
            </h2>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-yellow-600 
                          border border-yellow-800 shadow-md">
              <span className="text-xs font-bold text-[hsl(var(--leather))]">ADMIN</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[hsl(var(--parchment))] hover:bg-white/10"
          >
            <ChevronUp className="w-5 h-5 mr-2" />
            Close
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* HD Admin Upload System */}
            <Card className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))] shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[hsl(var(--brass))]" />
                  <CardTitle style={{ fontFamily: 'Georgia, serif' }}>HD Admin - Base Maps & Overlays</CardTitle>
                </div>
                <CardDescription>
                  Upload high-resolution historical maps with automatic metadata extraction and normalized storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HDAdmin />
              </CardContent>
            </Card>

            {/* Legacy Chart Uploader */}
            <Card className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-[hsl(var(--brass))]" />
                  <CardTitle style={{ fontFamily: 'Georgia, serif' }}>Legacy Chart Uploader</CardTitle>
                </div>
                <CardDescription>
                  Original poster/chart upload system (deprecated - use HD Admin above)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[hsl(var(--parchment))] rounded-lg p-4">
                  <AdminIngest />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
