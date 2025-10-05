import React, { useState } from "react";
import Logo from "../assets/BytehiveLogo.png";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/profileContext";
import { useNotifications } from "../context/NotificationContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useProfile()
  const { unReadCount } = useNotifications()
  const navigate = useNavigate()

  return (
    <header className="bg-navbar-bg backdrop-blur-sm sticky top-0 z-50 border-b border-navbar-border">
      <div className="container mx-auto px-5 sm:px-7 lg:px-10">
        <div className="flex justify-between items-center py-3">
          {/* LOGO + TITLE */}
          <div className="flex items-center space-x-1">
            <img src={Logo} alt="ByteHive Logo" className="w-14 h-14 object-contain" />
            <a href="/" >
              <h1 className="font-fenix text-3xl tracking-wide text-white">
                Bytehive
              </h1>
            </a>

          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-3 text-xl">
              <a className="flex flex-col items-center text-columbia-blue hover:text-white transition-colors group" href="/events">
                <div className="p-3 rounded-md bg-rich-black-light group-hover:bg-periwinkle-light transition-colors flex items-center justify-center">
                  <span className="material-icons text-4xl">grid_view</span>
                </div>
              </a>
              <a className="flex flex-col items-center text-columbia-blue hover:text-white transition-colors group" href="#">
                <div className="p-3 rounded-md bg-rich-black-light group-hover:bg-periwinkle-light transition-colors flex items-center justify-center">
                  <span className="material-icons text-4xl">bookmark</span>
                </div>
              </a>
              <a className="flex flex-col items-center text-columbia-blue hover:text-white transition-colors group" href="#">
                <div className="p-3 rounded-md bg-rich-black-light group-hover:bg-periwinkle-light transition-colors flex items-center justify-center">
                  <span className="material-icons text-4xl">groups</span>
                </div>
              </a>
            </nav>

            {/* Right side (desktop) */}
            <div className="flex items-center space-x-3">
              <a className="flex items-center text-pinkish hover:text-pinkish-dark transition-colors group relative" href="#">
                <div className="p-3 rounded-md bg-rich-black-light group-hover:bg-periwinkle-light transition-colors flex items-center justify-center space-x-1">
                  <span className="material-icons text-4xl" style={{ color: "var(--pinkish)" }}>
                    local_fire_department
                  </span>
                  <span className="text-columbia-blue text-sm font-bold">2</span>
                </div>
              </a>

              <button onClick={() => navigate("/notification")} className="text-columbia-blue hover:text-white p-3 rounded-full hover:bg-periwinkle-light transition-colors relative flex items-center justify-center cursor-pointer">
                <span className="material-icons text-3xl">notifications</span>
                {unReadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-3 w-3 rounded-full bg-medium-slate-blue"></span>
                )}
              </button>

              <button className="flex items-center justify-center" onClick={() => navigate("/profile")}>
                <img
                  alt="User avatar"
                  className="w-11 h-11 rounded-full border-2 border-transparent hover:border-periwinkle transition-all cursor-pointer"
                  src={profile?.profileImage}
                />
              </button>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-columbia-blue hover:text-white p-3 rounded-md hover:bg-periwinkle-light transition-colors"
            >
              <span className="material-icons text-4xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navbar-bg border-t border-navbar-border px-7 py-5 space-y-5 text-lg">
          <a href="#" className="flex items-center space-x-4 text-columbia-blue hover:text-white transition-colors">
            <span className="material-icons text-2xl">groups</span>
            <span>Communities</span>
          </a>
          <a href="#" className="flex items-center space-x-4 text-columbia-blue hover:text-white transition-colors">
            <span className="material-icons text-2xl">event</span>
            <span>Events</span>
          </a>
          <a href="#" className="flex items-center space-x-4 text-columbia-blue hover:text-white transition-colors">
            <span className="material-icons text-2xl">bookmark</span>
            <span>Saved</span>
          </a>
          <a href="#" className="flex items-center space-x-4 text-pinkish hover:text-pinkish-dark transition-colors">
            <span className="material-icons text-2xl">local_fire_department</span>
            <span>Streak</span>
          </a>
          <a href="#" className="flex items-center space-x-4 text-columbia-blue hover:text-white transition-colors">
            <span className="material-icons text-2xl">account_circle</span>
            <span>Profile</span>
          </a>
        </div>
      )}
    </header>
  );
}
