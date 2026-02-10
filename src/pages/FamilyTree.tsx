import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Eye, Users, UserPlus, ArrowLeft, TreePine } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TreeVisualization, { type Person } from "@/components/familytree/TreeVisualization";
import FriendCardForm, { type FriendCard } from "@/components/familytree/FriendCardForm";
import FamilyCardForm, { type FamilyCard } from "@/components/familytree/FamilyCardForm";
import CardsViewer from "@/components/familytree/CardsViewer";

const FamilyTree = () => {
  const [gedData, setGedData] = useState<Person[]>([]);
  const [maxGenerations, setMaxGenerations] = useState(5);
  const [friendCards, setFriendCards] = useState<FriendCard[]>([]);
  const [familyCards, setFamilyCards] = useState<FamilyCard[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCardsDialog, setShowCardsDialog] = useState(false);
  const [addType, setAddType] = useState<'family' | 'friend'>('family');
  const [newFriend, setNewFriend] = useState<Partial<FriendCard>>({});
  const [newFamily, setNewFamily] = useState<Partial<FamilyCard>>({});

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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Decorative border */}
      <div className="fixed inset-0 pointer-events-none border-8 border-double opacity-40 z-50"
           style={{ borderColor: 'hsl(var(--brass))' }} />

      {/* Leather Header */}
      <div className="relative border-b-2 border-[hsl(var(--brass))] shadow-lg"
           style={{
             background: 'linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))',
             boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
           }}>
        <div className="px-8 py-6 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-[hsl(var(--parchment))] hover:bg-white/10">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Dashboard
            </Link>
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                          flex items-center justify-center shadow-lg">
            <TreePine className="w-5 h-5 text-[hsl(var(--leather))]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--parchment))] tracking-wide"
              style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Family Tree
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10 max-w-5xl mx-auto">
        {/* Upload Section */}
        <div className="relative p-6 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))] rounded-lg shadow-xl mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="gedcomFile" className="text-lg font-semibold text-foreground"
                     style={{ fontFamily: 'Georgia, serif' }}>
                Upload Your GEDCOM File
              </Label>
              <Input id="gedcomFile" type="file" accept=".ged" onChange={handleFileUpload} className="mt-2 border-[hsl(var(--border))]" />
              <p className="text-sm text-muted-foreground mt-2">Upload a .ged file to visualize up to 5 generations.</p>
            </div>
            <div>
              <Label htmlFor="maxGens" className="font-semibold text-foreground">Number of Generations (max 5):</Label>
              <Input id="maxGens" type="number" min="1" max="5" value={maxGenerations}
                     onChange={(e) => setMaxGenerations(parseInt(e.target.value) || 5)}
                     className="mt-1 w-32 border-[hsl(var(--border))]" />
            </div>
            <div className="flex gap-3 pt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="bg-gradient-to-r from-[hsl(var(--brass))] to-[hsl(var(--gold))] text-[hsl(var(--leather))] font-bold hover:opacity-90 border border-[hsl(var(--leather))]">
                    <Plus className="w-4 h-4 mr-2" />Add Card
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))]">
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
              <Button className="bg-gradient-to-r from-[hsl(var(--leather))] to-[hsl(var(--brass))] text-[hsl(var(--parchment))] font-bold hover:opacity-90"
                      onClick={() => setShowCardsDialog(true)}>
                <Eye className="w-4 h-4 mr-2" />View Family Cards
              </Button>
            </div>
          </div>
          {/* Decorative corners */}
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-40" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-40" />
        </div>

        {/* Stats */}
        {gedData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total People", value: gedData.length },
              { label: "Males", value: gedData.filter(p => p.sex === 'M').length },
              { label: "Females", value: gedData.filter(p => p.sex === 'F').length },
            ].map((stat) => (
              <div key={stat.label} className="relative bg-[hsl(var(--card))] p-4 rounded-lg border-2 border-[hsl(var(--border))] shadow-lg">
                <div className="text-2xl font-bold text-[hsl(var(--brass))]">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-[hsl(var(--brass))] opacity-30" />
              </div>
            ))}
          </div>
        )}

        {/* Tree Visualization */}
        <div className="relative p-6 bg-[hsl(var(--card))] rounded-lg border-2 border-[hsl(var(--brass))] shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
            Family Tree Visualization
          </h2>
          <TreeVisualization gedData={gedData} maxGenerations={maxGenerations} />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-40" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-40" />
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
