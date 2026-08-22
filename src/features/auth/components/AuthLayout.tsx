import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../../../theme";
import { StudioHeroArt } from "../../teacher-studio/components/StudioHeroArt";
import "../styles/auth.css";
import { AuthMark, AuthWordmark } from "./AuthMark";

type AuthLayoutProps = {
  readonly children: ReactNode;
  readonly kicker?: string;
};

export function AuthLayout({ children, kicker = "Atelierul tău" }: AuthLayoutProps) {
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
        <section className="lx-auth-stage" aria-hidden={false}>
          <p className="lx-auth-kicker">{kicker}</p>
          <h1 className="lx-auth-stage-title">
            Atelierul tău creativ pentru educație.
          </h1>
          <p className="lx-auth-stage-lead">
            Tu creezi. LudiCON te ajută să construiești mai ușor.
          </p>
          <div className="lx-auth-art">
            <StudioHeroArt />
          </div>
          <p className="lx-auth-principle">Acesta este locul meu de lucru.</p>
        </section>

        <section className="lx-auth-panel">{children}</section>
      </div>
    </div>
  );
}
