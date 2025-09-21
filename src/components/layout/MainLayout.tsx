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
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const performSearch = async () => {
        setIsSearching(true);
        setShowSearchResults(true);

        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&role=${detectedRole}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Search failed');
          }

          const result = await response.json();
          
          if (result.success) {
            setSearchResults(result.data || []);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };

      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, detectedRole]);

  // Handle search result click
  const handleResultClick = (result: any) => {
    setShowSearchResults(false);
    setSearchQuery("");
    
    // Navigate to task detail page
    router.push(`/${detectedRole}/tasks/${result.id}`);
  };

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
                    placeholder="Tìm kiếm tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    className="w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 neumorphic-input"
                  />
                  <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <span className="text-sm text-gray-500">Đang tìm kiếm...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((result, index) => (
                            <div
                              key={`${result.type}-${result.id}-${index}`}
                              onClick={() => handleResultClick(result)}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                                  �
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{result.title}</h4>
                                  {result.description && (
                                    <p className="text-xs text-gray-500 truncate">{result.description}</p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                      Task
                                    </span>
                                    {result.status && (
                                      <span className="text-xs text-gray-400">• {result.status}</span>
                                    )}
                                    {result.priority && (
                                      <span className={`text-xs ${
                                        result.priority === 'urgent' ? 'text-red-500' :
                                        result.priority === 'high' ? 'text-orange-500' :
                                        result.priority === 'medium' ? 'text-yellow-500' :
                                        'text-green-500'
                                      }`}>
                                        • {result.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="text-2xl mb-2">🔍</div>
                          <p className="text-sm">Không tìm thấy kết quả cho &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      ) : null}
                    </div>
                  )}
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
