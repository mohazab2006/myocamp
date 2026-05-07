import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getProgram, getPrograms } from "@/lib/content/programs";
import { ButtonAnchor } from "@/components/main/Button";

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: "Program not found" };
  return { title: program.title, description: program.blurb };
}

export default async function ProgramPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  return (
    <article className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-24">
      <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={14} weight="bold" /> All programs
      </Link>

      <div className="mt-10 grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brass">
            <span>{program.cadence}</span>
            <span>·</span>
            <span className={program.active ? "text-pine" : "text-ink-soft"}>
              {program.active ? "Currently running" : "Past program"}
            </span>
          </div>
          <h1 className="headline-display mt-3 text-5xl md:text-6xl">{program.title}</h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-soft">{program.blurb}</p>
          {program.body && <p className="mt-4 max-w-[60ch] text-ink-soft">{program.body}</p>}

          <div className="mt-10 flex flex-wrap gap-3">
            {program.active && program.signupUrl ? (
              <ButtonAnchor href={program.signupUrl} target="_blank" rel="noopener">
                Sign up
              </ButtonAnchor>
            ) : program.active ? (
              <ButtonAnchor href="mailto:myoadmin@gmail.com">Email to join</ButtonAnchor>
            ) : null}
          </div>
        </div>

        {program.heroImage && (
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-paper-deep">
              <img src={program.heroImage} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
