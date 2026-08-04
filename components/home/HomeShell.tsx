import type { ReactNode } from "react";
import HomeFooter from "./HomeFooter";
import Sidebar from "./Sidebar";

export default function HomeShell({
  children,
  showMobileFooter = true,
}: {
  children: ReactNode;
  showMobileFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink lg:flex-row">
      <Sidebar />
      <div className="home-content flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
        {showMobileFooter && <HomeFooter />}
      </div>
    </div>
  );
}
