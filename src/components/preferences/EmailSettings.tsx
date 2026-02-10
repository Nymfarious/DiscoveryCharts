import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface EmailSettingsProps {
  emails: string[];
  selectedEmails: string[];
  newEmail: string;
  onNewEmailChange: (value: string) => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
  onToggleEmail: (email: string) => void;
}

export default function EmailSettings({
  emails, selectedEmails, newEmail,
  onNewEmailChange, onAddEmail, onRemoveEmail, onToggleEmail
}: EmailSettingsProps) {
  return (
    <Card className="border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Email Management</CardTitle>
            <CardDescription>Manage your email addresses</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Add New Email</Label>
          <div className="flex gap-2">
            <Input 
              type="email"
              value={newEmail}
              onChange={(e) => onNewEmailChange(e.target.value)}
              placeholder="Enter email address"
              className="flex-1"
            />
            <Button onClick={onAddEmail} variant="default" size="sm">Add</Button>
          </div>
        </div>

        {emails.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">Your Emails</Label>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {emails.length > 1 && (
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email)}
                          onChange={() => onToggleEmail(email)}
                          className="rounded border-border"
                        />
                      )}
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button onClick={() => onRemoveEmail(email)} variant="ghost" size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {emails.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {selectedEmails.length} of {emails.length} email{emails.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
