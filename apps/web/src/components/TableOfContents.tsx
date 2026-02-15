"use client";

import { useEffect, useState } from "react";

type Heading = { level: number; text: string; id: string };

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="text-[13px]">
      <div className="text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-3">목차</div>
      <ul className="list-none p-0 m-0 flex flex-col gap-1">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block py-1 no-underline transition-colors ${
                h.level === 3 ? "pl-3" : ""
              } ${
                activeId === h.id
                  ? "text-[#fafafa] font-medium"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
