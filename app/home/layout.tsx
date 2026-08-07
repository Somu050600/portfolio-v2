import HomeProviders from "@/components/home/HomeProviders";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeProviders>
      <div className="font-body">
        <SmoothScroll>{children}</SmoothScroll>
      </div>
    </HomeProviders>
  );
}
