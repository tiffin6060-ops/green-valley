import Link from "next/link";
import Header from "@/components/Header";
import OpportunityGrid from "@/components/OpportunityGrid";
import VisitForm from "@/components/VisitForm";
import { categories } from "@/data/site";
import { db } from "@/lib/db";
import { dateOnly } from "@/lib/format";
import { getSetting } from "@/lib/settings";
import { parsePublicVideo } from "@/lib/video";

export const revalidate = 60;

export default async function Home() {
  let updates: Awaited<ReturnType<typeof db.list>> = [];
  try { updates = await db.list("project_updates", { published: true }, 3); } catch { /* fall back to demo content */ }
  const latest = updates[0];
  let video: ReturnType<typeof parsePublicVideo> = null;
  try { const v = await getSetting("public_video_url"); video = v ? parsePublicVideo(v) : null; } catch { /* no video */ }
  return (
    <>
      <Header />
      <main id="home">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow light">TRISHAL • MYMENSINGH • BANGLADESH</p>
            <h1>Farming you can<br /><em>see and understand.</em></h1>
            <p className="hero-copy">An integrated commercial farming and agro-tourism project designed around real operations, structured participation and transparent project updates.</p>
            <div className="actions">
              <a className="btn primary" href="#investment">Explore Investment</a>
              <a className="btn ghost" href="#progress">See Project Progress</a>
            </div>
            <p className="micro">Investment information is provided for evaluation and due diligence. Illustrations are not guaranteed returns.</p>
          </div>
        </section>

        <section className="stats" id="project">
          <div><strong>32+</strong><span>Bigha project area*</span></div>
          <div><strong>20</strong><span>Year operating horizon*</span></div>
          <div><strong>10+</strong><span>Planned farm categories</span></div>
          <div><strong>Live</strong><span>Monitoring planned</span></div>
        </section>
        <p className="data-note">*Replace/verify all project figures before production launch.</p>

        <section className="section intro">
          <div>
            <p className="eyebrow">THE PROJECT</p>
            <h2>One valley.<br />Multiple farming operations.</h2>
          </div>
          <div>
            <p className="lead">Trishal Green Valley brings multiple agricultural activities into one integrated project—from livestock and fisheries to orchards and agro-tourism.</p>
            <a className="text-link" href="#ecosystem">Explore the ecosystem →</a>
          </div>
        </section>

        <section className="ecosystem" id="ecosystem">
          <div className="map-card">
            <div className="map-copy">
              <span>MASTERPLAN PREVIEW</span>
              <h3>Replace this panel with your approved aerial masterplan.</h3>
              <p>Keep the real map clean. Let users click categories for details instead of filling the map with text.</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map(([icon, name]) => (
              <article className="category-card" key={name}><span>{icon}</span><b>{name}</b></article>
            ))}
          </div>
        </section>

        <section className="section investment" id="investment">
          <div className="section-head">
            <div><p className="eyebrow">INVESTMENT</p><h2>Explore opportunities</h2></div>
            <p>Start with a category. Review the model, operating cycle, assumptions, risks and documents before making a decision.</p>
          </div>
          <OpportunityGrid />
        </section>

        <section className="section proof" id="progress">
          <div className="section-head">
            <div><p className="eyebrow">PROJECT PROGRESS</p><h2>See the valley grow.</h2></div>
            <p>Use dated, real project evidence here. Avoid stock photography and vague progress claims.</p>
          </div>
          <div className="progress-layout">
            <div className="progress-feature">
              <div className="photo-placeholder"><span>ADD LATEST REAL FARM PHOTO / VIDEO</span></div>
              <div className="progress-meta">
                <div><small>{latest ? "LATEST UPDATE" : "LATEST UPDATE • DEMO"}</small><h3>{latest?.title ?? "Cattle shed development"}</h3></div>
                <strong>{latest ? `${latest.progress_pct}%` : "72%*"}</strong>
              </div>
              <div className="bar"><i style={{ width: `${latest?.progress_pct ?? 72}%` }} /></div>
              {!latest && <p>*Demo content only. Replace with verified project progress.</p>}
            </div>
            <div className="timeline">
              {updates.length > 0 ? updates.map((u) => (
                <article key={u.id}><time>{dateOnly(u.created_at).toUpperCase()}</time><h3>{u.title}</h3><p>{u.body}</p></article>
              )) : (<>
                <article><time>29 SEP 2026</time><h3>Development update</h3><p>Add a short factual update with real photos and evidence.</p></article>
                <article><time>15 SEP 2026</time><h3>Operating structure</h3><p>Add approved project milestone and supporting material.</p></article>
                <article><time>01 SEP 2026</time><h3>Site preparation</h3><p>Add the earliest verified progress update here.</p></article>
              </>)}
            </div>
          </div>
        </section>

        <section className="section live" id="live">
          <div className="section-head">
            <div><p className="eyebrow">LIVE FARM</p><h2>See the farm.</h2></div>
            <p>Watch the farm in action. Live CCTV access is available to verified investors after onboarding.</p>
          </div>
          <div className="live-grid">
            <div className="video-frame">
              {video?.kind === "iframe" && (
                <iframe src={video.src} title="Trishal Green Valley farm video" loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              )}
              {video?.kind === "mp4" && <video src={video.src} controls preload="metadata" playsInline />}
              {!video && <div className="photo-placeholder" style={{ height: "100%" }}><span>FARM VIDEO — ADD IN ADMIN → LIVE &amp; VIDEO</span></div>}
            </div>
            <aside className="cctv-lock">
              <span className="lock" aria-hidden>🔒</span>
              <small>LIVE CCTV</small>
              <h3>Investor access only</h3>
              <p>Real-time camera feeds from the farm are private. Sign in with the account created during your onboarding.</p>
              <Link className="btn dark" href="/portal/live">Sign in to watch live</Link>
            </aside>
          </div>
        </section>

        <section className="transparency">
          <div className="section-head light-head">
            <div><p className="eyebrow light">TRANSPARENCY</p><h2>Know what is happening.</h2></div>
            <p>After onboarding, authorized investors can be given access to selected monitoring, reports and documents.</p>
          </div>
          <div className="trans-grid">
            <article><b>01</b><h3>Live Farm Monitoring</h3><p>Selected CCTV feeds through secure role-based access.</p></article>
            <article><b>02</b><h3>Project Updates</h3><p>Dated photo, video and operational progress updates.</p></article>
            <article><b>03</b><h3>Financial Reporting</h3><p>Investor-specific statements and distribution records.</p></article>
            <article><b>04</b><h3>Document Access</h3><p>Relevant agreements and reports in a secure vault.</p></article>
          </div>
          <Link className="btn light-btn" href="/portal">Investor Portal</Link>
        </section>

        <section className="section about" id="about">
          <div><p className="eyebrow">OPERATING MODEL</p><h2>Clear roles.<br />Clear accountability.</h2></div>
          <div className="about-copy">
            <p><b>FNF Corporation</b><br /><span>Add the approved legal/operating role here.</span></p>
            <p><b>Tiffin — Operating Partner</b><br /><span>Add the approved operational responsibilities here.</span></p>
            <p className="notice">Important: clearly disclose the land-use structure, operator roles, investment terms and material risks. Do not imply land ownership or guaranteed returns unless legally and factually accurate.</p>
          </div>
        </section>

        <section className="visit" id="visit">
          <div>
            <p className="eyebrow light">PRIVATE FARM VISIT</p>
            <h2>Visit before you decide.</h2>
            <p>See the project, meet the team and ask questions before proceeding to due diligence.</p>
          </div>
          <VisitForm />
        </section>

        <section className="final-cta" id="contact">
          <p className="eyebrow">NEXT STEP</p>
          <h2>Understand first.<br />Then decide.</h2>
          <p>Request project information, arrange a private visit and review relevant documents before making an investment decision.</p>
          <div className="actions center-actions">
            <a className="btn dark" href="#visit">Book a Visit</a>
            <Link className="btn outline-dark" href="/portal">Investor Login</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark">GV</span><span><b>TRISHAL</b><strong>GREEN VALLEY</strong></span></div>
        <p>Integrated Commercial Farming &amp; Agro-Tourism</p>
        <p>© 2026 Trishal Green Valley. Replace contact, legal and privacy information before launch.</p>
      </footer>
    </>
  );
}
