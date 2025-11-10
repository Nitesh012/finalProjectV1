import { Link, useNavigate } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Step = "form" | "otp" | "verify";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [role, setRole] = useState("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(
        "/api/otp/send",
        { method: "POST", body: { email }, auth: false }
      );
      setStep("otp");
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : (typeof err === "string" ? err : "Failed to send OTP");
      setError(errorMsg);
      console.error("Signup error:", { err, errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(
        "/api/otp/verify",
        { method: "POST", body: { email, otp }, auth: false }
      );
      setStep("verify");
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : (typeof err === "string" ? err : "Invalid OTP");
      setError(errorMsg);
      console.error("Verify OTP error:", { err, errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ name: string; email: string; password: string; role: string }, { token: string }>(
        "/api/auth/signup",
        { method: "POST", body: { name, email, password, role }, auth: false },
      );
      login(res.token);
      try {
        const payload = JSON.parse(atob(res.token.split(".")[1]));
        const r = payload.role as string | undefined;
        if (r === "student") navigate("/students");
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
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 max-w-prose text-foreground/70">
          Sign up to access the platform and track your learning journey.
        </p>

        {step === "form" && (
          <form onSubmit={submitForm} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required type="text" className="w-full rounded-md border bg-background px-3 py-2" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="w-full rounded-md border bg-background px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="w-full rounded-md border bg-background px-3 py-2" placeholder="••••••••" />
            </div>
            {error && <div className="text-sm text-destructive mt-1">{error}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{loading ? "Sending OTP..." : "Continue"}</button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOTP} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input value={email} disabled type="email" className="w-full rounded-md border bg-muted px-3 py-2 text-foreground/50" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">OTP Code</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required type="text" className="w-full rounded-md border bg-background px-3 py-2" placeholder="000000" maxLength={6} />
            </div>
            {error && <div className="text-sm text-destructive mt-1">{error}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{loading ? "Verifying..." : "Verify OTP"}</button>
            <button type="button" onClick={() => { setStep("form"); setError(null); }} className="w-full rounded-md border px-4 py-2 font-semibold hover:bg-muted">Back</button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={createAccount} className="mt-6 space-y-4">
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-800">✓ Email verified successfully</p>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">{loading ? "Creating account..." : "Create account"}</button>
            <button type="button" onClick={() => { setStep("form"); setError(null); }} className="w-full rounded-md border px-4 py-2 font-semibold hover:bg-muted">Back</button>
          </form>
        )}

        <p className="mt-3 text-sm text-foreground/70">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Why join?</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-foreground/70">
          <li>Track your assessments and progress</li>
          <li>Access remedial plans and resources</li>
          <li>Get personalized support for your learning</li>
          <li>Assign and track remedial plans (Teachers)</li>
          <li>Share innovative teaching methods (Teachers)</li>
        </ul>
      </div>
    </section>
  );
}
