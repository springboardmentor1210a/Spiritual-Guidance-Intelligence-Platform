import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ChatWidget from "../chat/ChatWidget";

const SIDEBAR_W = "16rem"; // keep in sync with Sidebar's w-64

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-void flex">

      {/* Fixed sidebar from top */}
      <div
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
        style={{ width: SIDEBAR_W }}
      >
        <Sidebar />
      </div>

      {/* Scrollable main content */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: SIDEBAR_W }}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating Bottom-Right Chat Widget */}
      <ChatWidget />

    </div>
  );
}