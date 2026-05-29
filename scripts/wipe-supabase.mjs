import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const countTables = [
  "camps",
  "registrations",
  "invoices",
  "payments",
  "waitlist_entries",
  "inbound_emails",
  "reminder_log",
  "content_events",
  "content_blog_posts",
  "content_camp_settings",
  "gmail_credentials",
  "email_templates"
];

async function counts(label) {
  console.log(`\n=== ${label} ===`);
  for (const t of countTables) {
    const { count, error } = await sb.from(t).select("*", { count: "exact", head: true });
    console.log(`${t}: ${error ? error.message : count}`);
  }
}

async function wipeTable(table, column, sentinel) {
  const { error } = await sb.from(table).delete().neq(column, sentinel);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`cleared ${table}`);
}

await counts("BEFORE");

const wipeOrder = [
  ["payments", "id", "00000000-0000-0000-0000-000000000000"],
  ["reminder_log", "id", "00000000-0000-0000-0000-000000000000"],
  ["inbound_emails", "id", "00000000-0000-0000-0000-000000000000"],
  ["waitlist_entries", "id", "00000000-0000-0000-0000-000000000000"],
  ["invoices", "id", "00000000-0000-0000-0000-000000000000"],
  ["registrations", "id", "00000000-0000-0000-0000-000000000000"],
  ["camps", "slug", "__none__"],
  ["content_events", "slug", "__none__"],
  ["content_blog_posts", "slug", "__none__"],
  ["content_camp_settings", "id", "__none__"],
  ["gmail_credentials", "email", "__none__"]
];

for (const [table, column, sentinel] of wipeOrder) {
  await wipeTable(table, column, sentinel);
}

const { data: templates } = await sb.from("email_templates").select("slug, enabled");
console.log("\nemail_templates kept:", templates?.map((t) => t.slug).join(", "));

const { data: users, error: userErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 20 });
if (userErr) console.log("auth users:", userErr.message);
else console.log("admin users kept:", users?.users?.map((u) => u.email).join(", "));

await counts("AFTER");
console.log("\nSupabase wipe complete.");
