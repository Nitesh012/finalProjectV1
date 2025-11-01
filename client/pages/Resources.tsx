import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Resources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await api<unknown, any[]>("/api/resources");
      setResources(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !method) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting(true);
      await api(
        "/api/resources",
        {
          method: "POST",
          body: { title, description, method, uploadedBy: "current-user" },
        }
      );
      setTitle("");
      setDescription("");
      setMethod("");
      setError(null);
      await loadResources();
    } catch (err: any) {
      setError(err?.message || "Failed to create resource");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold">Innovative Teaching Resources</h1>
      <p className="mt-2 max-w-prose text-foreground/70">
        Upload and discover strategies, activities, and methods to support diverse learning needs.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-1">
          <h3 className="text-lg font-semibold">Add Resource</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="e.g., Think-Pair-Share"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="Describe the resource..."
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Method/Type</label>
              <input
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="e.g., Collaborative Learning"
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Resource"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold">Available Resources</h3>
          {loading ? (
            <div className="mt-4 text-sm text-foreground/70">Loading resources...</div>
          ) : error ? (
            <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : resources.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {resources.map((resource) => (
                <div key={resource._id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <h4 className="font-semibold">{resource.title}</h4>
                  <p className="mt-1 text-sm text-foreground/70">{resource.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {resource.method}
                    </span>
                    <span className="text-xs text-foreground/60">By: {resource.uploadedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-foreground/70">No resources yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
