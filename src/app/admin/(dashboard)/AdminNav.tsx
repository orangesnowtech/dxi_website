"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import styles from "../admin.module.css";

type NavItem = { href: string; label: string; superAdminOnly?: boolean };

/**
 * Grouped by what the work is about rather than listed flat: a single row of
 * links stopped fitting once there were ten of them, and a longer column is
 * only easier to scan if it is broken up.
 */
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Academy",
    items: [
      { href: "/admin", label: "Submissions" },
      { href: "/admin/referral-codes", label: "Referral codes" },
    ],
  },
  {
    title: "Events",
    items: [
      { href: "/admin/events", label: "Events" },
      { href: "/admin/check-in", label: "Check-in" },
      { href: "/admin/replays", label: "Replays" },
    ],
  },
  {
    title: "Clients",
    items: [{ href: "/admin/surveys", label: "Surveys" }],
  },
  {
    title: "Assistant",
    items: [
      { href: "/admin/chats", label: "Chats" },
      { href: "/admin/bot-rules", label: "Bot rules" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/links", label: "Links" },
      { href: "/admin/admins", label: "Manage admins", superAdminOnly: true },
    ],
  },
];

/** `/admin` is the Submissions page itself, so it only matches exactly. */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav({
  email,
  isSuperAdmin,
}: {
  email: string;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname() || "";
  /** Only matters on a narrow screen, where the links fold away. */
  const [open, setOpen] = useState(false);

  // Picking a page is the end of needing the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHead}>
        <span className={styles.adminBarBrand}>DXI Admin</span>
        <button
          type="button"
          className={styles.sidebarToggle}
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div id="admin-nav" className={`${styles.sidebarBody} ${open ? styles.sidebarOpen : ""}`}>
        <nav className={styles.sidebarNav} aria-label="Admin">
          {GROUPS.map((group) => {
            const items = group.items.filter((item) => isSuperAdmin || !item.superAdminOnly);

            return (
              <div key={group.title} className={styles.sidebarGroup}>
                <div className={styles.sidebarGroupTitle}>{group.title}</div>
                {items.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ""}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <span className={styles.adminBarEmail}>{email}</span>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
