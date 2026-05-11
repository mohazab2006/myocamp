import Link from "next/link";
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  FileText,
  Lock,
  PencilSimple,
  Plus,
  SignOut,
  SlidersHorizontal,
  Tent,
  WarningCircle
} from "@phosphor-icons/react/ssr";
import { getBlogPosts } from "@/lib/content/blog";
import { getCampSettings } from "@/lib/content/camp";
import { getEvents } from "@/lib/content/events";
import { getAdminUser, isSupabaseAuthConfigured } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/content";
import type { AudienceTag, BlogPost, CampSettings, EventType, OrgEvent } from "@/lib/types";
import {
  deleteBlogPostAction,
  deleteEventAction,
  loginAction,
  logoutAction,
  saveBlogPostAction,
  saveCampStatusAction,
  saveEventAction
} from "./actions";

export const dynamic = "force-dynamic";

const eventTypes: EventType[] = ["hike", "campfire", "fundraiser", "social", "service", "camp", "workshop"];
const audienceTags: AudienceTag[] = ["youth", "parents", "families", "leaders", "all"];

const registrationStatusOptions: {
  value: CampSettings["registrationStatus"];
  label: string;
  hint: string;
}[] = [
  {
    value: "opening-soon",
    label: "Opening soon",
    hint: "Not open yet — page shows the opening date and newsletter prompt."
  },
  { value: "open", label: "Open now", hint: "Registration is live — JotForm is accepting submissions." },
  { value: "full", label: "Full", hint: "All spots taken — point families to the waitlist." },
  { value: "closed", label: "Closed", hint: "Registration is finished for this cycle." }
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type AdminSection = "events" | "blog" | "camp" | "setup";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function adminSection(value: string | string[] | undefined): AdminSection {
  const section = firstParam(value);
  if (section === "blog" || section === "setup" || section === "camp") return section;
  return "events";
}

function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink-soft">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-ink-soft">{hint}</span>}
    </label>
  );
}

const inputClass =
  "min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-pine";
const textareaClass =
  "min-h-28 w-full border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition focus:border-pine";

function StatusMessage({ message, tone }: { message?: string; tone: "success" | "error" }) {
  if (!message) return null;
  const Icon = tone === "success" ? CheckCircle : WarningCircle;

  return (
    <div
      className={`mb-6 flex items-start gap-3 border p-4 text-sm ${
        tone === "success"
          ? "border-pine/25 bg-sky/55 text-forest"
          : "border-ember/30 bg-ember/10 text-ink"
      }`}
    >
      <Icon size={20} weight="duotone" />
      <span>{message}</span>
    </div>
  );
}

function LoginPanel({
  error,
  saved,
  configured
}: {
  error?: string;
  saved?: string;
  configured: boolean;
}) {
  return (
    <section className="mx-auto flex min-h-dvh max-w-[760px] flex-col justify-center px-6 py-20 md:px-10">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={14} weight="bold" /> Back to MYO
      </Link>

      <div className="mt-10 border border-line bg-paper-deep/45 p-8 md:p-10">
        <div className="flex items-center gap-3 text-ember">
          <Lock size={28} weight="duotone" />
          <span className="text-xs uppercase tracking-[0.18em]">Admin</span>
        </div>
        <h1 className="headline-display mt-5 text-4xl md:text-5xl">Owner dashboard</h1>
        <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
          Sign in with the admin email and password from Supabase Auth. This uses password login, not magic links.
        </p>

        <div className="mt-8">
          <StatusMessage message={error} tone="error" />
          <StatusMessage message={saved} tone="success" />
          {!configured && (
            <StatusMessage
              tone="error"
              message="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before signing in."
            />
          )}
        </div>

        <form action={loginAction} className="mt-6 grid gap-5">
          <Field label="Email">
            <input className={inputClass} name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Password">
            <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
          </Field>
          <button
            className="inline-flex h-11 w-fit items-center justify-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!configured}
          >
            <Lock size={16} weight="bold" /> Sign in
          </button>
        </form>
      </div>
    </section>
  );
}

