import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Profile = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [userName, setUserName] = useState<string>("");
  const [sisterName, setSisterName] = useState<string>("");
  const [proveItEnabled, setProveItEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Load profile data
    setUserName(localStorage.getItem("username") || "");
    setSisterName(localStorage.getItem("sisterName") || "");
    setProveItEnabled(localStorage.getItem("proveItEnabled") === "1");
    
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const saveProfile = () => {
    localStorage.setItem("username", userName);
    localStorage.setItem("sisterName", sisterName);
    localStorage.setItem("proveItEnabled", proveItEnabled ? "1" : "");
    
    toast({
      title: "Profile saved!",
      description: "Your profile has been updated successfully.",
    });
  };

  const resetProfile = () => {
    if (confirm("Reset profile information?")) {
      localStorage.removeItem("username");
      localStorage.removeItem("sisterName");
      localStorage.removeItem("proveItEnabled");
      
      setUserName("");
      setSisterName("");
      setProveItEnabled(false);
      
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
        {/* Basic Info Section */}
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
            <Label htmlFor="sisterName" className="font-semibold">Little Sister's Name:</Label>
            <Input 
              id="sisterName"
              type="text"
              value={sisterName}
              onChange={(e) => setSisterName(e.target.value)}
              className="text-lg mt-1"
              placeholder="Enter little sister's name"
            />
          </div>
        </div>

        {/* Feature Settings */}
        <div className="space-y-6 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold">Feature Settings</h2>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableProveIt"
              checked={proveItEnabled}
              onCheckedChange={(checked) => setProveItEnabled(checked === true)}
            />
            <Label htmlFor="enableProveIt" className="font-semibold">
              Enable Prove It (Fact Checker tab)
            </Label>
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