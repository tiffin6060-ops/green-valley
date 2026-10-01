"use client";
import { useState } from "react";
import { opportunities } from "@/data/site";

export default function OpportunityGrid() {
  const [all, setAll] = useState(false);
  const list = all ? opportunities : opportunities.slice(0, 3);
  return (
    <>
      <div className="opportunity-grid">
        {list.map((o) => (
          <article className="opp-card" key={o.title}>
            <span className="tag">{o.tag}</span>
            <h3>{o.title}</h3>
            <p>{o.text}</p>
            <div className="opp-meta"><span>{o.amount}</span><span>{o.cycle}</span></div>
          </article>
        ))}
      </div>
      {!all && (
        <div className="center">
          <button className="btn dark" onClick={() => setAll(true)}>View all opportunities</button>
        </div>
      )}
    </>
  );
}
