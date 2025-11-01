import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2 font-extrabold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">SL</span>
            <span className="text-lg">Slow Learner Support</span>
          </div>
          <p className="text-sm text-foreground/70">
            Empowering teachers with data-driven insights and innovative methods to
            support every learner.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Product</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link to="/teachers" className="hover:text-foreground">Teacher Dashboard</Link></li>
            <li><Link to="/students" className="hover:text-foreground">Student Dashboard</Link></li>
            <li><Link to="/resources" className="hover:text-foreground">Resources</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-foreground/60">
        © {new Date().getFullYear()} Slow Learner Support. All rights reserved.
      </div>
    </footer>
  );
}
