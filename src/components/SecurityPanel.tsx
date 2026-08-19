import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

const implementedControls = [
  ['Opaque sessions', 'The local BFF stores only opaque session identifiers in HttpOnly, SameSite cookies; Secure is enabled in production mode.'],
  ['CSRF + Origin', 'Logout and the cost-incurring explainer require both the trusted Origin and a session-bound CSRF token.'],
  ['Input boundaries', 'Shared Zod schemas validate authentication input, while the explainer accepts only an allow-listed company ID and focus.'],
  ['Abuse controls', 'Authentication and explainer endpoints have separate bounded rate limits plus explicit request-size limits.'],
  ['Security headers', 'The BFF emits no-store, CSP, frame, referrer, permissions and MIME-sniffing protections; HSTS is enabled in production mode.'],
  ['Secret isolation', 'The OpenAI API key is read only by the server process and is never exposed through a Vite client variable.'],
] as const;

const productionNotes = [
  'The repository uses in-memory users and sessions for a reproducible local reference implementation; production would move these behind persistent user/session adapters.',
  'Distributed rate limiting belongs in shared infrastructure such as Redis, an API gateway or an edge layer when the service runs on multiple instances.',
] as const;

export function SecurityPanel() {
  return (
    <section aria-labelledby="security-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600 dark:text-blue-400">
            Defense in depth
          </p>
          <h2 id="security-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            Security posture
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Every control below is implemented in this repository; production-only scale concerns are called out separately.
          </p>
        </div>
        <Badge tone="positive">Implemented here</Badge>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {implementedControls.map(([name, description]) => (
          <Card key={name}>
            <h3 className="font-bold text-slate-950 dark:text-white">{name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-3">
        <h3 className="font-bold text-slate-950 dark:text-white">Production scale boundary</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {productionNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </Card>
    </section>
  );
}
