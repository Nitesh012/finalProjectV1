import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function LinkStudentForm({ students, onLinked }: { students: any[]; onLinked?: () => void }) {
  const [studentId, setStudentId] = useState(students?.[0]?._id || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!studentId || !email) return setError("Please select a student and provide an email");
    setLoading(true);
    try {
      await api<{ studentId: string; email: string; password?: string; name?: string }, any>("/api/students/link", {
        method: "POST",
        body: { studentId, email, password },
      });
      toast({ title: "Linked", description: "Student linked to user successfully." });
      onLinked?.();
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
      toast({ title: "Error linking", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Student</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
          {students.map((s: any) => (
            <option key={s._id} value={s._id}>{s.name} ({s.class})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email to link</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="student@example.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password (if creating)</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="Set a password (optional)" />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <div className="sm:col-span-2 flex gap-2">
        <button disabled={loading} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{loading ? 'Linking...' : 'Link Student'}</button>
      </div>
    </form>
  );
}
