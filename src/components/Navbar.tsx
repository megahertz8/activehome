"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/score", label: "Score My Home" },
  { href: "/roi", label: "ROI Calculator" },
  { href: "/contractors", label: "Find Contractors" },
  { href: "/features", label: "Features" },
  { href: "/guides", label: "Guides" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary">
          Evolving Home
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/dashboard">
              <Button size="sm" variant="outline">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">Sign Up</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="flex flex-col px-4 py-3 gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
