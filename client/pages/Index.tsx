import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const goExplore = () => {
    if (!isAuthenticated) navigate("/login", { state: { redirectTo: "/teachers" } });
    else navigate(role === "student" ? "/students" : "/teachers");
  };
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(40%_40%_at_90%_10%,hsl(var(--accent)/0.15),transparent_60%),radial-gradient(35%_35%_at_10%_10%,hsl(var(--secondary)/0.18),transparent_60%)]" />
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:gap-14 md:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-semibold text-foreground/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Inclusive Education Platform
            </span>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Identify slow learners, personalize remediation, empower teachers.
            </h1>
            <p className="max-w-prose text-foreground/70">
              A data-driven platform to capture assessments, flag learners who need
              help, assign tailored remedial plans, and track progress. Equip
              teachers with innovative teaching resources and real-time insights.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => (isAuthenticated ? navigate("/teachers") : navigate("/login", { state: { redirectTo: "/teachers" } }))} className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90">
                Go to Teacher Dashboard
              </button>
              <button onClick={() => (isAuthenticated ? navigate("/students") : navigate("/login", { state: { redirectTo: "/students" } }))} className="inline-flex items-center rounded-md border px-5 py-3 text-sm font-semibold hover:bg-muted">
                View Student Dashboard
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 via-emerald-300/10 to-orange-300/10 blur-2xl" />
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard
                  title="Assessment Entry"
                  desc="Quickly record subject scores and dates for each student."
                  img="https://images.pexels.com/photos/7092610/pexels-photo-7092610.jpeg"
                  alt="Students engaging in discussion during an exam in a classroom, conveying themes of education and collaboration."
                />
                <PreviewCard
                  title="Slow Learner Flags"
                  desc="Smart analysis highlights learners who need support."
                  img="https://images.pexels.com/photos/6936008/pexels-photo-6936008.jpeg"
                  alt="Children focused on writing and learning in a classroom environment."
                />
                <PreviewCard
                  title="Remedial Plans"
                  desc="Assign strategies, goals, and monitor progress."
                  img="https://images.pexels.com/photos/6929190/pexels-photo-6929190.jpeg"
                  alt="Close-up of hands writing in a notebook while studying documents on a wooden table."
                />
                <PreviewCard
                  title="Teaching Resources"
                  desc="Share innovative methods and classroom activities."
                  img="https://images.pexels.com/photos/8363039/pexels-photo-8363039.jpeg"
                  alt="Bright classroom display featuring vibrant geometric shapes like circle, square, and star."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-8 py-12 md:grid-cols-3">
        <Feature title="Student Profiles" desc="Centralize student data, assessments, and individualized plans." />
        <Feature title="Analytics & Charts" desc="Visualize progress over time and measure impact." />
        <Feature title="Secure & Role-based" desc="JWT auth with roles for Admin and Teachers." />
      </section>

      {/* CTA */}
      <section className="container my-8">
        <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-emerald-200/15 to-orange-200/15 p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold">Ready to support every learner?</h3>
          <p className="mx-auto mt-2 max-w-prose text-foreground/70">
            Start by adding your students and entering recent assessments. The dashboard will
            guide you with insights and suggested strategies.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90">
              Create free account
            </Link>
            <button onClick={goExplore} className="inline-flex items-center rounded-md border px-5 py-3 text-sm font-semibold hover:bg-muted">
              Explore dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-foreground/70">{desc}</p>
    </div>
  );
}


function PreviewCard({ title, desc, img, alt }: { title: string; desc: string; img: string; alt: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <img src={img} alt={alt} className="mb-2 h-24 w-full rounded-md object-cover" />
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-foreground/70">{desc}</p>
    </div>
  );
}
