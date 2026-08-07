import type { ReactNode } from "react";

export default function CaseStudyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="font-body">{children}</div>
  );
}
