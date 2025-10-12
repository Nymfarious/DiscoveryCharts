import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Upload, Home, Map } from "lucide-react";
import AdminIngest from "./AdminIngest";

const DevTools = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roles);
    setLoading(false);
    
    if (!roles) {
      navigate('/');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Decorative border */}
      <div className="fixed inset-0 pointer-events-none border-8 border-double opacity-30 z-50" 
           style={{ borderColor: 'hsl(var(--brass))' }} />
      
      {/* Header */}
      <div className="relative border-b-2 border-[hsl(var(--brass))] shadow-lg"
           style={{ 
             background: 'linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))',
             boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
           }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild size="sm"
                    className="text-[hsl(var(--parchment))] hover:bg-white/10">
              <a href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </a>
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[hsl(var(--gold))]" />
              <span className="text-xl font-bold text-[hsl(var(--parchment))]" 
                    style={{ fontFamily: 'Georgia, serif' }}>
                Developer Tools
              </span>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-yellow-600 
                        border-2 border-yellow-800 shadow-lg flex items-center gap-2">
            <Shield className="w-4 h-4 text-[hsl(var(--leather))]" />
            <span className="text-sm font-bold text-[hsl(var(--leather))]">ADMIN</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <Card className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))] shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-[hsl(var(--brass))]" />
                <CardTitle style={{ fontFamily: 'Georgia, serif' }}>Historical Chart Uploader</CardTitle>
              </div>
              <CardDescription>
                Upload high-resolution historical maps and charts to your collection
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Admin Ingest Component */}
        <AdminIngest />
      </div>
    </div>
  );
};

export default DevTools;
