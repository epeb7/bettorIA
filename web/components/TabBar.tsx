"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./TabBar.module.css";

const TABS = [
  {
    href: "/",
    label: "Hoje",
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />
      </svg>
    ),
  },
  {
    href: "/historico",
    label: "Histórico",
    icon: (active: boolean) => (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  // /historico/[qualquer coisa futura] também conta como aba "Histórico" ativa
  const activeIndex = pathname.startsWith("/historico") ? 1 : 0;

  return (
    <nav className={styles.bar} aria-label="Navegação principal">
      <div
        className={styles.indicator}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {TABS.map((tab, i) => {
        const active = i === activeIndex;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.icon(active)}
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
