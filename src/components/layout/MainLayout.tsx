"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import Sidebar from "./Sidebar";
import LogoutConfirmModal from "@/components/ui/LogoutConfirmModal";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { NotificationProvider } from "@/contexts/NotificationContext";

interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: "admin" | "team_leader" | "member";
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, userRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [detectedRole, setDetectedRole] = useState<
    "admin" | "team_leader" | "member"
  >("member");

  // Detect role from URL path or localStorage
  useEffect(() => {
    if (userRole) {
      setDetectedRole(userRole);
      return;
    }

    // Detect from URL path
    if (pathname.startsWith("/admin")) {
      setDetectedRole("admin");
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", "admin");
      }
    } else if (pathname.startsWith("/team_leader")) {
      setDetectedRole("team_leader");
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", "team_leader");
      }
    } else if (pathname.startsWith("/member")) {
      setDetectedRole("member");
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", "member");
      }
    } else {
      // Try to get from localStorage
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
          // Convert old 'manager' role to 'team_leader'
          const normalizedRole =
            storedRole === "manager" ? "team_leader" : storedRole;
          if (
            normalizedRole === "admin" ||
            normalizedRole === "team_leader" ||
            normalizedRole === "member"
          ) {
            setDetectedRole(normalizedRole);
          }
        }
      }
    }
  }, [pathname, userRole]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);

    // Simulate logout API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clear any stored auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }

    // Redirect to login page
    router.push("/auth/login");
  };
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar userRole={detectedRole} />

        {/* Main Content */}
        <main className={"ml-64 min-h-screen" + (isLoggingOut ? " " : "")}>
          {/* Header */}
          <header
            className="section-neumorphic shadow-sm px-8 py-4 sticky top-0 z-5"
            style={{
              borderRadius: "0 0px 0px 0 ",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage your teams efficiently
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationDropdown />

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 neumorphic-input"
                  />
                  <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-8">{children}</div>
        </main>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      </div>
    </NotificationProvider>
  );
};

export default MainLayout;
