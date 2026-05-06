import {
  ArrowUpRight,
  CalendarDays,
  Check,
  HeartHandshake,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  TentTree,
  Waves
} from "lucide-react";
import { CampExperience } from "@/components/CampExperience";

const navItems = [
  ["Story", "#story"],
  ["Program", "#program"],
  ["Location", "#location"],
  ["Register", "#register"],
  ["Rules", "#rules"],
  ["Support", "#support"]
];

const activities = [
  "Quran studies and recitation",
  "Leadership development",
  "Swimming and canoeing",
  "Islamic manners and reflection",
  "Nature immersion",
  "Survival skills and bonfires",
  "Skills and crafts workshops",
  "Sports and recreation",
  "Camp-wide games"
];

const packing = [
  "Reusable water bottle",
  "Sleeping bag or blankets",
  "Pillow",
  "Long pants and shirts",
  "Raincoat or poncho",
  "Warm sweater",
  "Hat and towels",
  "Soap, toothbrush, toothpaste",
  "Flashlight",
  "Insect repellent and sunscreen"
];

const spaces = [
  {
    title: "Cabins",
    image: "/Pictures/girlsCabin.jpg",
    copy: "Simple shared spaces with counselor oversight and daily rhythms."
  },
  {
    title: "Waterfront",
    image: "/Pictures/beach.jpg",
    copy: "Swim and canoe sessions run with lifeguards, life jackets, and supervision."
  },
  {
    title: "Trails",
    image: "/Pictures/trails.jpg",
    copy: "Forest routes for reflection, group challenges, and fresh air."
  },
  {
    title: "Campfire",
    image: "/Pictures/gFirePit.jpg",
    copy: "Evening circles for stories, snacks, prayer, and friendship."
  }
];

