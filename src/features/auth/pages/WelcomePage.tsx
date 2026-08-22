import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

export function WelcomePage() {
  return (
    <AuthLayout>
      <p className="lx-auth-panel-kicker">Bun venit</p>
      <h2 className="lx-auth-panel-title">Pornește ideea.</h2>
      <p className="lx-auth-panel-lead">
        Alege cum vrei să intri în atelier. Tu rămâi autorul.
      </p>

      <div className="lx-auth-choices">
        <Link to="/register" className="lx-auth-primary">
          Creează un cont
          <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to="/login" className="lx-auth-secondary">
          Intră în cont
        </Link>
      </div>
    </AuthLayout>
  );
}
