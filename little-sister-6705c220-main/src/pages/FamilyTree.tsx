import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Eye, Users, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Person {
  id: string;
  name: string;
  birth?: string;
  death?: string;
  sex: 'M' | 'F' | 'U';
  fatherId?: string;
  motherId?: string;
  generation: number;
}

interface FriendCard {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  birthdate?: string;
  anniversary?: string;
  specialDates?: string;
  notes?: string;
  summary?: string;
  photo?: string;
}

interface FamilyCard extends Person {
  address?: string;
  city?: string;
  state?: string;
  anniversary?: string;
  specialDates?: string;
  notes?: string;
  summary?: string;
  photo?: string;
  nestUnder?: string;
}

const FamilyTree = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
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
        // Save previous person
        if (currentPerson && currentId) {
          people.push(currentPerson as Person);
        }
        
        // Start new person
        currentId = line.match(/@(.+)@/)?.[1] || '';
        currentPerson = {
          id: currentId,
          name: '',
          sex: 'U',
          generation: 0
        };
      } else if (currentPerson) {
        if (line.startsWith('1 NAME ')) {
          currentPerson.name = line.substring(7).replace(/\//g, '').trim();
        } else if (line.startsWith('1 SEX ')) {
          currentPerson.sex = line.substring(6) as 'M' | 'F' | 'U';
        } else if (line.startsWith('1 BIRT')) {
          // Look for date in next lines
          if (i + 1 < lines.length && lines[i + 1].startsWith('2 DATE ')) {
            currentPerson.birth = lines[i + 1].substring(7);
          }
        } else if (line.startsWith('1 DEAT')) {
          if (i + 1 < lines.length && lines[i + 1].startsWith('2 DATE ')) {
            currentPerson.death = lines[i + 1].substring(7);
          }
        } else if (line.startsWith('1 FAMC @')) {
          // Family as child - we'll process this later
        }
      }
    }

    // Save last person
    if (currentPerson && currentId) {
      people.push(currentPerson as Person);
    }

    return people;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedData = parseGedcom(content);
        setGedData(parsedData.slice(0, 50)); // Limit to 50 people for visualization
        
        toast({
          title: "GEDCOM file uploaded!",
          description: `Found ${parsedData.length} people in your family tree.`,
        });
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "Please check that your file is a valid GEDCOM format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const renderFamilyTree = () => {
    if (gedData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Upload a GEDCOM file to see your family tree visualization
        </div>
      );
    }

    return (
      <div className="family-tree-container">
        <svg width="800" height="600" className="border border-border rounded-lg bg-card">
          {/* Simple tree visualization */}
          {gedData.slice(0, 20).map((person, index) => {
            const x = 50 + (index % 8) * 90;
            const y = 50 + Math.floor(index / 8) * 100;
            
            return (
              <g key={person.id}>
                {/* Person node */}
                <circle
                  cx={x}
                  cy={y}
                  r="25"
                  fill={person.sex === 'M' ? '#3B82F6' : person.sex === 'F' ? '#EC4899' : '#6B7280'}
                  stroke="#fff"
                  strokeWidth="2"
                />
                
                {/* Name label */}
                <text
                  x={x}
                  y={y + 45}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="font-medium"
                >
                  {person.name.split(' ')[0] || 'Unknown'}
                </text>
                
                {/* Birth year */}
                {person.birth && (
                  <text
                    x={x}
                    y={y + 58}
                    textAnchor="middle"
                    fontSize="8"
                    fill="currentColor"
                    className="opacity-70"
                  >
                    {person.birth.match(/\d{4}/)?.[0] || ''}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(650, 50)">
            <text x="0" y="0" fontSize="12" fontWeight="bold" fill="currentColor">Legend:</text>
            <circle cx="10" cy="20" r="8" fill="#3B82F6" />
            <text x="25" y="25" fontSize="10" fill="currentColor">Male</text>
            <circle cx="10" cy="40" r="8" fill="#EC4899" />
            <text x="25" y="45" fontSize="10" fill="currentColor">Female</text>
            <circle cx="10" cy="60" r="8" fill="#6B7280" />
            <text x="25" y="65" fontSize="10" fill="currentColor">Unknown</text>
          </g>
        </svg>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {Math.min(gedData.length, 20)} of {gedData.length} family members (up to {maxGenerations} generations)
        </div>
      </div>
    );
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
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center gap-3"
        style={{ backgroundColor: themeColor }}
      >
        <Button variant="ghost" asChild className="mr-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
            ← Dashboard
          </Link>
        </Button>
        <span className="text-4xl">🌳</span>
        Family Tree
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="gedcomFile" className="text-lg font-semibold">
                  Upload Your GEDCOM File
                </Label>
                <Input 
                  id="gedcomFile"
                  type="file"
                  accept=".ged"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a .ged file to visualize up to 5 generations of your family tree. 
                  GEDCOM files can be exported from most genealogy software.
                </p>
              </div>
              
              <div>
                <Label htmlFor="maxGens" className="font-semibold">Number of Generations (max 5):</Label>
                <Input 
                  id="maxGens"
                  type="number"
                  min="1"
                  max="5"
                  value={maxGenerations}
                  onChange={(e) => setMaxGenerations(parseInt(e.target.value) || 5)}
                  className="mt-1 w-32"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          setAddType('family');
                          setNewFamily({ id: Date.now().toString(), sex: 'U', generation: 0 });
                          setShowAddDialog(true);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Add Family Member Card
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          setAddType('friend');
                          setNewFriend({ id: Date.now().toString() });
                          setShowAddDialog(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend Card
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowCardsDialog(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Family Cards
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {gedData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary">{gedData.length}</div>
                <div className="text-sm text-muted-foreground">Total People</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary">
                  {gedData.filter(p => p.sex === 'M').length}
                </div>
                <div className="text-sm text-muted-foreground">Males</div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary">
                  {gedData.filter(p => p.sex === 'F').length}
                </div>
                <div className="text-sm text-muted-foreground">Females</div>
              </div>
            </div>
          )}

          {/* Family Tree Visualization */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Family Tree Visualization</h2>
            {renderFamilyTree()}
          </div>
        </div>
      </div>

      {/* Add Dialog - Now goes directly to form */}

      {/* Add Friend Form Dialog */}
      <Dialog open={addType === 'friend' && showAddDialog} onOpenChange={() => {
        setShowAddDialog(false);
        setNewFriend({});
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Friend Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="friendName">Name *</Label>
                <Input
                  id="friendName"
                  value={newFriend.name || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                  placeholder="Enter friend's name"
                />
              </div>
              
              <div>
                <Label htmlFor="friendAddress">Address</Label>
                <Input
                  id="friendAddress"
                  value={newFriend.address || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <Label htmlFor="friendCity">City</Label>
                <Input
                  id="friendCity"
                  value={newFriend.city || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <Label htmlFor="friendState">State</Label>
                <Input
                  id="friendState"
                  value={newFriend.state || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="friendBirthdate">Birthdate</Label>
                <Input
                  id="friendBirthdate"
                  type="date"
                  value={newFriend.birthdate || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, birthdate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="friendAnniversary">Anniversary</Label>
                <Input
                  id="friendAnniversary"
                  type="date"
                  value={newFriend.anniversary || ''}
                  onChange={(e) => setNewFriend({ ...newFriend, anniversary: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="friendSpecialDates">Special Dates</Label>
              <Input
                id="friendSpecialDates"
                value={newFriend.specialDates || ''}
                onChange={(e) => setNewFriend({ ...newFriend, specialDates: e.target.value })}
                placeholder="e.g., Graduation: 2020-05-15"
              />
            </div>
            <div>
              <Label htmlFor="friendNotes">Notes</Label>
              <Textarea
                id="friendNotes"
                value={newFriend.notes || ''}
                onChange={(e) => setNewFriend({ ...newFriend, notes: e.target.value })}
                placeholder="Any additional notes"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="friendSummary">Summary</Label>
              <Textarea
                id="friendSummary"
                value={newFriend.summary || ''}
                onChange={(e) => setNewFriend({ ...newFriend, summary: e.target.value })}
                placeholder="Brief summary about this person"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="friendPhoto">Upload Photo</Label>
              <Input
                id="friendPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setNewFriend({ ...newFriend, photo: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setNewFriend({});
              setShowAddDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newFriend.name?.trim()) {
                  setFriendCards([...friendCards, newFriend as FriendCard]);
                  setShowAddDialog(false);
                  setNewFriend({});
                  toast({
                    title: "Friend card added!",
                    description: `${newFriend.name} has been added to your friend cards.`,
                  });
                }
              }}
              disabled={!newFriend.name?.trim()}
            >
              Complete Card Creation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Family Form Dialog */}
      <Dialog open={addType === 'family' && showAddDialog} onOpenChange={() => {
        setShowAddDialog(false);
        setNewFamily({});
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Family Member Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyName">Name *</Label>
                <Input
                  id="familyName"
                  value={newFamily.name || ''}
                  onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                  placeholder="Enter family member's name"
                />
              </div>
              
              <div>
                <Label htmlFor="familySex">Gender</Label>
                <RadioGroup value={newFamily.sex} onValueChange={(value) => setNewFamily({ ...newFamily, sex: value as 'M' | 'F' | 'U' })}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="M" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="F" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="U" id="unknown" />
                      <Label htmlFor="unknown">Unspecified</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="familyAddress">Address</Label>
                <Input
                  id="familyAddress"
                  value={newFamily.address || ''}
                  onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <Label htmlFor="familyCity">City</Label>
                <Input
                  id="familyCity"
                  value={newFamily.city || ''}
                  onChange={(e) => setNewFamily({ ...newFamily, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              
              <div>
                <Label htmlFor="familyState">State</Label>
                <Input
                  id="familyState"
                  value={newFamily.state || ''}
                  onChange={(e) => setNewFamily({ ...newFamily, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyBirth">Birth Date</Label>
                <Input
                  id="familyBirth"
                  value={newFamily.birth || ''}
                  onChange={(e) => setNewFamily({ ...newFamily, birth: e.target.value })}
                  placeholder="e.g., 1980-05-15"
                />
              </div>
              <div>
                <Label htmlFor="familySex">Gender</Label>
                <RadioGroup value={newFamily.sex} onValueChange={(value) => setNewFamily({ ...newFamily, sex: value as 'M' | 'F' | 'U' })}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="M" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="F" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="U" id="unknown" />
                    <Label htmlFor="unknown">Unspecified</Label>
                  </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div>
              <Label htmlFor="familyAddress">Address</Label>
              <Input
                id="familyAddress"
                value={newFamily.address || ''}
                onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div>
              <Label htmlFor="familyAnniversary">Anniversary</Label>
              <Input
                id="familyAnniversary"
                type="date"
                value={newFamily.anniversary || ''}
                onChange={(e) => setNewFamily({ ...newFamily, anniversary: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="familyNestUnder">Nest Under (Family Tree Position)</Label>
              <select
                id="familyNestUnder"
                value={newFamily.nestUnder || ''}
                onChange={(e) => setNewFamily({ ...newFamily, nestUnder: e.target.value })}
                className="w-full p-2 border border-border rounded-md"
              >
                <option value="">Select parent/spouse (optional)</option>
                {gedData.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} (ID: {person.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="familyNotes">Notes</Label>
              <Textarea
                id="familyNotes"
                value={newFamily.notes || ''}
                onChange={(e) => setNewFamily({ ...newFamily, notes: e.target.value })}
                placeholder="Any additional notes"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="familyPhoto">Upload Photo</Label>
              <Input
                id="familyPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setNewFamily({ ...newFamily, photo: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setNewFamily({});
              setShowAddDialog(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newFamily.name?.trim()) {
                  setFamilyCards([...familyCards, newFamily as FamilyCard]);
                  setShowAddDialog(false);
                  setNewFamily({});
                  toast({
                    title: "Family member card added!",
                    description: `${newFamily.name} has been added to your family cards.`,
                  });
                }
              }}
              disabled={!newFamily.name?.trim()}
            >
              Complete Card Creation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Family Cards Dialog */}
      <Dialog open={showCardsDialog} onOpenChange={setShowCardsDialog}>
        <DialogContent className="max-w-4xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Family Cards</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[400px]">
            <div className="space-y-6">
              {familyCards.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Family Members</h3>
                  <div className="grid gap-4">
                    {familyCards.map((member) => (
                      <div key={member.id} className="border border-border rounded-lg p-4">
                        <div className="flex gap-4">
                          {member.photo && (
                            <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.birth && `Born: ${member.birth}`} • 
                              {member.sex === 'M' ? ' Male' : member.sex === 'F' ? ' Female' : ' Gender not specified'}
                            </p>
                            {member.address && <p className="text-sm">📍 {member.address}</p>}
                            {member.anniversary && <p className="text-sm">💍 Anniversary: {member.anniversary}</p>}
                            {member.summary && <p className="text-sm mt-2">{member.summary}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {friendCards.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Friends</h3>
                  <div className="grid gap-4">
                    {friendCards.map((friend) => (
                      <div key={friend.id} className="border border-border rounded-lg p-4">
                        <div className="flex gap-4">
                          {friend.photo && (
                            <img src={friend.photo} alt={friend.name} className="w-16 h-16 rounded-full object-cover" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{friend.name}</h4>
                            {friend.address && <p className="text-sm">📍 {friend.address}</p>}
                            {friend.birthdate && <p className="text-sm">🎂 Birthday: {friend.birthdate}</p>}
                            {friend.anniversary && <p className="text-sm">💍 Anniversary: {friend.anniversary}</p>}
                            {friend.summary && <p className="text-sm mt-2">{friend.summary}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {familyCards.length === 0 && friendCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No family or friend cards added yet. Use the "Add Card" button to get started!
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowCardsDialog(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyTree;