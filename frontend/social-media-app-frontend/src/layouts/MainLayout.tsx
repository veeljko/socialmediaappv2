import { Outlet } from "react-router-dom";
import Sidebar from "../myComponents/Sidebar";
import RightPanel from "../myComponents/RightPanel";
import { ScrollRestoration } from "react-router-dom";
import { useState } from "react";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background ">
      <div className="mx-auto flex max-w-7xl">

        <aside className="hidden w-64 lg:block">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="min-h-screen flex-1  border-neutral-800">
          <Outlet />

        </main>

        <aside className="hidden w-80 xl:block">
          <div className="sticky top-0 h-screen p-4">
            <RightPanel />
          </div>
        </aside>

      </div>
      {/* <img src = "https://picsum.photos/200/300/"></img>
        <img src = "https://picsum.photos/200/800/"></img>
        <img src = "https://picsum.photos/900/300/"></img> */}
        <ScrollRestoration
        getKey={(location, matches) => {
          return location.pathname;
        }}
      />
    </div>
  );
}