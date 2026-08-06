import { Caveat } from "next/font/google";
import type { ReactNode } from "react";

const photographyCaveat = Caveat({
  variable: "--font-photography-caveat",
  weight: ["400", "600"],
  style: "normal",
  subsets: ["latin"],
});

export default function PhotographyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={photographyCaveat.variable}>{children}</div>;
}
