import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Upload, Download, LogOut, Cloud } from "lucide-react";
import { toast } from "sonner";
import PosterPicker from "@/components/PosterPicker";

const History = () => {
  const [themeColor] = useState<string>("#d4eaf7");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [credit, setCredit] = useState('© Demo — Not for distribution');
  const [status, setStatus] = useState<'demo_only' | 'licensed' | 'public_domain'>('demo_only');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Cloud download state
  const [cloudUrl, setCloudUrl] = useState('');
  const [cloudTitle, setCloudTitle] = useState('');
  const [cloudCredit, setCloudCredit] = useState('');
  const [cloudStatus, setCloudStatus] = useState<'demo_only' | 'licensed' | 'public_domain'>('demo_only');
  const [cloudLoading, setCloudLoading] = useState(false);
  
  // Refresh trigger for poster list
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!roles);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  function handleOpenPoster(posterId: string) {
    navigate(`/history/view?id=${posterId}`);
  }

  async function handleLocalUpload() {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploadLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));

      const { data, error } = await supabase.functions.invoke('ingestPoster', {
        body: {
          title: title.trim(),
          credit: credit.trim() || null,
          license_status: status,
          filename: file.name,
          bytes,
        },
      });

      if (error) throw error;

      toast.success('Map uploaded successfully!');
      setFile(null);
      setTitle('');
      setCredit('© Demo — Not for distribution');
      setStatus('demo_only');
      setRefreshKey(prev => prev + 1);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload map');
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleCloudDownload() {
    if (!cloudUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (!cloudTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setCloudLoading(true);
    try {
      // Fetch the image from the URL
      const response = await fetch(cloudUrl);
      if (!response.ok) throw new Error('Failed to fetch image from URL');
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));
      
      // Extract filename from URL or use a default
      const urlParts = cloudUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'downloaded-map.jpg';

      const { data, error } = await supabase.functions.invoke('ingestPoster', {
        body: {
          title: cloudTitle.trim(),
          credit: cloudCredit.trim() || null,
          license_status: cloudStatus,
          filename,
          bytes,
        },
      });

      if (error) throw error;

      toast.success('Map downloaded and imported successfully!');
      setCloudUrl('');
      setCloudTitle('');
      setCloudCredit('');
      setCloudStatus('demo_only');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Cloud download error:', error);
      toast.error(error.message || 'Failed to download map from cloud');
    } finally {
      setCloudLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10"
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Header */}
      <div 
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center justify-between border-b border-border"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="mr-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
              ← Dashboard
            </Link>
          </Button>
          <MapPin className="w-6 h-6" />
          History Discovery — Library
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" asChild size="sm">
              <Link to="/admin/ingest" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ingest
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8 ml-4 max-w-5xl mx-auto">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Library
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Local Upload
                </TabsTrigger>
                <TabsTrigger value="cloud" className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Cloud Download
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Map Collection</CardTitle>
                <CardDescription>Browse and view historical maps</CardDescription>
              </CardHeader>
              <CardContent>
                <PosterPicker key={refreshKey} onOpen={handleOpenPoster} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          {isAdmin && (
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <CardTitle>Upload Local File</CardTitle>
                  </div>
                  <CardDescription>
                    Import high-resolution historical maps from your computer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="upload-title">Title *</Label>
                    <Input
                      id="upload-title"
                      placeholder="e.g., Medieval Europe Trade Routes"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-credit">Credit / Attribution</Label>
                    <Input
                      id="upload-credit"
                      placeholder="© Source — License info"
                      value={credit}
                      onChange={(e) => setCredit(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-license">License Status *</Label>
                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                      <SelectTrigger id="upload-license">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo_only">Demo Only</SelectItem>
                        <SelectItem value="licensed">Licensed</SelectItem>
                        <SelectItem value="public_domain">Public Domain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-file">Image File *</Label>
                    <Input
                      id="upload-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleLocalUpload}
                    disabled={uploadLoading || !file || !title.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Map'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Cloud Download Tab */}
          {isAdmin && (
            <TabsContent value="cloud">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    <CardTitle>Download from Cloud</CardTitle>
                  </div>
                  <CardDescription>
                    Import maps from web URLs (e.g., Wikipedia, archive.org, library collections)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cloud-url">Image URL *</Label>
                    <Input
                      id="cloud-url"
                      type="url"
                      placeholder="https://example.com/map.jpg"
                      value={cloudUrl}
                      onChange={(e) => setCloudUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct link to the image file
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud-title">Title *</Label>
                    <Input
                      id="cloud-title"
                      placeholder="e.g., Ancient Rome City Plan"
                      value={cloudTitle}
                      onChange={(e) => setCloudTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud-credit">Credit / Attribution</Label>
                    <Input
                      id="cloud-credit"
                      placeholder="© Source — License info"
                      value={cloudCredit}
                      onChange={(e) => setCloudCredit(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud-license">License Status *</Label>
                    <Select value={cloudStatus} onValueChange={(v: any) => setCloudStatus(v)}>
                      <SelectTrigger id="cloud-license">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo_only">Demo Only</SelectItem>
                        <SelectItem value="licensed">Licensed</SelectItem>
                        <SelectItem value="public_domain">Public Domain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCloudDownload}
                    disabled={cloudLoading || !cloudUrl.trim() || !cloudTitle.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {cloudLoading ? 'Downloading...' : 'Download & Import'}
                  </Button>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-medium">Suggested Sources:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Wikimedia Commons (public domain)</li>
                      <li>Library of Congress Collections</li>
                      <li>Internet Archive</li>
                      <li>British Library Collections</li>
                      <li>David Rumsey Map Collection</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default History;
