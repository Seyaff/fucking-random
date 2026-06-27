"use client";

import { useState } from "react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import type { Template, TemplateStatus, TemplateCategory } from "@/services/template.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, FileText, Plus, Pencil, Trash2 } from "lucide-react";

const STATUS_COLORS: Record<TemplateStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function TemplatesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "">("");

  const { data, isLoading } = useTemplates(page, statusFilter || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground">WhatsApp message templates</p>
        </div>
        <CreateTemplateDialog />
      </div>

      <div className="flex gap-2">
        {(["", "draft", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No templates yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create your first WhatsApp message template above</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Language</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Buttons</th>
                <th className="py-3 px-4 font-medium">Created</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.templates.map((t) => (
                <tr key={t._id} className="text-sm hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{t.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground uppercase text-xs">{t.language}</td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs ${STATUS_COLORS[t.status]}`} variant="outline">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{t.buttons.length}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <EditTemplateDialog template={t} />
                      <DeleteTemplateButton id={t._id} name={t.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>Page {page} of {data.totalPages} ({data.total} total)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="px-3 py-1 rounded border text-xs disabled:opacity-40 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("MARKETING");
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState("en");
  const { mutate: create, isPending } = useCreateTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { name, category, body, language },
      { onSuccess: () => { setOpen(false); setName(""); setCategory("MARKETING"); setBody(""); setLanguage("en"); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4 mr-1" /> New Template</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body *</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y"
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
            Create Template
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTemplateDialog({ template }: { template: Template }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [body, setBody] = useState(template.body);
  const [language, setLanguage] = useState(template.language);
  const { mutate: update, isPending } = useUpdateTemplate(template._id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      { name, category, body, language },
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
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-language">Language</Label>
            <Input id="edit-language" value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-body">Body *</Label>
            <textarea
              id="edit-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y"
            />
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

function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: remove, isPending } = useDeleteTemplate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
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
