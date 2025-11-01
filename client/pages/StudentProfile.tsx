import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const { id } = useParams();
  const { role } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const s = await api<unknown, any>(`/api/students/${id}`);
        setStudent(s);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const unlink = async () => {
    if (!student?._id) return;
    try {
      await api<{ studentId: string }, any>("/api/students/unlink", { method: "POST", body: { studentId: student._id } });
      toast({ title: "Unlinked", description: "Student unlinked from user account." });
      setStudent({ ...student, userId: null });
    } catch (e: any) {
      const msg = e?.message || String(e);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const link = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?._id || !linkEmail) return;
    try {
      await api<{ studentId: string; email: string; password?: string }, any>("/api/students/link", { method: "POST", body: { studentId: student._id, email: linkEmail, password: linkPassword } });
      toast({ title: "Linked", description: "Student linked to user account." });
      // reload
      const s = await api<unknown, any>(`/api/students/${id}`);
      setStudent(s);
    } catch (e: any) {
      const msg = e?.message || String(e);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  if (loading) return <div className="container py-12">Loading...</div>;
  if (error) return <div className="container py-12 text-destructive">{error}</div>;
  if (!student) return <div className="container py-12">Student not found</div>;

  return (
    <section className="container py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <div className="text-sm text-foreground/70">Class: {student.class}</div>
        </div>
        <div>
          {student.userId ? (
            <div className="text-sm">
              Linked user: <span className="font-medium">{student.userId.email}</span>
              {role === "teacher" || role === "admin" ? (
                <button onClick={unlink} className="ml-3 rounded-md bg-destructive px-3 py-1 text-sm text-destructive-foreground">Unlink</button>
              ) : null}
            </div>
          ) : (
            role !== "student" && (
              <form onSubmit={link} className="flex items-center gap-2">
                <input value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="student email" className="rounded-md border px-2 py-1" />
                <input value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} placeholder="password (if creating)" className="rounded-md border px-2 py-1" />
                <button type="submit" className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">Link</button>
              </form>
            )
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Assessments</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(student.assessments || []).map((a: any) => (
              <li key={a._id} className="flex justify-between border-b py-2">
                <div>
                  <div className="font-medium">{a.subject}</div>
                  <div className="text-xs text-foreground/70">{new Date(a.date).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold">{a.score}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Remedial Plans</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(student.remedialPlans || []).map((r: any) => (
              <li key={r._id} className="border-b py-2">
                <div className="font-medium">{r.planDetails}</div>
                <div className="text-xs text-foreground/70">Assigned by: {r.assignedBy}</div>
                <div className="text-xs text-foreground/70">Progress: {r.progress}%</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
