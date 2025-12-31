import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
    { label: "Users", path: "/admin/users", icon: "people" },
    { label: "Posts", path: "/admin/posts", icon: "article" },
    { label: "Communities", path: "/admin/communities", icon: "groups" },
    { label: "Reports", path: "/admin/reports", icon: "flag" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navbar-bg border-r border-navbar-border pt-6 pl-6 pr-4 flex flex-col">
      {/* Logo / Title */}
      <div className="mb-8">
        <h1 className="font-fenix text-xl text-white font-normal">
          Admin Panel
        </h1>
        <p className="text-periwinkle text-xs mt-1">Management Hub</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive(item.path)
                ? "bg-medium-slate-blue text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-indigo"
            }`}
          >
            <span className="material-icons text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / Help */}
      <div className="border-t border-navbar-border pt-4 pb-6">
        <button className="w-full px-4 py-3 rounded-lg bg-dark-indigo text-periwinkle text-sm font-medium hover:bg-dark-indigo/80 transition">
          <span className="material-icons text-sm align-middle mr-2">help</span>
          Help & Support
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
