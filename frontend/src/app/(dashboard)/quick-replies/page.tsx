"use client";

import { useState } from "react";
import { useQuickReplies, useCreateQuickReply, useUpdateQuickReply, useDeleteQuickReply } from "@/hooks/use-quick-replies";
import type { QuickReply } from "@/services/quick-reply.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MessagesSquare, Search, Plus, Pencil, Trash2 } from "lucide-react";

export default function QuickRepliesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data, isLoading } = useQuickReplies(categoryFilter || undefined, search || undefined);

  const categories = data?.replies
    ? [...new Set(data.replies.map((r) => r.category))].filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quick Replies</h1>
          <p className="text-sm text-muted-foreground">Pre-written responses for faster replies</p>
        </div>
        <CreateQuickReplyDialog />
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search replies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm max-w-[160px]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.replies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessagesSquare className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No quick replies yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create your first saved reply above</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium">Content</th>
                <th className="py-3 px-4 font-medium">Shortcuts</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Created</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.replies.map((r) => (
                <tr key={r._id} className="text-sm hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{r.title}</td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{r.content}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {r.shortcuts.length === 0 ? (
                        <span className="text-xs italic text-muted-foreground">—</span>
                      ) : (
                        r.shortcuts.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs font-mono">/{s}</Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {r.category ? (
                      <span className="text-xs bg-muted rounded-full px-2 py-0.5">{r.category}</span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <EditQuickReplyDialog reply={r} />
                      <DeleteQuickReplyButton id={r._id} title={r.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateQuickReplyDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shortcuts, setShortcuts] = useState("");
  const [category, setCategory] = useState("");
  const { mutate: create, isPending } = useCreateQuickReply();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        title,
        content,
        shortcuts: shortcuts ? shortcuts.split(",").map((s) => s.trim()) : undefined,
        category: category || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setContent("");
          setShortcuts("");
          setCategory("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4 mr-1" /> New Quick Reply</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Quick Reply</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortcuts">Shortcuts (comma-separated)</Label>
            <Input id="shortcuts" value={shortcuts} onChange={(e) => setShortcuts(e.target.value)} placeholder="greeting, hello" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="general" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditQuickReplyDialog({ reply }: { reply: QuickReply }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(reply.title);
  const [content, setContent] = useState(reply.content);
  const [shortcuts, setShortcuts] = useState(reply.shortcuts.join(", "));
  const [category, setCategory] = useState(reply.category || "");
  const { mutate: update, isPending } = useUpdateQuickReply(reply._id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      {
        title,
        content,
        shortcuts: shortcuts ? shortcuts.split(",").map((s) => s.trim()) : undefined,
        category: category || undefined,
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8"><Pencil className="size-3.5" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quick Reply</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content *</Label>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-shortcuts">Shortcuts (comma-separated)</Label>
            <Input id="edit-shortcuts" value={shortcuts} onChange={(e) => setShortcuts(e.target.value)} placeholder="greeting, hello" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="general" />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteQuickReplyButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: remove, isPending } = useDeleteQuickReply();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Quick Reply</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => remove(id, { onSuccess: () => setOpen(false) })}
          >
            {isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
