import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface FriendCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFriend: Partial<FriendCard>;
  onChange: (friend: Partial<FriendCard>) => void;
  onSave: () => void;
}

export default function FriendCardForm({ open, onOpenChange, newFriend, onChange, onSave }: FriendCardFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Friend Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-auto max-h-[60vh] pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="friendName">Name *</Label>
              <Input id="friendName" value={newFriend.name || ''} onChange={(e) => onChange({ ...newFriend, name: e.target.value })} placeholder="Enter friend's name" />
            </div>
            <div>
              <Label htmlFor="friendAddress">Address</Label>
              <Input id="friendAddress" value={newFriend.address || ''} onChange={(e) => onChange({ ...newFriend, address: e.target.value })} placeholder="Enter address" />
            </div>
            <div>
              <Label htmlFor="friendCity">City</Label>
              <Input id="friendCity" value={newFriend.city || ''} onChange={(e) => onChange({ ...newFriend, city: e.target.value })} placeholder="Enter city" />
            </div>
            <div>
              <Label htmlFor="friendState">State</Label>
              <Input id="friendState" value={newFriend.state || ''} onChange={(e) => onChange({ ...newFriend, state: e.target.value })} placeholder="Enter state" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="friendBirthdate">Birthdate</Label>
              <Input id="friendBirthdate" type="date" value={newFriend.birthdate || ''} onChange={(e) => onChange({ ...newFriend, birthdate: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="friendAnniversary">Anniversary</Label>
              <Input id="friendAnniversary" type="date" value={newFriend.anniversary || ''} onChange={(e) => onChange({ ...newFriend, anniversary: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="friendSpecialDates">Special Dates</Label>
            <Input id="friendSpecialDates" value={newFriend.specialDates || ''} onChange={(e) => onChange({ ...newFriend, specialDates: e.target.value })} placeholder="e.g., Graduation: 2020-05-15" />
          </div>
          <div>
            <Label htmlFor="friendNotes">Notes</Label>
            <Textarea id="friendNotes" value={newFriend.notes || ''} onChange={(e) => onChange({ ...newFriend, notes: e.target.value })} placeholder="Any additional notes" rows={3} />
          </div>
          <div>
            <Label htmlFor="friendSummary">Summary</Label>
            <Textarea id="friendSummary" value={newFriend.summary || ''} onChange={(e) => onChange({ ...newFriend, summary: e.target.value })} placeholder="Brief summary about this person" rows={2} />
          </div>
          <div>
            <Label htmlFor="friendPhoto">Upload Photo</Label>
            <Input id="friendPhoto" type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => onChange({ ...newFriend, photo: reader.result as string });
                reader.readAsDataURL(file);
              }
            }} />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={!newFriend.name?.trim()}>Complete Card Creation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FriendCard };
