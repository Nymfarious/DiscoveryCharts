import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FriendCard } from "./FriendCardForm";
import type { FamilyCard } from "./FamilyCardForm";

interface CardsViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyCards: FamilyCard[];
  friendCards: FriendCard[];
}

export default function CardsViewer({ open, onOpenChange, familyCards, friendCards }: CardsViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                        {member.photo && <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover" />}
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {member.birth && `Born: ${member.birth}`} • {member.sex === 'M' ? ' Male' : member.sex === 'F' ? ' Female' : ' Gender not specified'}
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
                        {friend.photo && <img src={friend.photo} alt={friend.name} className="w-16 h-16 rounded-full object-cover" />}
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
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
