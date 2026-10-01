"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav>
      {items.map((i) => {
        const active = i.href === "/portal" || i.href === "/admin" ? path === i.href : path.startsWith(i.href);
        return <Link key={i.href} href={i.href} className={`side-link${active ? " active" : ""}`}>{i.label}</Link>;
      })}
    </nav>
  );
}
