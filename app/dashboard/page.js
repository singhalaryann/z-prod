"use client";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Dashboard.module.css";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import TabFilter from "../components/dashboard/TabFilter";
import InsightCard from "../components/dashboard/InsightCard";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// Import your separate ExperimentContent component
import ExperimentContent from "../components/dashboard/ExperimentContent";
import GetMetrics from "../components/dashboard/GetMetrics";

export default function Dashboard() {
  const router = useRouter();
  const { userId } = useAuth();

  // State management
  const [selectedTime, setSelectedTime] = useState("30D");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "insights"
  );
  
  // NEW: Add state for insight filter tabs
  const [activeInsightTab, setActiveInsightTab] = useState("segment");
  
  // State variables for progressive loading
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Fixed game ID for insights as provided
  const GAME_ID = "ludogoldrush";

  // Cache duration in milliseconds (e.g., 5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Load cached data from localStorage on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        setIsInitialRender(false); // Mark initial render as complete
        
        // Check for cached insights data
        const cachedInsightsData = localStorage.getItem(`dashboard_insights_cache_${userId}`);
        
        let shouldFetchInsights = true;
        
        // Check if we have valid cached insights data
        if (cachedInsightsData) {
          const parsedCache = JSON.parse(cachedInsightsData);
          if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
            setInsights(parsedCache.data);
            setInsightsLoading(false);
            shouldFetchInsights = false;
            console.log('Loading insights from cache');
          }
        }
        
        // If we have insights from cache, set overall loading to false
        if (!shouldFetchInsights) {
          setLoading(false);
        }
        
        return { shouldFetchInsights };
      } catch (error) {
        console.error('Error loading cache:', error);
        return { shouldFetchInsights: true };
      }
    };

    if (userId) {
      const { shouldFetchInsights } = loadCachedData();
      
      // Fetch insights only if needed
      if (shouldFetchInsights) {
        fetchInsightsData();
      }
    }
  }, [userId]);

  // Function to fetch insights data independently with game_id
  const fetchInsightsData = async () => {
    // Check cache first
    const cachedInsightsData = localStorage.getItem(`dashboard_insights_cache_${userId}`);
    if (cachedInsightsData) {
      const parsedCache = JSON.parse(cachedInsightsData);
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        console.log('Loading insights from cache');
        setInsights(parsedCache.data);
        setInsightsLoading(false);
        return;
      }
    }

    try {
      setInsightsLoading(true);
      
      console.log('Fetching insights data with game_id:', GAME_ID);

      // API call to get-insights endpoint with game_id
      const response = await fetch(
        "https://get-insights-nrosabqhla-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            game_id: GAME_ID
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process insights data
      if (data.insights) {
        console.log('Received insights data:', data.insights);
        setInsights(data.insights);
        
        // Cache insights data
        try {
          localStorage.setItem(`dashboard_insights_cache_${userId}`, JSON.stringify({
            data: data.insights,
            timestamp: Date.now()
          }));
          console.log('Insights data cached successfully');
        } catch (cacheError) {
          console.error('Error caching insights data:', cacheError);
        }
      }
      
      setInsightsLoading(false);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching insights data:', error);
      setInsights([]);
      setInsightsLoading(false);
      setLoading(false);
    }
  };

  // Add effect to handle URL param changes
  useEffect(() => {
    // Update active tab when URL params change
    const tabParam = searchParams.get("tab");
    if (tabParam && ["insights", "experiments"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without full page reload
    router.push(`/dashboard?tab=${tab}`, { shallow: true });
  };

  // NEW: Handler for insight tab changes
  const handleInsightTabChange = (tabId) => {
    setActiveInsightTab(tabId);
    // You could also update URL if needed
    router.push(`/dashboard?tab=${activeTab}&insightTab=${tabId}`, { shallow: true });
  };

  // Effect to handle authentication only
  useEffect(() => {
    if (!userId) {
      router.push("/");
    }
  }, [userId, router]);

  // Handle time filter changes
  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
  };

  // Skeleton loading for insights
  const renderSkeletonInsights = () => (
    <div className={styles.insightsSection}>
      <div className={styles.insightsList}>
        {[1, 2, 3].map((index) => (
          <div key={index} className={`${styles.insightCard} ${styles.skeletonInsight}`}>
            <div className={styles.skeletonInsightContent}></div>
            <div className={styles.skeletonInsightButton}></div>
          </div>
        ))}
      </div>
    </div>
  );

  // NEW: Render insight tabs
  const renderInsightFilterTabs = () => (
    <div className={styles.insightTabsContainer}>
      <button
        className={`${styles.insightTab} ${activeInsightTab === "segment" ? styles.activeInsightTab : ''}`}
        onClick={() => handleInsightTabChange("segment")}
      >
        Segment Spectrum
      </button>
      <button
        className={`${styles.insightTab} ${activeInsightTab === "persona" ? styles.activeInsightTab : ''}`}
        onClick={() => handleInsightTabChange("persona")}
      >
        Persona Pulse
        {/* <span className={styles.tabIcon}>🟡</span> */}
      </button>
      <button
        className={`${styles.insightTab} ${activeInsightTab === "behavior" ? styles.activeInsightTab : ''}`}
        onClick={() => handleInsightTabChange("behavior")}
      >
        Behavior Atlas
      </button>
    </div>
  );

  // Render insights section with progressive loading
  const renderInsights = () => {
    if (isInitialRender) {
      return renderSkeletonInsights();
    }
    
    if (insightsLoading) {
      return renderSkeletonInsights();
    }

    if (insights.length === 0) {
      return <div className={styles.noData}>No insights available</div>;
    }

    return (
      <div className={styles.insightsSection}>
        <div className={styles.insightsList}>
          {insights.map((insight, index) => (
            <InsightCard
              key={`${insight.insight_id || index}`}
              description={insight.insight_text || insight.description || "No description available"}
              insight_id={insight.insight_id || `insight-${index}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render insights content 
  const renderInsightsContent = () => {
    // Show loading indicator for initial load only
    if (loading && isInitialRender) {
      return (
        <>
          {/* NEW: Render insight filter tabs here too, but disabled */}
          <div className={`${styles.insightTabsWrapper} ${styles.disabled}`}>
            {renderInsightFilterTabs()}
          </div>
          {renderSkeletonInsights()}
        </>
      );
    }

    // Otherwise render insights section with its own loading state
    return (
      <>
        {/* NEW: Add insight filter tabs */}
        <div className={styles.insightTabsWrapper}>
          {renderInsightFilterTabs()}
        </div>
        {renderInsights()}
        
        {/* Progressively loading indicator
        {insightsLoading && !isInitialRender && (
          <div className={styles.progressiveLoadingIndicator}>
            Loading more data...
          </div>
        )} */}
      </>
    );
  };

  // Main render
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.mainLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.filterSection}>
            <div className={styles.tabsContainer}>
              <DashboardTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                selectedTime={selectedTime}
                onTimeChange={handleTimeChange}
              >
                {activeTab === "insights" && (
                  <>
                    {renderInsightsContent()}
                    <GetMetrics 
                      selectedTime={selectedTime} 
                      onTimeChange={handleTimeChange} 
                    />
                  </>
                )}
              </DashboardTabs>
            </div>
            <div className={styles.filterContainer}>
              <TabFilter 
                selected={selectedTime} 
                onChange={handleTimeChange} 
                // Only disable during initial loading
                disabled={loading && isInitialRender}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}