import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [userName, setUserName] = useState<string>("");
  const [cityState, setCityState] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [secondaryEmail, setSecondaryEmail] = useState<string>("");

  useEffect(() => {
    // Load profile data
    setUserName(localStorage.getItem("username") || "");
    setCityState(localStorage.getItem("cityState") || "");
    setSecondaryEmail(localStorage.getItem("secondaryEmail") || "");
    
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
    
    // Load user email from Supabase
    const loadUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    loadUserEmail();
  }, []);

  const saveProfile = async () => {
    localStorage.setItem("username", userName);
    localStorage.setItem("cityState", cityState);
    localStorage.setItem("secondaryEmail", secondaryEmail);
    
    // Update secondary email in Supabase profile if needed
    if (secondaryEmail) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          user_id: user.id,
          secondary_email: secondaryEmail
        });
      }
    }
    
    toast({
      title: "Profile saved!",
      description: "Your profile has been updated successfully.",
    });
  };

  const resetProfile = () => {
    if (confirm("Reset profile information?")) {
      localStorage.removeItem("username");
      localStorage.removeItem("cityState");
      localStorage.removeItem("secondaryEmail");
      
      setUserName("");
      setCityState("");
      setSecondaryEmail("");
      
      toast({
        title: "Profile reset",
        description: "Profile information has been cleared.",
      });
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
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4"
        style={{ backgroundColor: themeColor }}
      >
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
            ← Dashboard
          </Link>
        </Button>
        Profile
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8 space-y-8">
        {/* Account Info Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold">Account Information</h2>
          {userEmail && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <Label className="font-semibold text-sm">Registered Email:</Label>
              <p className="text-lg mt-1">{userEmail}</p>
            </div>
          )}
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <div>
            <Label htmlFor="userName" className="font-semibold">Your Name:</Label>
            <Input 
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg mt-1"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label htmlFor="cityState" className="font-semibold">City / State:</Label>
            <Input 
              id="cityState"
              type="text"
              value={cityState}
              onChange={(e) => setCityState(e.target.value)}
              className="text-lg mt-1"
              placeholder="e.g., Boston, MA"
            />
          </div>
          <div>
            <Label htmlFor="secondaryEmail" className="font-semibold">Recovery Email (Optional):</Label>
            <Input 
              id="secondaryEmail"
              type="email"
              value={secondaryEmail}
              onChange={(e) => setSecondaryEmail(e.target.value)}
              className="text-lg mt-1"
              placeholder="Secondary recovery email"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Used for account recovery and important notifications
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={saveProfile}>
            💾 Save Profile
          </Button>
          <Button onClick={resetProfile} variant="outline">
            ♻️ Reset Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;