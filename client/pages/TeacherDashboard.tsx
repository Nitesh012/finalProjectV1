import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import RemedialForm from "@/components/RemedialForm";
import ResourceForm from "@/components/ResourceForm";
import LinkStudentForm from "@/components/LinkStudentForm";

interface StudentRow {
  _id: string;
  name: string;
  class: string;
  assessments?: any[];
  remedialPlans?: any[];
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ month: string; score: number }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const studs = await api<unknown, StudentRow[]>("/api/students");
        if (!mounted) return;
        setStudents(studs.map((s) => ({ ...(s as any), _id: (s as any)._id || (s as any).id })));

        // Build simple aggregated chart data from assessments
        const assessments = await api<unknown, any[]>("/api/assessments");
        if (!mounted) return;
        // compute average per month
        const byMonth: Record<string, { sum: number; count: number }> = {};
        assessments.forEach((a) => {
          const d = new Date(a.date);
          const key = d.toLocaleString("en-US", { month: "short" });
          byMonth[key] = byMonth[key] || { sum: 0, count: 0 };
          byMonth[key].sum += a.score;
          byMonth[key].count += 1;
        });
        const months = Object.keys(byMonth).slice(0, 6);
        const chart = months.map((m) => ({ month: m, score: Math.round(byMonth[m].sum / byMonth[m].count) }));
        setChartData(chart.length ? chart : [
          { month: "Jan", score: 45 },
          { month: "Feb", score: 50 },
          { month: "Mar", score: 55 },
          { month: "Apr", score: 60 },
          { month: "May", score: 65 },
          { month: "Jun", score: 70 },
        ]);
      } catch (err: any) {
        if (err?.message?.includes("401") || err?.toString?.().includes("401")) {
          return navigate("/login");
        }
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <section className="container space-y-8 py-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="mt-1 max-w-prose text-foreground/70">Assign remedial plans, monitor progress, and share innovative methods.</p>
        </div>
        <div className="flex gap-2">
          <FilterButton>All</FilterButton>
          <FilterButton>Slow Learners</FilterButton>
          <FilterButton>On Track</FilterButton>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Assign Remedial Plan */}
        <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold">Assign Remedial Plan</h3>
          <RemedialForm students={students} onAssigned={() => {
            // reload students and remedials
            window.location.reload();
          }} />
        </div>

        {/* Progress Chart */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Progress Overview</h3>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Students table & Resources */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold">Students</h3>
          <div className="mt-3 overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-foreground/70">Loading students...</div>
            ) : error ? (
              <div className="p-6 text-center text-destructive">{error}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/70">
                    <th className="border-b p-2">Name</th>
                    <th className="border-b p-2">Class</th>
                    <th className="border-b p-2">Status</th>
                    <th className="border-b p-2">Last Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const last = (s.assessments || []).slice(-1)[0];
                    const lastScore = last ? last.score : "—";
                    const status = typeof lastScore === "number" && lastScore < 60 ? "Slow Learner" : "On Track";
                    return (
                      <tr key={s._id} className="hover:bg-muted/60">
                        <td className="border-b p-2 font-medium"><a href={`/students/${s._id}`} className="text-primary hover:underline">{s.name}</a></td>
                        <td className="border-b p-2">{s.class}</td>
                        <td className="border-b p-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                              status === "Slow Learner"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="border-b p-2">{lastScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="text-md font-semibold">Link student to a user account</h4>
            <p className="text-sm text-foreground/70 mt-1">Create or link a student user to allow students to sign in and see their profile.</p>
            <LinkStudentForm students={students} onLinked={() => window.location.reload()} />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Add Teaching Resource</h3>
          <ResourceForm onAdded={() => window.location.reload()} />
        </div>
      </div>
    </section>
  );
}

function FilterButton({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setActive((v) => !v)}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
