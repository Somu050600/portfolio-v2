import type { ReactNode } from "react";
import HomeProviders from "@/components/home/HomeProviders";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <HomeProviders>{children}</HomeProviders>;
}
