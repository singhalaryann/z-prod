"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import styles from "../../../styles/Sidebar.module.css";
// Import authentication and login modal components
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../common/LoginModal";

const Sidebar = () => {
  // Initialize routing and authentication hooks
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  
  // State management for login modal and redirection
  // COMMENTED: Login modal state management
  // const [showLoginModal, setShowLoginModal] = useState(false);
  // const [redirectPath, setRedirectPath] = useState(null);
  
  // Determine active page for menu item highlighting
  const isDashboardActive = pathname === "/";
  const isAnalyticsActive = pathname === "/analytics";
  
  // Handle navigation with authentication check
  const handleNavigation = (path) => {
    // Validate path input
    if (typeof path !== "string") {
      console.error("Invalid path:", path);
      return;
    }
    
    // COMMENTED: Auth check for navigation
    // if (!userId) {
    //   // If not logged in, show login modal and store intended path
    //   setRedirectPath(path);
    //   setShowLoginModal(true);
    // } else {
    //   // If logged in, proceed with navigation
    //   router.push(path);
    // }
    
    // Direct navigation without auth check
    router.push(path);
  };
  
  // COMMENTED: Login success handler
  // const handleLoginSuccess = () => {
  //   // Reset redirect path to keep user on current page
  //   setRedirectPath(null);
  // };
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.glassEffect}>
        {/* Liveops/Dashboard Menu Item */}
        <div className={styles.menuItem}>
          <div
            className={`${styles.menuLink} ${isDashboardActive ? styles.active : ""}`}
            onClick={() => handleNavigation("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNavigation("/")}
          >
            <div className={styles.menuIcon}>
              <Image
                src="/dashboard_icon.svg"
                alt="Dashboard"
                width={30}
                height={30}
                className={`${styles.icon} ${isDashboardActive ? styles.activeIcon : ""}`}
                priority
              />
            </div>
            <span className={styles.menuText}>Liveops</span>
          </div>
        </div>
        
        {/* User Analytics Menu Item */}
        <div className={styles.menuItem}>
          <div
            className={`${styles.menuLink} ${isAnalyticsActive ? styles.active : ""}`}
            onClick={() => handleNavigation("/analytics")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNavigation("/analytics")}
          >
            <div className={styles.menuIcon}>
              <Image
                src="/user-analytics.svg"
                alt="User Analytics"
                width={30}
                height={30}
                className={`${styles.icon} ${isAnalyticsActive ? styles.activeIcon : ""}`}
                priority
              />
            </div>
            <span className={styles.menuText}>User Analytics</span>
          </div>
        </div>
      </div>
      
      {/* COMMENTED: Login Modal */}
      {/* {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          redirectPath={redirectPath}
        />
      )} */}
    </aside>
  );
};

export default Sidebar;