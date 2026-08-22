import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../../../theme";
import "../styles/auth.css";
import { AuthMark, AuthWordmark } from "./AuthMark";
import { AuthWorkshopArt } from "./AuthWorkshopArt";

type AuthLayoutProps = {
  readonly children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="lx-auth">
      <header className="lx-auth-bar">
        <Link to="/welcome" className="lx-auth-brand" aria-label="LudiCON">
          <AuthMark size="sm" />
          <AuthWordmark />
        </Link>
        <ThemeToggle compact />
      </header>

      <div className="lx-auth-shell">
        <section className="lx-auth-stage">
          <p className="lx-auth-kicker">LudiCON</p>
          <h1 className="lx-auth-stage-title">Aprinde ideea.</h1>
          <p className="lx-auth-stage-lead">
            Atelierul tău creativ pentru educație.
          </p>

          <ol className="lx-auth-path">
            <li>Bun venit</li>
            <li>Spațiul tău</li>
            <li className="is-on">Ideea ON</li>
          </ol>

          <div className="lx-auth-art">
            <AuthWorkshopArt />
          </div>

          <p className="lx-auth-principle">
            Ideile sunt ON. Tu ții controlul.
          </p>
        </section>

        <section className="lx-auth-panel">{children}</section>
      </div>
    </div>
  );
}
