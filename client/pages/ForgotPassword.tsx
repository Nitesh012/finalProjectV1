import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";

type Step = "email" | "otp" | "reset";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api(
        "/api/otp/send",
        { method: "POST", body: { email }, auth: false }
      );
      setSuccess("OTP sent to your email");
      setStep("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api(
        "/api/otp/verify",
        { method: "POST", body: { email, otp }, auth: false }
      );
      setSuccess("OTP verified");
      setStep("reset");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api(
        "/api/auth/reset-password",
        { method: "POST", body: { email, otp, password }, auth: false }
      );
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container grid gap-8 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="mt-2 max-w-prose text-foreground/70">
          Enter your email to receive an OTP code to reset your password.
        </p>

        {step === "email" && (
          <form onSubmit={sendOTP} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="you@example.com"
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOTP} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                value={email}
                disabled
                type="email"
                className="w-full rounded-md border bg-muted px-3 py-2 text-foreground/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">OTP Code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full rounded-md border px-4 py-2 font-semibold hover:bg-muted"
            >
              Back
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">New Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm Password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-3 text-sm text-foreground/70">
          Remember your password? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Security Steps</h3>
        <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-foreground/70">
          <li>Enter your registered email address</li>
          <li>We'll send a one-time password (OTP) to your email</li>
          <li>Enter the OTP code to verify your identity</li>
          <li>Set a new password for your account</li>
          <li>Log in with your new password</li>
        </ol>
      </div>
    </section>
  );
}
