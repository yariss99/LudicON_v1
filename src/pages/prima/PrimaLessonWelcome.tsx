import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { PrimaCard, PrimaWorkspaceLayout } from "../../components/PRIMA";
import { primaRo } from "../../i18n";

const { brand, welcome, message, together, motivation, actions } = primaRo;

const CHECKLIST_BASE_DELAY = 900;
const CHECKLIST_STAGGER = 120;
const BUTTON_DELAY =
  CHECKLIST_BASE_DELAY + together.steps.length * CHECKLIST_STAGGER + 280;

function Stagger({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div className="prima-enter" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function PrimaLessonWelcome() {
  return (
    <PrimaWorkspaceLayout>
      <div className="prima-enter flex flex-col items-center text-center">
        <Stagger delay={0}>
          <h1 className="text-[2.75rem] font-bold tracking-[0.06em] text-slate-900 sm:text-5xl">
            {brand.title}
          </h1>
        </Stagger>

        <PrimaCard className="mt-12 w-full">
          <div className="px-8 py-12 sm:px-12 sm:py-14">
            <Stagger delay={120}>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  {welcome.greeting}
                </h2>
                <div className="mx-auto max-w-[580px] space-y-3 text-base leading-[1.75] text-[#64748B] sm:text-[17px]">
                  <p className="font-medium text-slate-700">{welcome.introLine1}</p>
                  <p>{welcome.introLine2}</p>
                </div>
              </div>
            </Stagger>

            <Stagger delay={280}>
              <div className="mx-auto mt-10 max-w-[580px] space-y-3.5 text-left text-base leading-[1.75] text-[#64748B] sm:text-[17px]">
                {message.lines.map((line, index) => (
                  <p
                    key={line}
                    className={
                      index === 0 || index === message.lines.length - 1
                        ? "font-semibold text-slate-900"
                        : undefined
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            </Stagger>

            <Stagger delay={440}>
              <h3 className="mt-12 text-lg font-semibold tracking-tight text-slate-900">
                {together.title}
              </h3>
            </Stagger>

            <ul className="mx-auto mt-8 max-w-[560px] space-y-3 text-left">
              {together.steps.map((step, index) => (
                <li
                  key={step}
                  className="prima-enter flex items-start gap-3 rounded-2xl bg-slate-50/60 px-4 py-3.5 text-[15px] leading-snug text-slate-700 transition-colors duration-200 hover:bg-blue-50/50"
                  style={{
                    animationDelay: `${CHECKLIST_BASE_DELAY + index * CHECKLIST_STAGGER}ms`,
                  }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {step}
                </li>
              ))}
            </ul>

            <Stagger
              delay={CHECKLIST_BASE_DELAY + together.steps.length * CHECKLIST_STAGGER}
            >
              <div className="mx-auto mt-10 max-w-[540px] space-y-2 text-base italic leading-[1.7] text-[#64748B]">
                {motivation.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </Stagger>
          </div>

          <div className="border-t border-slate-100/80 px-8 py-10 sm:px-12">
            <div
              className="prima-enter flex flex-col items-center gap-5"
              style={{ animationDelay: `${BUTTON_DELAY}ms` }}
            >
              <button
                type="button"
                className="w-full max-w-sm rounded-2xl bg-blue-600 py-4 text-[17px] font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_8px_28px_rgba(37,99,235,0.3)] active:scale-[0.99]"
              >
                {actions.primary}
              </button>

              <Link
                to="/help"
                className="text-sm font-medium text-[#64748B] transition-colors duration-200 hover:text-blue-600"
              >
                {actions.secondary}
              </Link>
            </div>
          </div>
        </PrimaCard>
      </div>
    </PrimaWorkspaceLayout>
  );
}

export default PrimaLessonWelcome;
