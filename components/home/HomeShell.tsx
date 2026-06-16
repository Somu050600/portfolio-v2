import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <Sidebar />
      <div className="home-content min-w-0 flex-1 lg:ml-0">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
