"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const headingsData: Heading[] = [];

    elements.forEach((element) => {
      const text = element.textContent || "";
      const id = element.id || text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      element.id = id;
      headingsData.push({
        id,
        text,
        level: parseInt(element.tagName.charAt(1)),
      });
    });

    setHeadings(headingsData);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`text-left text-sm hover:text-primary transition-colors ${
                activeId === heading.id ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}