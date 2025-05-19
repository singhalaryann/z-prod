// app/insight/page.js
"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import GetMetrics from "../components/dashboard/GetMetrics";
import { Calendar, ChevronDown, ChevronUp, BarChart2, Info, X } from "lucide-react";
import Image from "next/image";
import styles from "../../styles/Insight.module.css";
import { GAME_ID } from '../config';

export default function InsightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [gameId, setGameId] = useState(GAME_ID);
  const [userIds, setUserIds] = useState([]);

  // State to track which insights have their graphs visible
  const [visibleGraphs, setVisibleGraphs] = useState({});
  
  // State to track which info modal is visible
  const [visibleInfo, setVisibleInfo] = useState(null);
  
  // State for modal animation
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const fetchInsightData = async () => {
      const insightId = searchParams.get("id");
      console.log("🔍 Fetching insight for id:", insightId);
      if (!userId || !insightId) {
        console.log("⚠️ Missing userId or insightId, redirecting to dashboard");
        setLoading(false); // Ensure loading state is reset before redirect
        router.push("/");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          "https://get-insight-data-nrosabqhla-uc.a.run.app",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // user_id: userId,
              game_id: GAME_ID,
              insight_ids: [insightId],
            }),
          }
        );
        const data = await response.json();
        console.log("✅ API response:", data);
        if (data.insights && data.insights.length > 0) {
          const selectedInsight = data.insights[0];
          console.log("Insight data:", selectedInsight);
          setInsight(selectedInsight);

          // Extract query information
          if (selectedInsight.query) {
            console.log("Query data:", selectedInsight.query);
            setDateFilter(selectedInsight.query.date_filter || null);
            setGameId(selectedInsight.query.game_id || GAME_ID);
            setUserIds(selectedInsight.query.user_ids || []);
          }
        } else {
          setInsight(null);
          setDateFilter(null);
        }
      } catch (error) {
        console.error("❌ Error fetching insight data:", error);
        setInsight(null);
        setDateFilter(null);
      } finally {
        setLoading(false);
      }
    };
    fetchInsightData();
    
    // Clear any lingering close timers when component unmounts
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [userId, searchParams, router]);

  // Handle Analyse Board click
  const handleAnalyseClick = () => {
    const insightId = searchParams.get("id");
    console.log("Navigating to experiments with insight:", insightId);
    router.push(`/z_experiment?insight=${insightId}`);
  };

  // Toggle visibility of graphs for a specific lens
  const toggleGraphVisibility = (lensIndex) => {
    console.log("Toggling graph visibility for lens:", lensIndex);
    setVisibleGraphs((prev) => ({
      ...prev,
      [lensIndex]: !prev[lensIndex],
    }));
  };
  
  // Toggle visibility of info modal for a specific lens
  const toggleInfoVisibility = (lensIndex) => {
    console.log("Toggling info visibility for lens:", lensIndex);
    
    // If we're currently closing a modal, cancel that operation
    if (isClosing) {
      setIsClosing(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
    
    // If the same lens is clicked or modal is already open, start closing animation
    if (visibleInfo === lensIndex) {
      closeModalWithAnimation();
    } else {
      // Open the new modal
      setVisibleInfo(lensIndex);
    }
  };
  
  // Start the closing animation and then hide the modal
  const closeModalWithAnimation = () => {
    // Start the closing animation
    setIsClosing(true);
    
    // After animation completes, hide the modal
    closeTimerRef.current = setTimeout(() => {
      setVisibleInfo(null);
      setIsClosing(false);
    }, 200); // 200ms matches the CSS animation duration
  };
  
  // Close info modal when clicking outside
  const closeInfoModal = (e) => {
    // Only close if clicking the backdrop (not the modal content)
    if (e.target.classList.contains(styles.infoModalBackdrop)) {
      closeModalWithAnimation();
    }
  };

  // Format date filter for display
  const formatDateFilter = (filter) => {
    if (!filter) return "";

    if (filter.type === "last") {
      if (filter.days === 0) return "Today";
      if (filter.days === 1) return "Yesterday";
      return `Last ${filter.days} days`;
    }
    if (filter.type === "yesterday") return "Yesterday";
    if (filter.type === "between")
      return `${filter.start_date} - ${filter.end_date}`;
    if (filter.type === "since") return `Since ${filter.start_date}`;
    return JSON.stringify(filter);
  };

  // Skeleton loading for insight content
  const renderSkeletonContent = () => (
    <>
      <div className={styles.insightSection}>
        <div className={styles.insightHeader}>
          <div className={styles.insightTitleContainer}>
            <div className={styles.insightSkeletonTitle}></div>
            <div className={styles.insightSkeletonFilter}></div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <div className={styles.skeletonSubText}></div>
          <div className={styles.skeletonButton}>
            <div className={styles.skeletonButtonText}></div>
            <div className={styles.skeletonIcon}></div>
          </div>
        </div>
      </div>

      <div className={styles.skeletonInsightsList}>
        {[1, 2, 3].map((index) => (
          <div key={index} className={styles.skeletonInsightItem}>
            <div className={styles.skeletonInsightTitle}></div>
            <div className={styles.skeletonInsightText}></div>
          </div>
        ))}
      </div>
    </>
  );

  // No insight found state
  const renderNoInsight = () => (
    <div className={styles.noInsight}>
      <div className={styles.noInsightContent}>
        <h3>No insight found</h3>
        <p>The requested insight could not be found or is unavailable.</p>
        <button
          className={styles.returnButton}
          onClick={() => router.push("/")}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
  
  // Global modal that appears at the root level of the app
  const renderGlobalInfoModal = () => {
    if (visibleInfo === null && !isClosing) return null;
    
    // Get the lens data for the visible info modal
    const lens = insight?.insight_payload?.detailed_insights_by_lens?.[visibleInfo];
    if (!lens && !isClosing) return null;
    
    return (
      <div 
        className={`${styles.infoModalBackdrop} ${isClosing ? styles.fadeOut : styles.fadeIn}`} 
        onClick={closeInfoModal}
      >
        <div className={`${styles.infoModal} ${isClosing ? styles.slideOut : styles.slideIn}`}>
          <div className={styles.infoModalHeader}>
            <h3 className={styles.infoModalTitle}>Insight Details</h3>
            <button 
              className={styles.closeModalButton}
              onClick={closeModalWithAnimation}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.infoModalContent}>
            {lens?.hidden_signal && (
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Hidden Signal</h4>
                <p className={styles.infoSectionText}>{lens.hidden_signal}</p>
              </div>
            )}
            
            {lens?.ground_facts && (
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Ground Facts</h4>
                <p className={styles.infoSectionText}>{lens.ground_facts}</p>
              </div>
            )}
            
            {lens?.insight && (
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Insight</h4>
                <p className={styles.infoSectionText}>{lens.insight}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.mainLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          {loading ? (
            renderSkeletonContent()
          ) : !insight ? (
            renderNoInsight()
          ) : (
            <>
              <div className={styles.insightSection}>
                <div className={styles.insightHeader}>
                  <div className={styles.insightTitleContainer}>
                    <h2 className={styles.insightTitle}>
                      {insight.headline || insight.insight_text}
                    </h2>
                    {dateFilter && (
                      <div className={styles.filterContainer}>
                        <div className={styles.dateFilterButton}>
                          <Calendar size={16} className={styles.calendarIcon} />
                          <span>{formatDateFilter(dateFilter)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.actionRow}>
               <p className={styles.subText}>
  {insight?.insight_payload?.segment_snapshot?.description || "Uncover actionable insights for each metric and enhance your strategies effortlessly."}
</p>
                  <button
                    className={styles.analyseButton}
                    onClick={handleAnalyseClick}
                  >
                    <span>Analyse Board</span>
                    <div className={styles.iconWrapper}>
                      <Image
                        src="/Analyse_icon.svg"
                        alt="Analyse"
                        width={24}
                        height={24}
                        className={styles.buttonIcon}
                        priority
                      />
                    </div>
                  </button>
                </div>
              </div>

              {insight.insight_payload &&
                insight.insight_payload.detailed_insights_by_lens && (
                  <div className={styles.insightsList}>
                    {insight.insight_payload.detailed_insights_by_lens.map(
                      (lens, index) => (
                        <div key={index} className={styles.insightItem}>
                          <div className={styles.insightItemHeader}>
                            <h3 className={styles.insightItemTitle}>
                              {lens.simplified_one_liner}
                            </h3>
                            
                            {/* Move info button to top right corner of card */}
                            {(lens.hidden_signal || lens.ground_facts || lens.insight) && (
                              <button 
                                className={styles.infoButtonTopRight}
                                onClick={() => toggleInfoVisibility(index)}
                                aria-label="Show insight details"
                              >
                                <Info size={18} className={styles.infoIcon} />
                              </button>
                            )}
                          </div>
                          
                          <p className={styles.insightItemText}>
                            {lens.simplified_one_liner_explanation}
                          </p>

                          <button
                            className={styles.showGraphsButton}
                            onClick={() => toggleGraphVisibility(index)}
                          >
                            <BarChart2 size={18} className={styles.graphIcon} />
                            <span>
                              {visibleGraphs[index]
                                ? "Hide Graphs"
                                : "Show Graphs"}
                            </span>
                            {visibleGraphs[index] ? (
                              <ChevronUp
                                size={16}
                                className={styles.chevronIcon}
                              />
                            ) : (
                              <ChevronDown
                                size={16}
                                className={styles.chevronIcon}
                              />
                            )}
                          </button>
                          
                          {visibleGraphs[index] &&
                            lens.metrics_examined &&
                            lens.metrics_examined.length > 0 && (
                              <div className={styles.graphsContainer}>
                                <div className={styles.metricGraphWrapper}>
                                  <GetMetrics
                                    selectedTime={null}
                                    onTimeChange={() => {}}
                                    specificMetric={lens.metrics_examined}
                                    readOnly={true}
                                    initialDateFilter={dateFilter}
                                    hideSkeletons={false}
                                    userIds={userIds}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </>
          )}
        </main>
      </div>
      
      {/* Render the global modal at the root level */}
      {renderGlobalInfoModal()}
    </div>
  );
}