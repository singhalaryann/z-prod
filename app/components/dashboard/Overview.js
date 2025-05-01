"use client";
import React, { useState, useEffect } from "react";
import { Users, Target, TrendingUp, Clock, Award, ChartBar } from "lucide-react";
import styles from "../../../styles/Overview.module.css";
import { useAuth } from "../../context/AuthContext";

const Overview = ({ selectedTime = "30D" }) => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [lastStoredRetention, setLastStoredRetention] = useState(null);

  // Cache duration: 5 minutes in milliseconds
  const CACHE_DURATION = 5 * 60 * 1000;

  // Convert any time period to start/end dates
  const getDatesForPeriod = (selectedTime) => {
    const end = new Date();
    let start = new Date();

    switch(selectedTime) {
      case "Today":
        start = new Date();
        break;
      case "Yesterday":
        start = new Date();
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case "7D":
        start.setDate(start.getDate() - 7);
        break;
      case "30D":
        start.setDate(start.getDate() - 30);
        break;
      case "3M":
        start.setDate(start.getDate() - 90);
        break;
      case "6M":
        start.setDate(start.getDate() - 180);
        break;
      case "12M":
        start.setDate(start.getDate() - 365);
        break;
      default:
        if (selectedTime && typeof selectedTime === 'string' && selectedTime.includes(" - ")) {
          const [startStr, endStr] = selectedTime.split(" - ");
          start = new Date(startStr);
          end = new Date(endStr);
        } else {
          start.setDate(start.getDate() - 30);
        }
    }

    const dateRange = {
      start_date: formatDate(start),
      end_date: formatDate(end)
    };

    console.log(`
📅 Date Range for ${selectedTime}:
----------------------------
Start Date: ${dateRange.start_date}
End Date:   ${dateRange.end_date}
  `);

    return dateRange;
  };

  // Helper to format dates for API
  const formatDate = (dateStr) => {
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

  // Modify how we get current values for Today and Yesterday
  const getCurrentValue = (values, selectedTime) => {
    if (!values || !values.length) return 0;
    
    switch(selectedTime) {
      case "Today":
        return values[0]?.[1] || 0;  // Most recent value
      case "Yesterday":
        return values[1]?.[1] || 0;  // Yesterday's value
      default:
        return values[0]?.[1] || 0;  // Most recent value
    }
  };

  // Modify how we get previous values for Today and Yesterday
  const getPreviousValue = (values, selectedTime) => {
    if (!values || !values.length) return 0;
    
    switch(selectedTime) {
      case "Today":
        return values[1]?.[1] || 0;  // Yesterday's value
      case "Yesterday":
        return values[2]?.[1] || 0;  // Day before yesterday's value
      default:
        return values[1]?.[1] || 0;  // Previous value
    }
  };

  // Calculate delta percentage
  const calculateDelta = (newValue, oldValue) => {
    if (!oldValue || oldValue === 0) return 0;
    return ((1 - (newValue / oldValue)) * 100).toFixed(1);
  };

  // Format value based on metric type
  const formatValue = (metric, value) => {
    switch(metric) {
      case "avg_session_length":
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds}s`;
      case "classic_retention":
        return `${value.toFixed(2)}%`;
      case "dau":
      case "new_players":
        return value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString();
      default:
        return value.toString();
    }
  };

  // Update fetchAndStore7DayRetention to use between format
  const fetchAndStore7DayRetention = async () => {
    try {
      console.log(`
🎯 Fetching Classic Retention
============================`);
      
      const dateRange = getDatesForPeriod(selectedTime);
      const betweenFilter = {
        type: "between",
        ...dateRange
      };
      
      console.log(`
📊 API Request:
-------------
Time Period: ${selectedTime}
Filter Type: ${betweenFilter.type}
Start Date:  ${betweenFilter.start_date}
End Date:    ${betweenFilter.end_date}
      `);

      const response = await fetch('https://get-metrics-nrosabqhla-uc.a.run.app', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          metrics: ["classic_retention"],
          user_id: userId,
          game_id: "ludogoldrush",
          date_filter: betweenFilter
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Find Day 7 retention series
      const sevenDaySeries = data.metrics[0].series.find(s => s.name === "Day 7 Classic Retention");
      
      // Filter out zero values
      const nonZeroValues = sevenDaySeries.values.filter(value => value > 0);
      
      console.log(`
📈 Day 7 Retention Values:
----------------------
Total Values:     ${sevenDaySeries.values.length}
Non-Zero Values:  ${nonZeroValues.length}
Values:          [${nonZeroValues.join(', ')}]
      `);

      if (nonZeroValues.length === 0) {
        console.log('⚠️  No non-zero values found in the period');
        return { current: 0, previous: 0 };
      }

      const currentValue = nonZeroValues[0];
      const previousValue = nonZeroValues[nonZeroValues.length - 1];
      const delta = calculateDelta(currentValue, previousValue);

      console.log(`
🔄 Classic Retention Calculation:
----------------------------
Newest Value:   ${currentValue}%
Oldest Value:   ${previousValue}%
Delta:          ${delta}%
Direction:      ${delta >= 0 ? '📉 Decrease' : '📈 Increase'}
      `);

      return { current: currentValue, previous: previousValue };

    } catch (err) {
      console.error('❌ Classic Retention Error:', err);
      return { current: 0, previous: 0 };
    }
  };

  // Remove the interval since we now want fresh data each time period changes
  useEffect(() => {
    let isMounted = true;
    
    const fetch7DayRetention = async () => {
      if (isMounted) {
        const retentionData = await fetchAndStore7DayRetention();
        setLastStoredRetention(retentionData);
      }
    };

    fetch7DayRetention();

    return () => {
      isMounted = false;
    };
  }, [selectedTime, userId]); // Now depends on selectedTime too

  useEffect(() => {
    let isMounted = true;
    
    const fetchOverviewData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        if (!userId) {
          throw new Error('User ID is required');
        }

        const cacheKey = `overview_cache_${selectedTime}_${userId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setOverviewData(data);
              setLoading(false);
              return;
            }
          } catch (cacheError) {
            console.error('Cache parsing error:', cacheError);
          }
        }

        const dateRange = getDatesForPeriod(selectedTime);
        const betweenFilter = {
          type: "between",
          ...dateRange
        };

        console.log(`
🔍 Overview API Request:
--------------------
Time Period: ${selectedTime}
Filter Type: ${betweenFilter.type}
Start Date:  ${betweenFilter.start_date}
End Date:    ${betweenFilter.end_date}
        `);

        const response = await fetch('https://get-metrics-nrosabqhla-uc.a.run.app', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            metrics: ["dau", "new_players", "avg_session_length"],
            user_id: userId,
            game_id: "ludogoldrush",
            date_filter: betweenFilter
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Log each metric's values and calculations
        ['dau', 'new_players', 'avg_session_length'].forEach(metric => {
          const values = data.metrics.find(m => m.metric_id === metric)?.values || [];
          const newest = values[0] || 0;
          const oldest = values[values.length - 1] || 0;
          const delta = calculateDelta(newest, oldest);

          console.log(`
📈 ${metric.toUpperCase()}:
----------------------
Newest Value:   ${formatValue(metric, newest)}
Oldest Value:   ${formatValue(metric, oldest)}
Delta:          ${delta}%
Direction:      ${delta >= 0 ? '📉 Decrease' : '📈 Increase'}
          `);
        });

        const processedData = {
          metrics: data.metrics.reduce((acc, metric) => {
            if (metric && metric.metric_id) {
              acc[metric.metric_id] = metric;
            }
            return acc;
          }, {})
        };

        if (Object.keys(processedData.metrics).length > 0) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: processedData,
              timestamp: Date.now()
            }));
          } catch (cacheError) {
            console.error('Cache storage error:', cacheError);
          }
        }

        if (isMounted) {
          setOverviewData(processedData);
        }
      } catch (err) {
        console.error('❌ Overview Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchOverviewData();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedTime, userId]);

  // Prepare stats data
  const overviewStats = overviewData ? [
    {
      title: "New Players",
      value: formatValue("new_players", getCurrentValue(overviewData.metrics.new_players?.values, selectedTime)),
      change: `${calculateDelta(
        getCurrentValue(overviewData.metrics.new_players?.values, selectedTime),
        getPreviousValue(overviewData.metrics.new_players?.values, selectedTime)
      )}%`,
      isPositive: calculateDelta(
        getCurrentValue(overviewData.metrics.new_players?.values, selectedTime),
        getPreviousValue(overviewData.metrics.new_players?.values, selectedTime)
      ) >= 0,
      icon: Users,
    },
    {
      title: "Daily Active Users",
      value: formatValue("dau", overviewData.metrics.dau?.values?.[0]?.[1] || 0),
      change: `${calculateDelta(
        overviewData.metrics.dau?.values?.[0]?.[1] || 0,
        overviewData.metrics.dau?.values?.[1]?.[1] || 0
      )}%`,
      isPositive: calculateDelta(
        overviewData.metrics.dau?.values?.[0]?.[1] || 0,
        overviewData.metrics.dau?.values?.[1]?.[1] || 0
      ) >= 0,
      icon: Target,
    },
    {
      title: "Classic Retention",
      value: (() => {
        console.log('📊 [Classic Retention] Rendering with data:', lastStoredRetention);
        return formatValue("classic_retention", lastStoredRetention?.current || 0);
      })(),
      change: (() => {
        const delta = calculateDelta(
          lastStoredRetention?.current || 0,
          lastStoredRetention?.previous || 0
        );
        console.log('📈 [Classic Retention] Calculated delta:', delta);
        return `${delta}%`;
      })(),
      isPositive: (() => {
        const delta = calculateDelta(
          lastStoredRetention?.current || 0,
          lastStoredRetention?.previous || 0
        );
        console.log('✨ [Classic Retention] Delta is positive:', delta >= 0);
        return delta >= 0;
      })(),
      icon: Clock,
    },
    {
      title: "Avg. Session Time",
      value: formatValue("avg_session_length", overviewData.metrics.avg_session_length?.values?.[0]?.[1] || 0),
      change: `${calculateDelta(
        overviewData.metrics.avg_session_length?.values?.[0]?.[1] || 0,
        overviewData.metrics.avg_session_length?.values?.[1]?.[1] || 0
      )}%`,
      isPositive: calculateDelta(
        overviewData.metrics.avg_session_length?.values?.[0]?.[1] || 0,
        overviewData.metrics.avg_session_length?.values?.[1]?.[1] || 0
      ) >= 0,
      icon: Clock,
    }
  ] : [];

  const recentAchievements = [
    {
      title: "New User Milestone",
      description: "Reached 100K active users this month",
      date: "2 days ago",
      icon: Award,
    },
    {
      title: "Revenue Record",
      description: "Highest daily revenue in the last quarter",
      date: "1 week ago",
      icon: ChartBar,
    }
  ];

  if (loading) {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className={`${styles.statCard} ${styles.skeleton}`}>
              <div className={styles.statHeader}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonIcon}></div>
              </div>
              <div className={styles.skeletonValue}></div>
              <div className={styles.skeletonChange}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overviewContainer}>
        <div className={styles.errorState}>
          Error loading overview data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.statsGrid}>
        {overviewStats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>{stat.title}</h3>
              <stat.icon size={20} className={styles.statIcon} />
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={`${styles.statChange} ${stat.isPositive ? styles.positive : styles.negative}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.achievementsSection}>
        <h2 className={styles.sectionTitle}>Recent Achievements</h2>
        <div className={styles.achievementsList}>
          {recentAchievements.map((achievement, index) => (
            <div key={index} className={styles.achievementCard}>
              <div className={styles.achievementIcon}>
                <achievement.icon size={20} />
              </div>
              <div className={styles.achievementContent}>
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <span className={styles.achievementDate}>{achievement.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview; 