export default function Home() {
  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <header className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="MYO Camp home">
          <img src="/Pictures/Logo.png" alt="" />
          <span>MYO Camp</span>
        </a>
        <nav>
          {navItems.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#register">
          Register <ArrowUpRight size={16} />
        </a>
        <button className="menu-button" aria-label="Open navigation">
          <Menu size={20} />
        </button>
      </header>

      <section id="top" className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>
            MYO Summer Camp, where faith meets the wild.
          </h1>
          <p>
            A week-long overnight camp for Muslim youth ages 9 to 16, with leadership training for older youth, built around cabins, canoeing, campfires, prayer, service, and friendship.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#register">
              Registration details
            </a>
            <a className="button secondary" href="#experience">
              Explore camp life
            </a>
          </div>
        </div>
      </section>

      <section id="story" className="story-section">
        <div className="story-copy">
          <p className="eyebrow">Four decades outdoors</p>
          <h2>Built by volunteers, remembered by campers.</h2>
          <p>
            MYO creates a positive Islamic environment where young people can learn, pray, play, and build a constructive Canadian Muslim identity. The goal is simple: youth who return home more confident, more connected, and more ready to serve.
          </p>
        </div>
        <div className="story-media">
          <img src="/Pictures/assembly.jpg" alt="Campers gathered outdoors for assembly" />
          <div className="story-note">
            <ShieldCheck size={22} />
            <span>CPR, first aid, waterfront, food safety, and counselor training are core parts of the week.</span>
          </div>
        </div>
      </section>

      <section id="program" className="program-section">
        <div className="section-heading">
          <p className="eyebrow">Program</p>
          <h2>Faith, leadership, and full days outside.</h2>
        </div>

        <div className="program-bento">
          <article className="bento-card wide image-card">
            <img src="/Pictures/canoes2.jpg" alt="Canoes lined up near the water" />
            <div>
              <Waves size={28} />
              <h3>Waterfront time</h3>
              <p>Swimming and canoeing are part of the camp rhythm, with required life jackets and active supervision.</p>
            </div>
          </article>
          <article className="bento-card">
            <TentTree size={28} />
            <h3>Campers</h3>
            <p>Ages 9 to 16 spend the week in cabins with workshops, recreation, worship, and group projects.</p>
          </article>
          <article className="bento-card ember">
            <Sparkles size={28} />
            <h3>LIT youth</h3>
            <p>Older youth ages 17 to 19 join leadership development and prepare to serve future campers.</p>
          </article>
          <article className="bento-card list-card">
            <h3>Activities</h3>
            <div className="activity-cloud">
              {activities.map((activity) => (
                <span key={activity}>{activity}</span>
              ))}
            </div>
          </article>
          <article className="bento-card image-card">
            <img src="/Pictures/obstacleCourse.jpg" alt="Camp obstacle course in the woods" />
            <div>
              <HeartHandshake size={28} />
              <h3>Volunteer powered</h3>
              <p>Counselors, cooks, planners, lifeguards, and community helpers make the week possible.</p>
            </div>
          </article>
        </div>
      </section>

      <CampExperience />

      <section id="location" className="location-section">
        <div className="section-heading left">
          <p className="eyebrow">Location</p>
          <h2>Camp Smitty, 98 Mink Lake Road, Eganville.</h2>
          <p>Arrival and pickup windows should be respected so staff can keep the site calm, prepared, and safe for every camper.</p>
        </div>
        <div className="accordion-strip" aria-label="Camp spaces">
          {spaces.map((space) => (
            <article key={space.title} className="space-panel">
              <img src={space.image} alt={space.title} />
              <div>
                <h3>{space.title}</h3>
                <p>{space.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="register" className="register-section">
        <div className="register-intro">
          <p className="eyebrow">Registration</p>
          <h2>Registration opens June 29, 2025.</h2>
          <p>
            Do not pay until your spot is confirmed. Campers are confirmed only after fees are paid or payment arrangements are made.
          </p>
          <div className="detail-row">
            <CalendarDays size={22} />
            <span>Deadline: July 24, 2025</span>
          </div>
          <div className="detail-row">
            <MapPin size={22} />
            <span>Drop-off: Sunday afternoon. Pickup: Saturday at noon.</span>
          </div>
        </div>
        <div className="pricing-panel">
          <h3>Camp fees</h3>
          <div className="price-grid">
            <div>
              <span>Camper</span>
              <strong>$400</strong>
              <p>Ages 9 to 16, cabins</p>
            </div>
            <div>
              <span>LIT</span>
              <strong>$400</strong>
              <p>Ages 17 to 19, cabins</p>
            </div>
          </div>
          <p>Email money transfers go to MYOadmin@gmail.com. PayPal adds a fee per camper.</p>
          <a className="button primary dark" href="mailto:MYOadmin@gmail.com">
            Email admin
          </a>
        </div>
      </section>

      <section className="form-section">
        <iframe
          title="MYO Camp registration form"
          src="https://form.jotform.com/241729323092253?parentURL=http%3A%2F%2Fwww.myo.camp%2Fregister.html&jsForm=true"
          loading="lazy"
        />
      </section>

      <section id="rules" className="rules-section">
        <div className="rules-copy">
          <p className="eyebrow">Preparation</p>
          <h2>Clear expectations, fewer surprises.</h2>
          <p>Campers stay with their group, follow counselor direction, respect Islamic dress and behavior, and leave phones, tablets, valuables, candy, weapons, fireworks, and laser pointers at home.</p>
        </div>
        <div className="packing-panel">
          <h3>Things to bring</h3>
          <ul>
            {packing.map((item) => (
              <li key={item}>
                <Check size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="support" className="support-section">
        <img src="/Pictures/campPoster.jpg" alt="MYO Summer Camp poster" />
        <div>
          <p className="eyebrow">Support</p>
          <h2>Help more youth make it to camp.</h2>
          <p>
            MYO is nonprofit and volunteer driven. Donations help subsidize families, support camp equipment, and keep the week accessible.
          </p>
          <div className="support-actions">
            <a className="button primary" href="https://www.paypal.com/donate/?hosted_button_id=PVVD32WHTA9KE">
              Donate
            </a>
            <a className="button secondary light" href="https://docs.google.com/forms/d/e/1FAIpQLSdXXKBLPvd0A6X-D0ildNXdvqEymLY-KmGxHEz_CvfWshCeWg/viewform?usp=send_form">
              Volunteer
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <img src="/Pictures/Logo.png" alt="" />
          <span>MYO Camp</span>
        </div>
        <p>Muslim Youth of Ottawa summer camp. Built for community, faith, and the outdoors.</p>
        <a href="mailto:myoadmin@gmail.com">myoadmin@gmail.com</a>
      </footer>
    </main>
  );
}
