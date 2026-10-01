"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <a className="brand" href="/#home" aria-label="Trishal Green Valley home">
        <span className="brand-mark">GV</span>
        <span><b>TRISHAL</b><strong>GREEN VALLEY</strong><small>Integrated Commercial Farming</small></span>
      </a>
      <button className="menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
      <nav className={open ? "open" : ""}>
        <a href="/#project" onClick={close}>The Project</a>
        <a href="/#investment" onClick={close}>Investment</a>
        <a href="/#progress" onClick={close}>Progress</a>
        <a href="/#live" onClick={close}>Live Farm</a>
        <a href="/#about" onClick={close}>About</a>
        <a href="/#contact" onClick={close}>Contact</a>
        <a className="nav-outline" href="/#visit" onClick={close}>Book a Visit</a>
        <Link className="nav-solid" href="/portal" onClick={close}>Investor Login</Link>
      </nav>
    </header>
  );
}