function EventForm({ event }: { event?: OrgEvent }) {
  return (
    <form action={saveEventAction} className="grid gap-5 border border-line bg-paper-deep/35 p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">{event ? event.title : "Add event"}</h3>
        {event ? <PencilSimple size={18} className="text-brass" /> : <Plus size={18} className="text-brass" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input className={inputClass} name="title" defaultValue={event?.title} required />
        </Field>
        <Field label="Slug">
          <input className={inputClass} name="slug" defaultValue={event?.slug} placeholder="auto-from-title-date" />
        </Field>
        <Field label="Type">
          <select className={inputClass} name="type" defaultValue={event?.type ?? "social"} required>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cost">
          <input className={inputClass} name="cost" defaultValue={event?.cost} placeholder="Free, $25, TBD" />
        </Field>
        <Field label="Start date">
          <input className={inputClass} name="startDate" type="date" defaultValue={event?.startDate} required />
        </Field>
        <Field label="End date">
          <input className={inputClass} name="endDate" type="date" defaultValue={event?.endDate} />
        </Field>
      </div>

      <Field label="Location">
        <input className={inputClass} name="location" defaultValue={event?.location} required />
      </Field>

      <Field label="Audience">
        <div className="flex flex-wrap gap-2">
          {audienceTags.map((tag) => (
            <label key={tag} className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm">
              <input
                name="audience"
                type="checkbox"
                value={tag}
                defaultChecked={event?.audience.includes(tag) ?? tag === "youth"}
              />
              <span className="capitalize">{tag}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Summary">
        <textarea className={textareaClass} name="blurb" defaultValue={event?.blurb} required />
      </Field>
      <Field label="Body">
        <textarea className={`${textareaClass} min-h-40`} name="body" defaultValue={event?.body} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Hero image path">
          <input className={inputClass} name="heroImage" defaultValue={event?.heroImage} placeholder="/Pictures/camp1.jpg" />
        </Field>
        <Field label="Registration URL">
          <input className={inputClass} name="registerUrl" defaultValue={event?.registerUrl} placeholder="https://..." />
        </Field>
        <Field label="Registration opens">
          <input className={inputClass} name="registerOpens" type="date" defaultValue={event?.registerOpens} />
        </Field>
        <Field label="Registration closes">
          <input className={inputClass} name="registerCloses" type="date" defaultValue={event?.registerCloses} />
        </Field>
      </div>

      <label className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft">
        <input name="archived" type="checkbox" defaultChecked={event?.archived} />
        Mark as archived
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex h-11 items-center justify-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine">
          <CheckCircle size={16} weight="bold" /> Save event
        </button>
      </div>
    </form>
  );
}

function BlogPostForm({ post }: { post?: BlogPost }) {
  return (
    <form action={saveBlogPostAction} className="grid gap-5 border border-line bg-paper-deep/35 p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">{post ? post.title : "Add blog post"}</h3>
        {post ? <FileText size={18} className="text-brass" /> : <Plus size={18} className="text-brass" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input className={inputClass} name="title" defaultValue={post?.title} required />
        </Field>
        <Field label="Slug">
          <input className={inputClass} name="slug" defaultValue={post?.slug} placeholder="auto-from-title-date" />
        </Field>
        <Field label="Publish date">
          <input className={inputClass} name="publishedAt" type="date" defaultValue={post?.publishedAt} required />
        </Field>
        <Field label="Hero image path">
          <input className={inputClass} name="heroImage" defaultValue={post?.heroImage} placeholder="/Pictures/trails.jpg" />
        </Field>
      </div>

      <Field label="Excerpt">
        <textarea className={textareaClass} name="excerpt" defaultValue={post?.excerpt} required />
      </Field>
      <Field label="Post body">
        <textarea className={`${textareaClass} min-h-52`} name="body" defaultValue={post?.body} />
      </Field>

      <button className="inline-flex h-11 w-fit items-center justify-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine">
        <CheckCircle size={16} weight="bold" /> Save post
      </button>
    </form>
  );
}

function DeleteButton({
  slug,
  action,
  label
}: {
  slug: string;
  action: (formData: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <button className="text-xs font-semibold uppercase tracking-[0.14em] text-ember underline underline-offset-4">
        {label}
      </button>
    </form>
  );
}

function SectionNav({
  active,
  eventCount,
  postCount,
  campStatusLabel
}: {
  active: AdminSection;
  eventCount: number;
  postCount: number;
  campStatusLabel: string;
}) {
  const items = [
    {
      key: "events",
      href: "/admin?section=events",
      label: "Events",
      detail: `${eventCount} live items`,
      icon: CalendarBlank
    },
    {
      key: "blog",
      href: "/admin?section=blog",
      label: "Blog posts",
      detail: `${postCount} published`,
      icon: FileText
    },
    {
      key: "camp",
      href: "/admin?section=camp",
      label: "Camp",
      detail: `Status: ${campStatusLabel}`,
      icon: Tent
    },
    {
      key: "setup",
      href: "/admin?section=setup",
      label: "Setup",
      detail: "Keys and tables",
      icon: SlidersHorizontal
    }
  ] as const;

  return (
    <nav aria-label="Admin sections" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={selected ? "page" : undefined}
            className={`group flex min-h-20 items-center justify-between border px-4 py-3 text-left transition ${
              selected
                ? "border-forest bg-forest text-paper"
                : "border-line bg-paper-deep/35 text-ink hover:border-pine hover:bg-paper-deep/60"
            }`}
          >
            <span className="grid gap-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon size={17} weight={selected ? "bold" : "regular"} />
                {item.label}
              </span>
              <span className={selected ? "text-xs text-paper/75" : "text-xs text-ink-soft"}>{item.detail}</span>
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                selected ? "bg-brass" : "bg-line group-hover:bg-pine"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}

function CampStatusPanel({
  current,
  supabaseConfigured
}: {
  current: CampSettings["registrationStatus"];
  supabaseConfigured: boolean;
}) {
  const currentOption = registrationStatusOptions.find((option) => option.value === current);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brass">Camp</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Registration status</h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
            Flip the badge on{" "}
            <Link href="/camp/register" className="text-pine underline underline-offset-4 hover:text-forest">
              /camp/register
            </Link>{" "}
            and homepage CTAs. The JotForm itself is still controlled inside JotForm — this only changes
            the messaging on the site.
          </p>
        </div>
        <div
          className={`border px-3 py-2 text-sm ${
            supabaseConfigured
              ? "border-pine/25 bg-sky/55 text-forest"
              : "border-ember/30 bg-ember/10 text-ink"
          }`}
        >
          {supabaseConfigured ? `Currently: ${currentOption?.label ?? current}` : "Supabase not connected"}
        </div>
      </div>

      <form
        action={saveCampStatusAction}
        className="grid gap-5 border border-line bg-paper-deep/35 p-5"
      >
        <Field
          label="Registration status"
          hint={currentOption?.hint ?? "Pick what visitors see on the camp pages."}
        >
          <select
            className={inputClass}
            name="registrationStatus"
            defaultValue={current}
            required
            disabled={!supabaseConfigured}
          >
            {registrationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          className="inline-flex h-11 w-fit items-center justify-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!supabaseConfigured}
        >
          <CheckCircle size={16} weight="bold" /> Save status
        </button>

        {!supabaseConfigured && (
          <p className="text-xs leading-relaxed text-ink-soft">
            Connect Supabase (see the Setup tab) before saving — the status falls back to the value in
            <code className="mx-1 rounded bg-paper-deep/60 px-1 py-0.5">lib/content/camp.ts</code> until
            it&apos;s configured.
          </p>
        )}
      </form>
    </section>
  );
}

function SetupPanel({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brass">Setup</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Connection checklist</h2>
        </div>
        <div
          className={`border px-3 py-2 text-sm ${
            supabaseConfigured
              ? "border-pine/25 bg-sky/55 text-forest"
              : "border-ember/30 bg-ember/10 text-ink"
          }`}
        >
          {supabaseConfigured ? "Supabase content connected" : "Supabase content missing"}
        </div>
      </div>

      <div className="border border-line bg-paper-deep/35 p-5">
        <ul className="grid gap-3 text-sm leading-relaxed text-ink-soft">
          <li>Create the admin user in Supabase Auth with email/password.</li>
          <li>Set `ADMIN_EMAIL` or comma-separated `ADMIN_EMAILS` to restrict access.</li>
          <li>Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.</li>
          <li>Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the server.</li>
          <li>Create `content_events`, `content_blog_posts`, and `content_camp_settings` tables using `docs/ADMIN.md`.</li>
          <li>Use image paths from `public/Pictures`, for example `/Pictures/trails.jpg`.</li>
        </ul>
      </div>
    </section>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: SearchParams }) {
  const query = searchParams ? await searchParams : {};
  const error = firstParam(query.error);
  const saved = firstParam(query.saved);
  const section = adminSection(query.section);
  const user = await getAdminUser();
  const configured = isSupabaseAuthConfigured();

  if (!user) {
    return <LoginPanel error={error} saved={saved} configured={configured} />;
  }

  const [events, posts, camp] = await Promise.all([getEvents(), getBlogPosts(), getCampSettings()]);
  const supabaseConfigured = isSupabaseConfigured();
  const campStatusLabel =
    registrationStatusOptions.find((option) => option.value === camp.registrationStatus)?.label ??
    camp.registrationStatus;

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} weight="bold" /> Back to MYO
        </Link>
        <form action={logoutAction}>
          <button className="inline-flex h-10 items-center justify-center gap-2 border border-line bg-paper px-4 text-sm text-ink-soft hover:text-ink">
            <SignOut size={16} /> Sign out
          </button>
        </form>
      </div>

      <div className="mt-7 grid gap-5 border-b border-line pb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-center gap-3 text-ember">
            <Lock size={28} weight="duotone" />
            <span className="text-xs uppercase tracking-[0.18em]">Admin</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">Choose what to edit</h1>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-ink-soft">
            Switch between event pages, blog posts, and setup from here. Signed in as {user.email}.
          </p>
        </div>
        <div className="border border-line bg-paper-deep/45 p-3 text-sm text-ink-soft">
          <div className="flex items-center gap-2 text-ink">
            <CalendarBlank size={16} /> Supabase
          </div>
          <p className="mt-2 max-w-[28ch]">
            {supabaseConfigured ? "Connected by environment variables." : "Missing Supabase environment variables."}
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-5 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <SectionNav
          active={section}
          eventCount={events.length}
          postCount={posts.length}
          campStatusLabel={campStatusLabel}
        />
      </div>

      <div className="mt-6">
        <StatusMessage message={error} tone="error" />
        <StatusMessage message={saved} tone="success" />
      </div>

      <div className="mt-7">
        {section === "events" && (
          <section className="grid gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
              <p className="eyebrow text-brass">Events</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Add or edit event pages</h2>
              </div>
              <Link href="/admin?section=blog" className="text-sm font-semibold text-pine hover:text-forest">
                Switch to blog posts
              </Link>
            </div>
            <EventForm />
            {events.map((event) => (
              <div key={event.slug} className="grid gap-3">
                <EventForm event={event} />
                <DeleteButton slug={event.slug} action={deleteEventAction} label="Delete event" />
              </div>
            ))}
          </section>
        )}

        {section === "blog" && (
          <section className="grid gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
              <p className="eyebrow text-brass">Blog</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Add or edit blog posts</h2>
              </div>
              <Link href="/admin?section=events" className="text-sm font-semibold text-pine hover:text-forest">
                Switch to events
              </Link>
            </div>
            <BlogPostForm />
            {posts.map((post) => (
              <div key={post.slug} className="grid gap-3">
                <BlogPostForm post={post} />
                <DeleteButton slug={post.slug} action={deleteBlogPostAction} label="Delete post" />
              </div>
            ))}
          </section>
        )}

        {section === "camp" && (
          <CampStatusPanel
            current={camp.registrationStatus}
            supabaseConfigured={supabaseConfigured}
          />
        )}

        {section === "setup" && <SetupPanel supabaseConfigured={supabaseConfigured} />}
      </div>
    </section>
  );
}
