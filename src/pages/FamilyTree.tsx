import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Eye, Users, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TreeVisualization, { type Person } from "@/components/familytree/TreeVisualization";
import FriendCardForm, { type FriendCard } from "@/components/familytree/FriendCardForm";
import FamilyCardForm, { type FamilyCard } from "@/components/familytree/FamilyCardForm";
import CardsViewer from "@/components/familytree/CardsViewer";

const FamilyTree = () => {
  const [themeColor, setThemeColor] = useState("#d4eaf7");
  const [gedData, setGedData] = useState<Person[]>([]);
  const [maxGenerations, setMaxGenerations] = useState(5);
  const [friendCards, setFriendCards] = useState<FriendCard[]>([]);
  const [familyCards, setFamilyCards] = useState<FamilyCard[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCardsDialog, setShowCardsDialog] = useState(false);
  const [addType, setAddType] = useState<'family' | 'friend'>('family');
  const [newFriend, setNewFriend] = useState<Partial<FriendCard>>({});
  const [newFamily, setNewFamily] = useState<Partial<FamilyCard>>({});

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const parseGedcom = (content: string): Person[] => {
    const lines = content.split('\n');
    const people: Person[] = [];
    let currentPerson: Partial<Person> | null = null;
    let currentId = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('0 @') && line.includes('@ INDI')) {
        if (currentPerson && currentId) people.push(currentPerson as Person);
        currentId = line.match(/@(.+)@/)?.[1] || '';
        currentPerson = { id: currentId, name: '', sex: 'U', generation: 0 };
      } else if (currentPerson) {
        if (line.startsWith('1 NAME ')) currentPerson.name = line.substring(7).replace(/\//g, '').trim();
        else if (line.startsWith('1 SEX ')) currentPerson.sex = line.substring(6) as 'M' | 'F' | 'U';
        else if (line.startsWith('1 BIRT') && i + 1 < lines.length && lines[i + 1].startsWith('2 DATE ')) currentPerson.birth = lines[i + 1].substring(7);
        else if (line.startsWith('1 DEAT') && i + 1 < lines.length && lines[i + 1].startsWith('2 DATE ')) currentPerson.death = lines[i + 1].substring(7);
      }
    }
    if (currentPerson && currentId) people.push(currentPerson as Person);
    return people;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = parseGedcom(e.target?.result as string);
        setGedData(parsedData.slice(0, 50));
        toast({ title: "GEDCOM file uploaded!", description: `Found ${parsedData.length} people.` });
      } catch { toast({ title: "Error parsing file", variant: "destructive" }); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10" style={{ backgroundColor: themeColor }} />
      <div className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center gap-3" style={{ backgroundColor: themeColor }}>
        <Button variant="ghost" asChild className="mr-4"><Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">← Dashboard</Link></Button>
        <span className="text-4xl">🌳</span> Family Tree
      </div>
      
      <div className="ml-10 mt-9 p-8">
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="gedcomFile" className="text-lg font-semibold">Upload Your GEDCOM File</Label>
                <Input id="gedcomFile" type="file" accept=".ged" onChange={handleFileUpload} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">Upload a .ged file to visualize up to 5 generations.</p>
              </div>
              <div>
                <Label htmlFor="maxGens" className="font-semibold">Number of Generations (max 5):</Label>
                <Input id="maxGens" type="number" min="1" max="5" value={maxGenerations} onChange={(e) => setMaxGenerations(parseInt(e.target.value) || 5)} className="mt-1 w-32" />
              </div>
              <div className="flex gap-3 pt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white"><Plus className="w-4 h-4 mr-2" />Add Card</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { setAddType('family'); setNewFamily({ id: Date.now().toString(), sex: 'U', generation: 0 }); setShowAddDialog(true); }}>
                        <Users className="w-4 h-4 mr-2" />Add Family Member
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { setAddType('friend'); setNewFriend({ id: Date.now().toString() }); setShowAddDialog(true); }}>
                        <UserPlus className="w-4 h-4 mr-2" />Add Friend
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowCardsDialog(true)}>
                  <Eye className="w-4 h-4 mr-2" />View Family Cards
                </Button>
              </div>
            </div>
          </div>

          {gedData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border"><div className="text-2xl font-bold text-primary">{gedData.length}</div><div className="text-sm text-muted-foreground">Total People</div></div>
              <div className="bg-card p-4 rounded-lg border border-border"><div className="text-2xl font-bold text-primary">{gedData.filter(p => p.sex === 'M').length}</div><div className="text-sm text-muted-foreground">Males</div></div>
              <div className="bg-card p-4 rounded-lg border border-border"><div className="text-2xl font-bold text-primary">{gedData.filter(p => p.sex === 'F').length}</div><div className="text-sm text-muted-foreground">Females</div></div>
            </div>
          )}

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Family Tree Visualization</h2>
            <TreeVisualization gedData={gedData} maxGenerations={maxGenerations} />
          </div>
        </div>
      </div>

      <FriendCardForm open={addType === 'friend' && showAddDialog} onOpenChange={(o) => { if (!o) { setShowAddDialog(false); setNewFriend({}); } }}
        newFriend={newFriend} onChange={setNewFriend}
        onSave={() => { if (newFriend.name?.trim()) { setFriendCards([...friendCards, newFriend as FriendCard]); setShowAddDialog(false); setNewFriend({}); toast({ title: "Friend card added!" }); } }}
      />
      <FamilyCardForm open={addType === 'family' && showAddDialog} onOpenChange={(o) => { if (!o) { setShowAddDialog(false); setNewFamily({}); } }}
        newFamily={newFamily} onChange={setNewFamily} gedData={gedData}
        onSave={() => { if (newFamily.name?.trim()) { setFamilyCards([...familyCards, newFamily as FamilyCard]); setShowAddDialog(false); setNewFamily({}); toast({ title: "Family member card added!" }); } }}
      />
      <CardsViewer open={showCardsDialog} onOpenChange={setShowCardsDialog} familyCards={familyCards} friendCards={friendCards} />
    </div>
  );
};

export default FamilyTree;
