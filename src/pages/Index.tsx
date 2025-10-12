import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [username, setUsername] = useState<string>("");
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [proveItEnabled, setProveItEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Load user preferences from localStorage
    const name = localStorage.getItem("username") || "";
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    const proveIt = localStorage.getItem("proveItEnabled") === "true";
    
    setUsername(name);
    setThemeColor(color);
    setProveItEnabled(proveIt);
    
    // Apply theme color to CSS variables
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const navigationItems = [
    { href: "/history", icon: "📜", title: "History", description: "View History" },
    { href: "/chat", icon: "💬", title: "Chat With Me", description: "Conversation" },
    { href: "/settings", icon: "⚙️", title: "Settings", description: "Settings & Configuration", submenu: [
      { href: "/preferences", title: "Preferences" },
      { href: "/profile", title: "Profile" }
    ]},
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10 transition-colors duration-500"
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Header */}
      <div 
        className="w-full opacity-92 p-6 pl-12 text-foreground text-2xl font-bold ml-4 border-b border-border tracking-wide min-h-[60px] flex items-center"
        style={{ backgroundColor: themeColor }}
      >
        Historical Discoveries
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-10 p-10">
        <div className="text-2xl text-foreground font-bold tracking-wide mb-6">
          {username ? `Hi ${username}!` : "Hi!"}
        </div>
        
        <div className="flex flex-wrap gap-6 mt-6">
          {navigationItems.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                to={item.href}
                className="flex flex-col items-center bg-card border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 min-w-[130px] min-h-[100px] text-foreground font-semibold hover:border-primary no-underline"
                title={item.description}
              >
                <span className="text-4xl mb-2">{item.icon}</span>
                <span className="text-lg">{item.title}</span>
              </Link>
              
              {/* Settings submenu */}
              {item.submenu && (
                <div className="absolute left-0 top-full mt-2 bg-card border-2 border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 min-w-[160px]">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      className="block px-4 py-3 text-foreground hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Placeholder for future Tell Me feature */}
          <div className="flex flex-col items-center bg-muted/50 border-2 border-dashed border-border rounded-xl p-6 min-w-[130px] min-h-[100px] text-muted-foreground font-semibold opacity-50 cursor-not-allowed" title="Coming Soon">
            <span className="text-4xl mb-2">🗣️</span>
            <span className="text-lg">Tell Me</span>
            <span className="text-xs mt-1">(Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
