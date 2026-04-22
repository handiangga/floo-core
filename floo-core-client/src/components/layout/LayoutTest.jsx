import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen w-full bg-gradient-to-r from-slate-100 to-slate-200">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
