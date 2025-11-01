import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { role } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [remedials, setRemedials] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const loadStudentView = async () => {
      try {
        // student should fetch only their linked student doc
        const my = await api<unknown, any>("/api/students/me");
        setAssessments(my.assessments || []);
        setRemedials(my.remedialPlans || []);
      } catch (e) {
        console.error(e);
      }
      try {
        const rs = await api<unknown, any[]>("/api/resources");
        setResources(rs);
      } catch (e) {
        console.error(e);
      }
    };

    const loadTeacherView = async () => {
      try {
        const s = await api<unknown, any[]>("/api/students");
        setStudents(s);
      } catch (e) {
        console.error(e);
      }
      try {
        const rs = await api<unknown, any[]>("/api/resources");
        setResources(rs);
      } catch (e) {
        console.error(e);
      }
    };

    if (role === "student") loadStudentView();
    else loadTeacherView();
  }, [role]);

  if (role === "student") {
    return (
      <section className="container py-12">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="mt-2 max-w-prose text-foreground/70">Welcome to your student dashboard. You'll see your assessments and assigned remedial plans here.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold">Your Assessments</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {assessments.length ? assessments.map((a) => (
                <li key={a._id} className="flex justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{a.subject}</div>
                    <div className="text-xs text-foreground/70">{new Date(a.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm font-semibold">{a.score}</div>
                </li>
              )) : <div className="text-sm text-foreground/70">No assessments yet.</div>}
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Your Remedial Plans</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {remedials.length ? remedials.map((r) => (
                <li key={r._id} className="border-b py-2">
                  <div className="font-medium">{r.planDetails}</div>
                  <div className="text-xs text-foreground/70">Assigned by: {r.assignedBy}</div>
                  <div className="text-xs text-foreground/70">Progress: {r.progress}%</div>
                </li>
              )) : <div className="text-sm text-foreground/70">No remedial plans assigned.</div>}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Recommended Resources</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {resources.length ? resources.map((res) => (
              <li key={res._id} className="border-b py-2">
                <div className="font-medium">{res.title}</div>
                <div className="text-xs text-foreground/70">{res.method}</div>
                <div className="text-xs text-foreground/70">{res.description}</div>
              </li>
            )) : <div className="text-sm text-foreground/70">No resources yet.</div>}
          </ul>
        </div>
      </section>
    );
  }

  // teacher view: show students list and basic stats
  return (
    <section className="container py-12">
      <h1 className="text-3xl font-bold">Students</h1>
      <p className="mt-2 max-w-prose text-foreground/70">Manage students, view profiles and assign remedial plans.</p>

      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">All Students</h3>
        <ul className="mt-3">
          {students.length ? students.map((s) => (
            <li key={s._id} className="flex items-center justify-between border-b py-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-foreground/70">Class: {s.class}</div>
              </div>
              <a className="text-primary hover:underline" href={`/students/${s._id}`}>View profile</a>
            </li>
          )) : <div className="text-sm text-foreground/70">No students found.</div>}
        </ul>
      </div>
    </section>
  );
}
