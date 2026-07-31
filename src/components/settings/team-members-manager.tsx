"use client";

import * as React from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideOver } from "@/components/shared/slide-over";
import { saveUser, setUserArchived } from "@/lib/actions/users";
import { PAGE_KEYS, PAGE_LABELS, type PageKey } from "@/lib/page-access";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
  allowedPages: string[];
  archived: boolean;
}

function TeamMembersManager({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamMember | null>(null);

  async function toggleArchive(m: TeamMember) {
    const result = await setUserArchived(m.id, !m.archived);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(m.archived ? "Team member reactivated" : "Team member deactivated");
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus /> Add team member
        </Button>
      </div>
      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditing(m);
                  setOpen(true);
                }}
                className={m.archived ? "text-muted-foreground line-through" : "text-left text-foreground hover:underline"}
              >
                <div>{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </button>
              <div className="flex items-center gap-2">
                <Badge variant={m.role === "OWNER" ? "primary" : "outline"}>{m.role === "OWNER" ? "Owner" : "Member"}</Badge>
                {m.archived && <Badge variant="outline">Deactivated</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={m.id === currentUserId}
                  title={m.id === currentUserId ? "You can't deactivate your own account" : undefined}
                  onClick={() => toggleArchive(m)}
                >
                  {m.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
              </div>
            </li>
          ))}
          {members.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No team members yet</li>}
        </ul>
      </div>

      <TeamMemberForm open={open} onOpenChange={setOpen} member={editing} />
    </div>
  );
}

function TeamMemberForm({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}) {
  const [name, setName] = React.useState(member?.name ?? "");
  const [email, setEmail] = React.useState(member?.email ?? "");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"OWNER" | "MEMBER">(member?.role ?? "MEMBER");
  const [allowedPages, setAllowedPages] = React.useState<Set<string>>(new Set(member?.allowedPages ?? []));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(member?.name ?? "");
      setEmail(member?.email ?? "");
      setPassword("");
      setRole(member?.role ?? "MEMBER");
      setAllowedPages(new Set(member?.allowedPages ?? []));
      setError(null);
    }
  }, [open, member]);

  function togglePage(key: PageKey) {
    setAllowedPages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveUser({
      id: member?.id,
      name,
      email,
      password: password || undefined,
      role,
      allowedPages: [...allowedPages],
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(member ? "Team member updated" : "Team member added");
    onOpenChange(false);
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      title={member ? "Edit team member" : "Add team member"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="team-member-form" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="team-member-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tm-name">Name</Label>
          <Input id="tm-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tm-email">Email</Label>
          <Input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tm-password">{member ? "New password (optional)" : "Password"}</Label>
          <Input
            id="tm-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={member ? "Leave blank to keep current password" : "At least 8 characters"}
            required={!member}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tm-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as "OWNER" | "MEMBER")}>
            <SelectTrigger id="tm-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {role === "OWNER" ? (
          <p className="rounded-md bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            Owners always have access to every page, including Settings and Team members.
          </p>
        ) : (
          <div className="space-y-1.5">
            <Label>Pages this member can access</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              {PAGE_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={allowedPages.has(key)} onCheckedChange={() => togglePage(key)} />
                  {PAGE_LABELS[key]}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </SlideOver>
  );
}

export { TeamMembersManager };
