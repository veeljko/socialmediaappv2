import { Outlet } from "react-router-dom";
import Sidebar from "../myComponents/Sidebar";
import RightPanel from "../myComponents/RightPanel";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background ">
      <div className="mx-auto flex max-w-7xl">
        
        {/* LEFT SIDEBAR */}
        <aside className="hidden w-64 lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="min-h-screen flex-1 border-x border-neutral-800">
          <Outlet />
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden w-80 xl:block">
          <div className="sticky top-0 h-screen p-4">
            <RightPanel />
          </div>
        </aside>

      </div>
    </div>
  );
}