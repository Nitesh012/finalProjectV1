import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function RemedialForm({ students, onAssigned }: { students: any[]; onAssigned?: () => void }) {
  const [studentId, setStudentId] = useState(students?.[0]?._id || "");
  const [assignedBy, setAssignedBy] = useState("");
  const [planDetails, setPlanDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!studentId || !assignedBy || !planDetails) return setError("Please complete all fields");
    setLoading(true);
    try {
      await api<{ studentId: string; planDetails: string; assignedBy: string }, any>("/api/remedial", {
        method: "POST",
        body: { studentId, planDetails, assignedBy },
      });
      onAssigned?.();
      toast({ title: "Remedial assigned", description: "The remedial plan was assigned successfully." });
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
      toast({ title: "Error assigning remedial", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Student</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
          {students.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.class})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Assigned By</label>
        <input value={assignedBy} onChange={(e) => setAssignedBy(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2" placeholder="Your name" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">Plan Details</label>
        <textarea value={planDetails} onChange={(e) => setPlanDetails(e.target.value)} className="min-h-24 w-full rounded-md border bg-background px-3 py-2" placeholder="E.g., 20 mins phonics practice, pictorial aids for fractions, weekly check-ins" />
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={loading} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{loading ? "Assigning..." : "Assign Plan"}</button>
        <button type="button" onClick={() => { setPlanDetails(""); }} className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted">Clear</button>
      </div>
    </form>
  );
}
