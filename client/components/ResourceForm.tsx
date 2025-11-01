import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ResourceForm({ onAdded }: { onAdded?: () => void }) {
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !method || !description) return setError("Please complete all fields");
    setLoading(true);
    try {
      await api<{ title: string; method: string; description: string; uploadedBy: string }, any>("/api/resources", {
        method: "POST",
        body: { title, method, description, uploadedBy: "me@school.org" },
      });
      onAdded?.();
      toast({ title: "Resource added", description: "Teaching resource uploaded successfully." });
      setTitle("");
      setMethod("");
      setDescription("");
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
      toast({ title: "Error adding resource", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="E.g., Fraction Tiles Activity" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Method</label>
        <input value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="E.g., Visual Aids" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-md border bg-background px-3 py-2" placeholder="Describe how to implement this technique and for which subjects." />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <button disabled={loading} type="submit" className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">{loading ? "Adding..." : "Add Resource"}</button>
    </form>
  );
}
