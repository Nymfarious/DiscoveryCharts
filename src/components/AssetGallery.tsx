import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  created_at: string;
};

interface AssetGalleryProps {
  onSelect?: (id: string) => void;
}

const AssetGallery = ({ onSelect }: AssetGalleryProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('map_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error: any) {
      console.error('Error loading assets:', error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from('tiles').getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="border-2 border-dashed border-[hsl(var(--brass))]/30 p-12">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No images uploaded yet</p>
          <p className="text-sm mt-1">Upload your first image using the Upload Images tab</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          className="group cursor-pointer overflow-hidden border-2 border-[hsl(var(--brass))]/20 hover:border-[hsl(var(--brass))] transition-all"
          onClick={() => onSelect?.(asset.id)}
        >
          <CardContent className="p-0">
            <div className="aspect-square overflow-hidden bg-[hsl(var(--muted))]">
              <img
                src={getImageUrl(asset.file_path)}
                alt={asset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{asset.title}</h3>
              {asset.description && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {asset.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AssetGallery;
