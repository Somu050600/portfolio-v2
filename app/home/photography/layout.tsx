import { photographyAccentFont } from "@/app/fonts/photography";
import type { ReactNode } from "react";

export default function PhotographyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={photographyAccentFont.variable}>{children}</div>;
}
