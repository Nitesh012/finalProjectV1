import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ email: string; password: string }, { token: string }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      login(res.token);
      // redirect honoring redirectTo state or role
      try {
        const payload = JSON.parse(atob(res.token.split(".")[1]));
        const r = payload.role as string | undefined;
        const state = location.state as { redirectTo?: string } | null;
        const redirectTo = state?.redirectTo;
        if (redirectTo) navigate(redirectTo);
        else if (r === "student") navigate("/students");
        else navigate("/teachers");
      } catch (e) {
        navigate("/teachers");
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container grid gap-8 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 max-w-prose text-foreground/70">
          Log in to access your dashboards and manage remedial plans and resources.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full rounded-md border bg-background px-3 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="w-full rounded-md border bg-background px-3 py-2" placeholder="••••••••" />
          </div>
          {error && <div className="text-sm text-destructive mt-1">{error}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <div className="mt-3 space-y-2 text-sm text-foreground/70">
          <p>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Create one</Link></p>
          <p>Forgot your password? <Link to="/forgot-password" className="text-primary hover:underline">Reset it</Link></p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Next steps</h3>
        <ol className="mt-2 list-decimal pl-5 text-sm text-foreground/70">
          <li>Connect to MongoDB Atlas</li>
          <li>Configure JWT secret</li>
          <li>Invite teachers and start adding students</li>
        </ol>
      </div>
    </section>
  );
}
