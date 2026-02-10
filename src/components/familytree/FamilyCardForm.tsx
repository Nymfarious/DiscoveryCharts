import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Person } from "./TreeVisualization";

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

interface FamilyCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFamily: Partial<FamilyCard>;
  onChange: (family: Partial<FamilyCard>) => void;
  onSave: () => void;
  gedData: Person[];
}

export default function FamilyCardForm({ open, onOpenChange, newFamily, onChange, onSave, gedData }: FamilyCardFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Family Member Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-auto max-h-[60vh] pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="familyName">Name *</Label>
              <Input id="familyName" value={newFamily.name || ''} onChange={(e) => onChange({ ...newFamily, name: e.target.value })} placeholder="Enter family member's name" />
            </div>
            <div>
              <Label>Gender</Label>
              <RadioGroup value={newFamily.sex} onValueChange={(value) => onChange({ ...newFamily, sex: value as 'M' | 'F' | 'U' })}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="M" id="fm-male" /><Label htmlFor="fm-male">Male</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="F" id="fm-female" /><Label htmlFor="fm-female">Female</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="U" id="fm-unknown" /><Label htmlFor="fm-unknown">Unspecified</Label></div>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="familyAddress">Address</Label>
              <Input id="familyAddress" value={newFamily.address || ''} onChange={(e) => onChange({ ...newFamily, address: e.target.value })} placeholder="Enter address" />
            </div>
            <div>
              <Label htmlFor="familyCity">City</Label>
              <Input id="familyCity" value={newFamily.city || ''} onChange={(e) => onChange({ ...newFamily, city: e.target.value })} placeholder="Enter city" />
            </div>
            <div>
              <Label htmlFor="familyState">State</Label>
              <Input id="familyState" value={newFamily.state || ''} onChange={(e) => onChange({ ...newFamily, state: e.target.value })} placeholder="Enter state" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="familyBirth">Birth Date</Label>
              <Input id="familyBirth" value={newFamily.birth || ''} onChange={(e) => onChange({ ...newFamily, birth: e.target.value })} placeholder="e.g., 1980-05-15" />
            </div>
            <div>
              <Label htmlFor="familyAnniversary">Anniversary</Label>
              <Input id="familyAnniversary" type="date" value={newFamily.anniversary || ''} onChange={(e) => onChange({ ...newFamily, anniversary: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="familyNestUnder">Nest Under (Family Tree Position)</Label>
            <select id="familyNestUnder" value={newFamily.nestUnder || ''} onChange={(e) => onChange({ ...newFamily, nestUnder: e.target.value })} className="w-full p-2 border border-border rounded-md">
              <option value="">Select parent/spouse (optional)</option>
              {gedData.map((person) => (
                <option key={person.id} value={person.id}>{person.name} (ID: {person.id})</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="familyNotes">Notes</Label>
            <Textarea id="familyNotes" value={newFamily.notes || ''} onChange={(e) => onChange({ ...newFamily, notes: e.target.value })} placeholder="Any additional notes" rows={3} />
          </div>
          <div>
            <Label htmlFor="familyPhoto">Upload Photo</Label>
            <Input id="familyPhoto" type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => onChange({ ...newFamily, photo: reader.result as string });
                reader.readAsDataURL(file);
              }
            }} />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={!newFamily.name?.trim()}>Complete Card Creation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FamilyCard };
