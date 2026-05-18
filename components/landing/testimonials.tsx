import { Star } from "lucide-react";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const reviews = [
  {
    quote:
      "Smart Birr helped me understand my spending in birr and hit my savings goal for the first time.",
    name: "Michael Chen",
    role: "Founder, Addis Startup",
  },
  {
    quote:
      "Logging expenses on Telegram is genius. I just message what I spent and the AI handles the rest.",
    name: "Sara Bekele",
    role: "Product Manager",
  },
  {
    quote:
      "The budget planner split my 20k income into rent, food, and savings — finally something realistic.",
    name: "Daniel T.",
    role: "Freelance developer",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className={`${theme.sectionAlt} py-20 lg:py-28`}>
      <article className={landingContainer}>
        <header className="text-center">
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Loved by people managing money in ETB
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Join users who budget smarter with AI and Telegram.
          </p>
        </header>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name} className={theme.card}>
              <p className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </p>
              <blockquote className="mt-4 text-sm leading-relaxed text-zinc-300">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <footer className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-600 text-sm font-semibold text-white">
                  {r.name[0]}
                </span>
                <span>
                  <p className="text-sm font-semibold text-zinc-100">{r.name}</p>
                  <p className={`text-xs ${theme.subtext}`}>{r.role}</p>
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
