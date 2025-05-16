'use client';
import React, { useEffect } from 'react';
import styles from "../styles/Dashboard.module.css";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import TabFilter from "./components/dashboard/TabFilter";
import InsightCard from "./components/dashboard/InsightCard";
import DashboardTabs from "./components/dashboard/DashboardTabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import ExperimentContent from "./components/dashboard/ExperimentContent";
import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";

// Import all the necessary components and functionality from dashboard/page.js
export default function Home() {
  const router = useRouter();
  const { userId } = useAuth();

  // Helper to format dates for API (DD-MM-YYYY format)
  const formatApiDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateStr);
        return '';
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  // State management
  // Check localStorage for previously selected time filter
  const savedTimeFilter = localStorage.getItem(`dashboard_current_filter_${userId}`);
  const [selectedTime, setSelectedTime] = useState(savedTimeFilter || "30D");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );
  
  // State for between format date filter (used by Overview metrics)
  const [apiDateFilter, setApiDateFilter] = useState({ 
    type: "between", 
    start_date: "", 
    end_date: "" 
  });
  
  const [globalDateFilter, setGlobalDateFilter] = useState(() => {
    // If there's a saved time filter, convert it to the appropriate date filter format
    if (savedTimeFilter) {
      if (savedTimeFilter === "Today") {
        return { type: "last", days: 0 };
      } else if (savedTimeFilter === "Yesterday") {
        return { type: "last", days: 1 };
      } else if (savedTimeFilter === "7D") {
        return { type: "last", days: 7 };
      } else if (savedTimeFilter === "30D") {
        return { type: "last", days: 30 };
      } else if (savedTimeFilter === "3M") {
        return { type: "last", days: 90 };
      } else if (savedTimeFilter === "6M") {
        return { type: "last", days: 180 };
      } else if (savedTimeFilter === "12M") {
        return { type: "last", days: 365 };
      } else if (savedTimeFilter.includes(" - ")) {
        // Parse date range like "Apr 1, 2025 - Apr 15, 2025"
        const [start, end] = savedTimeFilter.split(" - ");
        return { 
          type: "between", 
          start_date: formatApiDate(start.trim()),
          end_date: formatApiDate(end.trim())
        };
      } else if (savedTimeFilter.startsWith("Since ")) {
        // Parse "Since Apr 1, 2025"
        const sinceDate = savedTimeFilter.replace("Since ", "").trim();
        return { 
          type: "since", 
          start_date: formatApiDate(sinceDate)
        };
      } else if (savedTimeFilter.startsWith("Last ")) {
        // Parse "Last 45 days"
        const daysText = savedTimeFilter.replace("Last ", "").replace(" days", "").trim();
        const days = parseInt(daysText);
        if (!isNaN(days)) {
          return { type: "last", days: days };
        }
      }
    }
    // Default to 30 days if no saved filter or unrecognized format
    return { type: "last", days: 30 };
  });
  
  // State variables for progressive loading
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // State for pending insights count
  const [pendingInsightsCount, setPendingInsightsCount] = useState(0);
  
  // State for failed insights count
  const [failedInsightsCount, setFailedInsightsCount] = useState(0);
  
  // State for generate insights button
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState(null);

  // Fixed game ID for insights as provided
  const GAME_ID = "ludogoldrush";

  // Cache duration in milliseconds (e.g., 5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Define the data limit date
  const DATA_LIMIT_DATE = new Date('2025-04-03'); // April 3, 2025
  
  // Polling interval for checking insight generation status (30 seconds)
  const POLLING_INTERVAL = 30 * 1000;
  
  // Define technique sequences for insight generation
  const TECHNIQUES_SEQUENCE = ["behaviour", "bartle", "rfe"];

  // Convert selectedTime to API date filter format (between format for Overview)
  useEffect(() => {
    console.log('Dashboard - Time filter changed to:', selectedTime);
    
    if (!selectedTime) {
      console.log('Dashboard - No selectedTime provided');
      return;
    }
    
    let endDate, startDate;
    const today = new Date();

    // Check if the selectedTime includes a date range (from TabFilter's custom date)
    if (selectedTime.includes(" - ")) {
      const [startStr, endStr] = selectedTime.split(" - ");
      const parsedEndDate = new Date(endStr.trim());
      
      // If selected end date is after data limit, use Apr 2-3 range
      if (parsedEndDate > DATA_LIMIT_DATE) {
        console.log('Dashboard - Using fixed Apr 2-3 range due to data limit');
        endDate = new Date('2025-04-03');
        startDate = new Date('2025-04-02');
      } else {
        // Otherwise use the selected range, but ensure start date is end date - 1
        endDate = parsedEndDate;
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
      }
    } 
    // Handle "Since" date format
    else if (selectedTime.startsWith("Since ")) {
      const sinceStr = selectedTime.replace("Since ", "");
      const sinceDate = new Date(sinceStr);
      
      // If since date is after data limit, use Apr 2-3 range
      if (sinceDate > DATA_LIMIT_DATE) {
        console.log('Dashboard - Using fixed Apr 2-3 range due to data limit');
        endDate = new Date('2025-04-03');
        startDate = new Date('2025-04-02');
      } else {
        // Otherwise use today as end date and ensure start date is end date - 1
        endDate = today < DATA_LIMIT_DATE ? today : DATA_LIMIT_DATE;
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
      }
    }
    // Handle "Last X days" format
    else if (selectedTime.startsWith("Last ")) {
      const daysText = selectedTime.replace("Last ", "").replace(" days", "");
      const days = parseInt(daysText);
      
      if (!isNaN(days)) {
        endDate = today < DATA_LIMIT_DATE ? today : DATA_LIMIT_DATE;
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
      } else {
        console.log('Dashboard - Invalid days value, using default');
        endDate = today < DATA_LIMIT_DATE ? today : DATA_LIMIT_DATE;
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
      }
    }
    // Handle preset values (Today, Yesterday, 7D, 30D, etc.)
    else {
      // For all preset values, ensure we don't exceed data limit
      const maxEndDate = today < DATA_LIMIT_DATE ? today : DATA_LIMIT_DATE;
      
      switch(selectedTime) {
        case "Today":
          endDate = maxEndDate;
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "Yesterday":
          endDate = new Date(maxEndDate);
          endDate.setDate(maxEndDate.getDate() - 1);
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "7D":
        case "30D":
        case "3M":
        case "6M":
        case "12M":
          // All these presets should use the same logic - end date is today/max date
          // and start date is end date - 1
          endDate = maxEndDate;
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
          break;
        default:
          console.log('Dashboard - Unknown time filter, using default');
          endDate = maxEndDate;
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
      }
    }
    
    // Format dates for API
    const formattedStartDate = formatApiDate(startDate);
    const formattedEndDate = formatApiDate(endDate);
    
    // Create the between format for API
    const newApiDateFilter = {
      type: "between",
      start_date: formattedStartDate,
      end_date: formattedEndDate
    };
    
    console.log('Dashboard - Converted to API date filter:', newApiDateFilter);
    setApiDateFilter(newApiDateFilter);
    
  }, [selectedTime]);

  // Function to generate insights with all techniques in parallel
  const generateInsights = async () => {
    try {
      // Set state to show generation is in progress
      setGeneratingInsights(true);
      setGenerationStep(0);
      setGenerationError(null);
      
      // Cache the generation state
      localStorage.setItem(`dashboard_generation_state_${userId}`, JSON.stringify({
        inProgress: true,
        step: 0,
        timestamp: Date.now()
      }));
      
      // Create an array of promises for all three technique API calls
      const techniquePromises = TECHNIQUES_SEQUENCE.map(technique => {
        console.log(`Starting generation with technique: ${technique}`);
        return fetch(
          "https://generate-insight-bulk-nrosabqhla-uc.a.run.app",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              game_id: GAME_ID,
              date_filter: globalDateFilter,
              metric_sets: ["engagement", "balance", "progression"],
              techniques: [technique]
            }),
          }
        );
      });
      
      // Execute all API calls in parallel
      const responses = await Promise.all(techniquePromises);
      
      // Check if any responses were not OK
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          console.error(`Error with technique ${TECHNIQUES_SEQUENCE[i]}: ${responses[i].status}`);
        } else {
          console.log(`Successfully started generation with technique: ${TECHNIQUES_SEQUENCE[i]}`);
        }
      }
      
      // Start a single polling process to check all techniques
      startPollingForAllTechniques();
      
    } catch (error) {
      console.error('Error starting insight generation:', error);
      setGeneratingInsights(false);
      setGenerationError('Failed to start insight generation. Please try again later.');
      
      // Clear the generation state
      localStorage.removeItem(`dashboard_generation_state_${userId}`);
    }
  };

  // Function to poll for all techniques at once
  const startPollingForAllTechniques = () => {
    console.log('Starting polling for all techniques');
    
    // Set an interval to poll for status
    const pollingId = setInterval(async () => {
      try {
        // Check if any new pending insights have completed
        const response = await fetch(
          "https://get-insights-nrosabqhla-uc.a.run.app",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              game_id: GAME_ID,
              date_filter: globalDateFilter
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Count pending insights
        let pendingCount = 0;
        if (data.insights && data.insights.length > 0) {
          pendingCount = data.insights.filter(item => item.status === "pending").length;
        }
        
        console.log(`Polling check: ${pendingCount} insights still pending`);
        
        // If no more pending insights, all techniques are complete
        if (pendingCount === 0) {
          // Clear this polling interval
          clearInterval(pollingId);
          
          // Refresh the insights data
          fetchInsightsData();
          
          // All techniques completed
          console.log('All insight generation techniques completed successfully');
          setGeneratingInsights(false);
          
          // Clear the generation state
          localStorage.removeItem(`dashboard_generation_state_${userId}`);
        } else {
          // Refresh insights data anyway to show progress
          fetchInsightsData();
        }
      } catch (error) {
        console.error('Error during generation polling:', error);
        clearInterval(pollingId);
        setGenerationError('An error occurred during insight generation. Some insights may be incomplete.');
        
        // Don't stop the process completely, just show the error
        // We'll still try to complete monitoring
      }
    }, POLLING_INTERVAL);
    
    // Store the interval ID to clear it if the component unmounts
    return pollingId;
  };

  // UPDATED: Helper function to detect page reload
  const isPageReload = () => {
    // Check if the performance API is available
    if (typeof performance !== 'undefined' && performance.navigation) {
      // performance.navigation.type === 1 indicates a page reload
      return performance.navigation.type === 1;
    }
    
    // Alternative method for browsers that don't support performance.navigation
    if (typeof window !== 'undefined') {
      // If selectedTime is default (30D) and there's cached data from a different filter,
      // it's likely a page reload
      const cachedFilter = localStorage.getItem(`dashboard_current_filter_${userId}`);
      if (selectedTime === "30D" && cachedFilter && cachedFilter !== "30D") {
        return true;
      }
    }
    
    return false;
  };

  // UPDATED: Load cached data from localStorage on mount with page reload detection
  useEffect(() => {
    const loadCachedData = () => {
      try {
        setIsInitialRender(false); // Mark initial render as complete
        
        // ADDED: Check if this is a page reload and clear cache if it is
        if (isPageReload()) {
          console.log('Dashboard - Page reload detected, clearing cache to match current filter');
          localStorage.removeItem(`dashboard_insights_cache_${userId}`);
          localStorage.removeItem(`dashboard_pending_insights_count_${userId}`);
          localStorage.removeItem(`dashboard_failed_insights_count_${userId}`);
          localStorage.removeItem(`dashboard_generation_state_${userId}`);
          
          // Store current filter for future reference
          localStorage.setItem(`dashboard_current_filter_${userId}`, selectedTime);
          
          return { shouldFetchInsights: true };
        }
        
        // Check for cached insights data
        const cachedInsightsData = localStorage.getItem(`dashboard_insights_cache_${userId}`);
        // Add cached pending count
        const cachedPendingCount = localStorage.getItem(`dashboard_pending_insights_count_${userId}`);
        // Check for cached failed count
        const cachedFailedCount = localStorage.getItem(`dashboard_failed_insights_count_${userId}`);
        
        // Check for cached generation state
        const cachedGenerationState = localStorage.getItem(`dashboard_generation_state_${userId}`);
        
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
        
        // Check if we have valid cached pending count
        if (cachedPendingCount) {
          const parsedCache = JSON.parse(cachedPendingCount);
          if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
            setPendingInsightsCount(parsedCache.count);
            console.log('Loading pending insights count from cache');
          }
        }
        
        // Check if we have valid cached failed count
        if (cachedFailedCount) {
          const parsedCache = JSON.parse(cachedFailedCount);
          if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
            setFailedInsightsCount(parsedCache.count);
            console.log('Loading failed insights count from cache');
          }
        }
        
        // Restore generation state if any
        if (cachedGenerationState) {
          const parsedGenState = JSON.parse(cachedGenerationState);
          // Only restore if generation was in progress and not too old (within 1 hour)
          if (parsedGenState.inProgress && (Date.now() - parsedGenState.timestamp < 60 * 60 * 1000)) {
            setGeneratingInsights(true);
            setGenerationStep(parsedGenState.step || 0);
            
            // UPDATED: Use the parallel polling method instead of sequential
            startPollingForAllTechniques();
            
            console.log('Resuming insight generation process');
          }
        }
        
        // Store current filter for future reference
        localStorage.setItem(`dashboard_current_filter_${userId}`, selectedTime);
        
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
  }, [userId, selectedTime]); // UPDATED: Added selectedTime as dependency

  // Function to fetch insights data from API with proper processing
  const fetchInsightsData = async () => {
    // Check cache first
    const cachedInsightsData = localStorage.getItem(`dashboard_insights_cache_${userId}`);
    const cachedPendingCount = localStorage.getItem(`dashboard_pending_insights_count_${userId}`);
    const cachedFailedCount = localStorage.getItem(`dashboard_failed_insights_count_${userId}`);
    
    if (cachedInsightsData && cachedPendingCount && cachedFailedCount) {
      const parsedCache = JSON.parse(cachedInsightsData);
      const parsedPendingCache = JSON.parse(cachedPendingCount);
      const parsedFailedCache = JSON.parse(cachedFailedCount);
      
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION &&
          Date.now() - parsedPendingCache.timestamp < CACHE_DURATION &&
          Date.now() - parsedFailedCache.timestamp < CACHE_DURATION) {
        console.log('Loading insights, pending count, and failed count from cache');
        setInsights(parsedCache.data);
        setPendingInsightsCount(parsedPendingCache.count);
        setFailedInsightsCount(parsedFailedCache.count);
        setInsightsLoading(false);
        setLoading(false);
        return;
      }
    }

    try {
      setInsightsLoading(true);
      
      console.log('Fetching insights data with game_id:', GAME_ID);

      // API call to get-insights endpoint with game_id and date filter
      const response = await fetch(
        "https://get-insights-nrosabqhla-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: GAME_ID,
            date_filter: globalDateFilter
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process insights data to extract successful insights and count pending ones
      if (data.insights && data.insights.length > 0) {
        console.log('Received insights data:', data.insights);
        
        const successfulInsights = [];
        let pendingCount = 0;
        let failedCount = 0; // Counter for failed insights
        
        // Process each insight in the response
        data.insights.forEach(insightItem => {
          // Check if status is "success" or "pending" or "failed"
          if (insightItem.status === "success" && insightItem.headline) {
            // Add successful insights with headline text
            successfulInsights.push({
              insight_id: insightItem.insight_id,
              insight_text: insightItem.headline // Use headline field instead of lens.insight
            });
          } else if (insightItem.status === "pending") {
            // Count pending insights
            pendingCount++;
          } else if (insightItem.status === "failed") { // Count failed insights
            failedCount++;
          }
        });
        
        console.log('Processed successful insights:', successfulInsights);
        console.log('Pending insights count:', pendingCount);
        console.log('Failed insights count:', failedCount);
        
        setInsights(successfulInsights);
        setPendingInsightsCount(pendingCount);
        setFailedInsightsCount(failedCount);
        
        // Cache insights data
        localStorage.setItem(`dashboard_insights_cache_${userId}`, JSON.stringify({
          data: successfulInsights,
          timestamp: Date.now()
        }));
        
        // Cache pending count
        localStorage.setItem(`dashboard_pending_insights_count_${userId}`, JSON.stringify({
          count: pendingCount,
          timestamp: Date.now()
        }));
        
        // Cache failed count
        localStorage.setItem(`dashboard_failed_insights_count_${userId}`, JSON.stringify({
          count: failedCount,
          timestamp: Date.now()
        }));
      } else {
        console.log('No insights data found in the response');
        setInsights([]);
        setPendingInsightsCount(0);
        setFailedInsightsCount(0);
      }
      
      setInsightsLoading(false);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching insights data:', error);
      setInsights([]);
      setPendingInsightsCount(0);
      setFailedInsightsCount(0);
      setInsightsLoading(false);
      setLoading(false);
    }
  };

  // Effect to handle URL param changes
  useEffect(() => {
    // Update active tab when URL params change
    const tabParam = searchParams.get("tab");
    if (tabParam && ["insights", "experiments"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Add effect to fetch insights when tab changes to insights
  useEffect(() => {
    if (activeTab === "insights") {
      fetchInsightsData();
    }
  }, [activeTab, globalDateFilter]);

  // Handle tab change function
  const handleTabChange = React.useCallback((tab) => {
    setActiveTab(tab);
    
    // Force refetch insights data with current globalDateFilter when switching to insights tab
    if (tab === "insights") {
      // Clear cache to ensure fresh data with current filter
      localStorage.removeItem(`dashboard_insights_cache_${userId}`);
      localStorage.removeItem(`dashboard_pending_insights_count_${userId}`);
      localStorage.removeItem(`dashboard_failed_insights_count_${userId}`);
      
      // This will trigger the useEffect that calls fetchInsightsData
      // because we're creating a new reference for globalDateFilter
      setGlobalDateFilter({...globalDateFilter});
    }
    
    // Update URL without full page reload
    // Update URL without full page reload
router.push(`/?tab=${tab}`, { shallow: true });
  }, [router, globalDateFilter, userId]);

  // Effect to handle authentication only
  useEffect(() => {
    if (!userId) {
      router.push("/");
    }
  }, [userId, router]);

  // Handle time filter changes - Update both date filter formats
  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    
    // Create global format date filter based on selection
    let newGlobalDateFilter;
    
    if (newTime === "Today") {
      newGlobalDateFilter = { type: "last", days: 0 };
    } else if (newTime === "Yesterday") {
      newGlobalDateFilter = { type: "last", days: 1 };
    } else if (newTime === "7D") {
      newGlobalDateFilter = { type: "last", days: 7 };
    } else if (newTime === "30D") {
      newGlobalDateFilter = { type: "last", days: 30 };
    } else if (newTime === "3M") {
      newGlobalDateFilter = { type: "last", days: 90 };
    } else if (newTime === "6M") {
      newGlobalDateFilter = { type: "last", days: 180 };
    } else if (newTime === "12M") {
      newGlobalDateFilter = { type: "last", days: 365 };
    } else if (newTime.includes(" - ")) {
      // Parse date range like "Apr 1, 2025 - Apr 15, 2025"
      const [start, end] = newTime.split(" - ");
      newGlobalDateFilter = { 
        type: "between", 
        start_date: formatApiDate(start.trim()),
        end_date: formatApiDate(end.trim())
      };
    } else if (newTime.startsWith("Since ")) {
      // Parse "Since Apr 1, 2025"
      const sinceDate = newTime.replace("Since ", "").trim();
      newGlobalDateFilter = { 
        type: "since", 
        start_date: formatApiDate(sinceDate)
      };
    } else if (newTime.startsWith("Last ")) {
      // Parse "Last 45 days"
      const daysText = newTime.replace("Last ", "").replace(" days", "").trim();
      const days = parseInt(daysText);
      if (!isNaN(days)) {
        newGlobalDateFilter = { type: "last", days: days };
      } else {
        newGlobalDateFilter = { type: "last", days: 30 }; // Default
      }
    } else {
      newGlobalDateFilter = { type: "last", days: 30 }; // Default
    }
    
    console.log('Dashboard - Set global date filter:', newGlobalDateFilter);
    setGlobalDateFilter(newGlobalDateFilter);
    
    // ADDED: Store the current filter in localStorage for page reload detection
    localStorage.setItem(`dashboard_current_filter_${userId}`, newTime);
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

  // Render generate insights button with proper state
  // UPDATED: Removed step counter since we're now using parallel processing
  const renderGenerateButton = () => {
    if (generatingInsights) {
      return (
        <button 
          className={`${styles.generateInsightsButton} ${styles.generating}`}
          disabled={true}
        >
          <Loader2 className={styles.loadingSpinner} size={16} />
          <span>Generating insights...</span>
        </button>
      );
    }
    
    return (
      <button 
        className={styles.generateInsightsButton}
        onClick={generateInsights}
      >
        <span>Generate Insights</span>
      </button>
    );
  };

  // Render insights section with processing of pending and failed insights
  const renderInsights = () => {
    if (isInitialRender) {
      return renderSkeletonInsights();
    }
    
    if (insightsLoading) {
      return renderSkeletonInsights();
    }
    
    // Show generation error if any
    if (generationError) {
      return (
        <div className={styles.insightsSection}>
          <div className={styles.insightsList}>
            {insights.length > 0 && insights.map((insight, index) => (
              <InsightCard
                key={`${insight.insight_id || index}-${index}`}
                description={insight.insight_text || "No description available"}
                insight_id={insight.insight_id || `insight-${index}`}
              />
            ))}
          </div>
          
          <div className={styles.errorMessageContainer}>
            <p className={styles.errorMessage}>{generationError}</p>
            {!generatingInsights && renderGenerateButton()}
          </div>
        </div>
      );
    }

    // Case 1 - All Pending (no successful insights, only pending)
    if (insights.length === 0 && pendingInsightsCount > 0 && failedInsightsCount === 0) {
      return (
        <div className={styles.insightsSection}>
          <div className={styles.pendingInsightsFullContainer}>
            <div className={styles.pendingInsightsIcon}>
              <Clock size={32} className={styles.pendingIcon} />
            </div>
            <h3 className={styles.pendingInsightsTitle}>Insights in Progress</h3>
            <p className={styles.pendingInsightsText}>
              {pendingInsightsCount} {pendingInsightsCount === 1 ? 'insight' : 'insights'} pending analysis.
            </p>
            {/* No Generate button when all are pending */}
          </div>
        </div>
      );
    }
    
    // Case 3 - No Insights at all (empty data)
    if (insights.length === 0 && pendingInsightsCount === 0 && failedInsightsCount === 0) {
      return (
        <div className={styles.insightsSection}>
          <div className={styles.noData}>
            <p>No insights available</p>
            {/* Show Generate button when no insights at all */}
            {renderGenerateButton()}
          </div>
        </div>
      );
    }
    
    // Case 2 - Some or All Failed (with or without successful insights)
    if (failedInsightsCount > 0) {
      return (
        <div className={styles.insightsSection}>
          {/* Show successful insights if any */}
          {insights.length > 0 && (
            <div className={styles.insightsList}>
              {insights.map((insight, index) => (
                <InsightCard
                  key={`${insight.insight_id || index}-${index}`}
                  description={insight.insight_text || "No description available"}
                  insight_id={insight.insight_id || `insight-${index}`}
                />
              ))}
            </div>
          )}
          
          {/* Show pending message if any pending */}
          {pendingInsightsCount > 0 && (
            <div className={styles.pendingInsightsContainer}>
              <div className={styles.pendingInsightsHeader}>
                <Clock size={20} className={styles.pendingHeaderIcon} />
                <span className={styles.pendingCount}>{pendingInsightsCount} insights pending</span>
              </div>
            </div>
          )}
          
          {/* Always show Generate button when there are failed insights */}
          <div className={styles.failedInsightsContainer}>
            {renderGenerateButton()}
            {failedInsightsCount > 0 && (
              <p className={styles.failedCount}>{failedInsightsCount} failed insight{failedInsightsCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      );
    }

    // Case 4 - Some Pending, Some Success, No Failed
    if (insights.length > 0 && pendingInsightsCount > 0 && failedInsightsCount === 0) {
      return (
        <div className={styles.insightsSection}>
          <div className={styles.insightsList}>
            {insights.map((insight, index) => (
              <InsightCard
                key={`${insight.insight_id || index}-${index}`}
                description={insight.insight_text || "No description available"}
                insight_id={insight.insight_id || `insight-${index}`}
              />
            ))}
          </div>
          
          {/* Show pending message without Generate button */}
          <div className={styles.pendingInsightsContainer}>
            <div className={styles.pendingInsightsHeader}>
              <Clock size={20} className={styles.pendingHeaderIcon} />
              <span className={styles.pendingCount}>{pendingInsightsCount} insights pending</span>
            </div>
            {/* No Generate button when only pending, no failed */}
          </div>
        </div>
      );
    }
    
  // Case 5 - All Success (no pending, no failed)
  return (
    <div className={styles.insightsSection}>
      <div className={styles.insightsList}>
        {insights.map((insight, index) => (
          <InsightCard
            key={`${insight.insight_id || index}-${index}`}
            description={insight.insight_text || "No description available"}
            insight_id={insight.insight_id || `insight-${index}`}
          />
        ))}
      </div>
      {/* No Generate button when all are success */}
    </div>
  );
};

// Render insights content 
const renderInsightsContent = () => {
  // Show loading indicator for initial load only
  if (loading && isInitialRender) {
    return (
      <>
        {renderSkeletonInsights()}
      </>
    );
  }

  // Otherwise render insights section with its own loading state
  return (
    <>
      {renderInsights()}
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
              experimentContent={<ExperimentContent userId={userId} />}
              selectedTime={selectedTime}
              apiDateFilter={apiDateFilter}
              globalDateFilter={globalDateFilter} // ADDED: Pass globalDateFilter to DashboardTabs
            >
              {activeTab === "insights" && (
                <>
                  {renderInsightsContent()}
                </>
              )}
            </DashboardTabs>
          </div>
          <div className={styles.filterContainer}>
            <TabFilter 
              selected={selectedTime} 
              onChange={handleTimeChange} 
              disabled={activeTab !== "overview"}
              readOnly={activeTab === "insights"}
            />
          </div>
        </div>
      </main>
    </div>
  </div>
);
}