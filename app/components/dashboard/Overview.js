"use client";
import React, { useState, useEffect } from "react";
import { Users, Target, TrendingUp, Clock } from "lucide-react";
import styles from "../../../styles/Overview.module.css";
import { useAuth } from "../../context/AuthContext";
// ADDED: Import GetMetrics component
import GetMetrics from "./GetMetrics";
import { GAME_ID } from '../../config';

const Overview = ({ selectedTime, apiDateFilter, globalDateFilter }) => { // UPDATED: Added globalDateFilter prop
  const { userId } = useAuth();
  
  // State for storing the metrics data
  const [metricsData, setMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ADDED: New state for storing graph metrics data to pass to GetMetrics components
  const [graphsMetricsData, setGraphsMetricsData] = useState(null);
  // ADDED: State for tracking if graphs data is loading
  const [graphsLoading, setGraphsLoading] = useState(true);
  
  // Game ID constant
  // const GAME_ID = "ludogoldrush";
  
  // Cache duration: 5 minutes in milliseconds
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Metrics to request for the overview cards
  const metricsToRequest = ["dau", "avg_session_length", "classic_retention", "new_players"];

  // ADDED: Graph metrics to request - same as card metrics for consolidated API call
  const graphMetricsToRequest = ["dau", "classic_retention", "new_players", "avg_session_length"];

  // Calculate delta percentage between new and old values using mentor's formula
  const calculateDeltaPercentage = (newValue, oldValue) => {
    if (!oldValue || oldValue === 0) {
      return { value: 0, isPositive: true };
    }
    
    // Using formula: (1 - (new value/old value)) * 100%
    const delta = (1 - (newValue / oldValue)) * 100;
    return {
      value: Math.abs(delta).toFixed(1),
      // Negative delta means value increased (which is positive for business)
      isPositive: delta <= 0
    };
  };
  
  // Format value for display based on metric type
  const formatValue = (metric, value) => {
    if (!value && value !== 0) return "N/A";
    
    switch (metric) {
      case "dau":
        return `${Math.round(value).toLocaleString()}`;
      case "new_players":
        return `${Math.round(value).toLocaleString()}`;
      case "avg_session_length":
        // Display raw seconds value
        return `${Math.round(value)}`;
      case "classic_retention":
        return `${value.toFixed(1)}%`;
      default:
        return `${value}`;
    }
  };

  // UPDATED: Fetch metrics data from API - consolidated to fetch both card and graph metrics
  const fetchMetricsData = async () => {
    try {
      // UPDATED: Set loading state to true immediately when fetch starts
      setIsLoading(true);
      setGraphsLoading(true); // ADDED: Set graphs loading state
      setMetricsData(null); // Clear current data to show loading state
      setGraphsMetricsData(null); // ADDED: Clear graphs data
      
      if (!apiDateFilter || !apiDateFilter.start_date || !apiDateFilter.end_date) {
        console.log("Overview - Invalid date filter:", apiDateFilter);
        return;
      }
      
      // Create a cache key based on date filter
      const dateFilterStr = JSON.stringify(apiDateFilter);
      const cacheKey = `overview_metrics_cache_${dateFilterStr}`;
      const graphsCacheKey = `overview_graphs_metrics_cache_${JSON.stringify(globalDateFilter)}`; // ADDED: Separate cache key for graphs
      
      // Check cache first
      const cachedMetrics = localStorage.getItem(cacheKey);
      const cachedGraphsMetrics = localStorage.getItem(graphsCacheKey); // ADDED: Check graphs cache
      
      let shouldFetchCardsData = true;
      let shouldFetchGraphsData = true;
      
      // Check cards cache
      if (cachedMetrics) {
        const { data: cachedMetricsData, timestamp } = JSON.parse(cachedMetrics);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Overview - Loading metrics from cache for filter:', apiDateFilter);
          processMetricsData(cachedMetricsData);
          setIsLoading(false);
          shouldFetchCardsData = false;
        } else {
          console.log('Overview - Cache expired, fetching fresh data');
        }
      } else {
        console.log('Overview - No cache found, fetching fresh data');
      }
      
      // ADDED: Check graphs cache
      if (cachedGraphsMetrics) {
        const { data: cachedGraphsData, timestamp } = JSON.parse(cachedGraphsMetrics);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Overview - Loading graphs metrics from cache for filter:', globalDateFilter);
          setGraphsMetricsData(cachedGraphsData);
          setGraphsLoading(false);
          shouldFetchGraphsData = false;
        } else {
          console.log('Overview - Graphs cache expired, fetching fresh data');
        }
      } else {
        console.log('Overview - No graphs cache found, fetching fresh data');
      }
      
      // UPDATED: Fetch cards data if needed
      if (shouldFetchCardsData) {
        const startTime = performance.now();
        console.log('Overview - Fetching fresh metrics data with filter:', apiDateFilter);
        console.log('Overview - Requesting metrics for cards:', metricsToRequest);
        
        // API request with date_filter and game_id for cards
        const cardsRequestBody = {
          metrics: metricsToRequest,
          date_filter: apiDateFilter,
          ...(userId && { user_id: userId }),
          game_id: GAME_ID
        };
        
        console.log('Overview - Cards API request payload:', cardsRequestBody);
        
        const cardsResponse = await fetch('https://get-metrics-nrosabqhla-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardsRequestBody)
        });
        
        const endTime = performance.now();
        console.log(`Overview - Cards API response time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
        
        if (!cardsResponse.ok) {
          throw new Error(`HTTP error! status: ${cardsResponse.status}`);
        }

        // Parse the response JSON
        const cardsData = await cardsResponse.json();
        console.log('Overview - Cards API Response:', cardsData);
        
        // Process metrics data for cards
        processMetricsData(cardsData);
        
        // Store cards data in cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: cardsData,
            timestamp: Date.now()
          }));
          console.log('Overview - Cards metrics data cached successfully with key:', cacheKey);
        } catch (error) {
          console.error('Overview - Error caching cards metrics:', error);
        }
      }
      
      // ADDED: Fetch graphs data if needed
      if (shouldFetchGraphsData) {
        const graphsStartTime = performance.now();
        console.log('Overview - Fetching fresh graphs metrics data with filter:', globalDateFilter);
        console.log('Overview - Requesting metrics for graphs:', graphMetricsToRequest);
        
        // API request with date_filter and game_id for graphs
        const graphsRequestBody = {
          metrics: graphMetricsToRequest,
          date_filter: globalDateFilter,
          ...(userId && { user_id: userId }),
          game_id: GAME_ID
        };
        
        console.log('Overview - Graphs API request payload:', graphsRequestBody);
        
        const graphsResponse = await fetch('https://get-metrics-nrosabqhla-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graphsRequestBody)
        });
        
        const graphsEndTime = performance.now();
        console.log(`Overview - Graphs API response time: ${((graphsEndTime - graphsStartTime) / 1000).toFixed(2)} seconds`);
        
        if (!graphsResponse.ok) {
          throw new Error(`HTTP error for graphs! status: ${graphsResponse.status}`);
        }

        // Parse the response JSON
        const graphsData = await graphsResponse.json();
        console.log('Overview - Graphs API Response:', graphsData);
        
        // Store the graphs data for passing to GetMetrics components
        setGraphsMetricsData(graphsData);
        
        // Store graphs data in cache
        try {
          localStorage.setItem(graphsCacheKey, JSON.stringify({
            data: graphsData,
            timestamp: Date.now()
          }));
          console.log('Overview - Graphs metrics data cached successfully with key:', graphsCacheKey);
        } catch (error) {
          console.error('Overview - Error caching graphs metrics:', error);
        }
      }
      
      // UPDATED: Set loading states to false when fetches are complete
      setIsLoading(false);
      setGraphsLoading(false);
      
    } catch (err) {
      console.error('Overview - Error fetching metrics:', err);
      setError(`Failed to load metrics data: ${err.message}`);
      setIsLoading(false);
      setGraphsLoading(false);
    }
  };
  
  // Process the metrics data for display
  const processMetricsData = (data) => {
    if (!data || !data.metrics || !Array.isArray(data.metrics)) {
      console.log("Overview - No valid metrics data to process");
      setMetricsData(null);
      return;
    }
    
    console.log("Overview - Processing metrics data:", data);
    
    // Create an object to hold the processed metrics
    const processedMetrics = {};
    
    // Process each metric
    data.metrics.forEach(metric => {
      const metricId = metric.metric_id;
      
      // Skip if not the metric we're looking for
      if (!metricsToRequest.includes(metricId)) {
        return;
      }
      
      // Handle different metric types
      if (metricId === "classic_retention") {
        // For classic retention, we want Day 7 specifically
        if (metric.series && Array.isArray(metric.series)) {
          // Find the Day 7 series
          const day7Series = metric.series.find(s => s.name === "Day 7 Classic Retention");
          
          if (day7Series && Array.isArray(day7Series.values) && day7Series.values.length > 0) {
            // Get the latest value (last in array)
            const newValue = day7Series.values[day7Series.values.length - 1] || 0;
            // Get the previous value (second to last)
            const oldValue = day7Series.values.length > 1 ? day7Series.values[day7Series.values.length - 2] : 0;
            
            // Calculate delta
            const delta = calculateDeltaPercentage(newValue, oldValue);
            
            processedMetrics[metricId] = {
              title: day7Series.name,
              value: formatValue(metricId, newValue),
              change: `${delta.isPositive ? '+' : '-'}${delta.value}%`,
              isPositive: delta.isPositive,
              icon: Target
            };
          }
        }
      } else if (Array.isArray(metric.values) && metric.values.length > 0) {
        // For time series data, get the latest values
        // Sort values by date if not already sorted
        const sortedValues = [...metric.values].sort((a, b) => new Date(a[0]) - new Date(b[0]));
        
        // Get the latest value (last in array)
        const newValue = sortedValues[sortedValues.length - 1][1] || 0;
        // Get the previous value (second to last)
        const oldValue = sortedValues.length > 1 ? sortedValues[sortedValues.length - 2][1] : 0;
        
        // Calculate delta
        const delta = calculateDeltaPercentage(newValue, oldValue);
        
        // Set icon based on metric type
        let icon;
        switch (metricId) {
          case "dau":
            icon = Users;
            break;
          case "new_players":
            icon = TrendingUp;
            break;
          case "avg_session_length":
            icon = Clock;
            break;
          default:
            icon = Target;
        }
        
        processedMetrics[metricId] = {
          title: metric.name, // Use the name from the API
          value: formatValue(metricId, newValue),
          change: `${delta.isPositive ? '+' : '-'}${delta.value}%`,
          isPositive: delta.isPositive,
          icon
        };
      }
    });
    
    console.log("Overview - Processed metrics:", processedMetrics);
    setMetricsData(processedMetrics);
  };

  // UPDATED: Fetch metrics when date filters change
  useEffect(() => {
    if (apiDateFilter && apiDateFilter.start_date && apiDateFilter.end_date) {
      console.log("Overview - Date filter is valid, fetching metrics");
      fetchMetricsData();
    } else {
      console.log("Overview - Waiting for valid date filter");
    }
  }, [apiDateFilter, globalDateFilter]); // UPDATED: Added globalDateFilter as dependency

  // Define order of metrics for display
  const metricOrder = ["dau", "classic_retention", "new_players", "avg_session_length"];

  // Map of metrics for the overview cards - using loading state when API data is not available
  const getOverviewStats = () => {
    if (!metricsData) {
      // Return loading placeholders if no metrics data is available
      return [
        {
          title: "Loading...",
          value: "...",
          change: "0%",
          isPositive: true,
          icon: Users,
        },
        {
          title: "Loading...",
          value: "...",
          change: "0%",
          isPositive: true,
          icon: Target,
        },
        {
          title: "Loading...",
          value: "...",
          change: "0%",
          isPositive: true,
          icon: TrendingUp,
        },
        {
          title: "Loading...",
          value: "...",
          change: "0%",
          isPositive: true,
          icon: Clock,
        }
      ];
    }
    
    // Return metrics in the specified order
    return metricOrder.map(metricId => {
      const metric = metricsData[metricId];
      if (!metric) {
        // Fallback for missing metrics
        let fallbackIcon;
        switch (metricId) {
          case "dau":
            fallbackIcon = Users;
            break;
          case "classic_retention":
            fallbackIcon = Target;
            break;
          case "new_players":
            fallbackIcon = TrendingUp;
            break;
          case "avg_session_length":
            fallbackIcon = Clock;
            break;
          default:
            fallbackIcon = Target;
        }
        
        return {
          title: "No Data",
          value: "N/A",
          change: "0%",
          isPositive: true,
          icon: fallbackIcon
        };
      }
      
      return metric;
    });
  };

  // ADDED: Helper function to extract metrics data for specific metric
  const getMetricData = (metricId) => {
    if (!graphsMetricsData || !graphsMetricsData.metrics || !Array.isArray(graphsMetricsData.metrics)) {
      return null;
    }
    
    return graphsMetricsData.metrics.find(m => m.metric_id === metricId) || null;
  };

  // Render the overview stats
  return (
    <div className={styles.overviewContainer}>
      <div className={styles.statsGrid}>
        {getOverviewStats().map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${isLoading ? styles.loading : ''}`}>
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
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {/* UPDATED: Section to display graphs for each metric using GetMetrics with pre-fetched data */}
      <div className={styles.overviewGraphsContainer}>
        {/* UPDATED: Display DAU Graph - first graph shows skeletons, pass pre-fetched data */}
        <GetMetrics 
          selectedTime={selectedTime}
          specificMetric="dau"
          specificMetricType="line"
          readOnly={true}
          initialDateFilter={globalDateFilter}
          hideSkeletons={graphsLoading ? false : true}
          prefetchedData={getMetricData("dau")} // ADDED: Pass pre-fetched data
          isDataLoading={graphsLoading} // ADDED: Pass loading state
        />
        
        {/* UPDATED: Hide skeletons for the other graphs and pass pre-fetched data */}
        <GetMetrics 
          selectedTime={selectedTime}
          specificMetric="classic_retention"
          specificMetricType="multiline"
          readOnly={true}
          initialDateFilter={globalDateFilter}
          hideSkeletons={true}
          prefetchedData={getMetricData("classic_retention")} // ADDED: Pass pre-fetched data
          isDataLoading={graphsLoading} // ADDED: Pass loading state
        />
        
        {/* UPDATED: Hide skeletons for this graph and pass pre-fetched data */}
        <GetMetrics 
          selectedTime={selectedTime}
          specificMetric="new_players"
          specificMetricType="line"
          readOnly={true}
          initialDateFilter={globalDateFilter}
          hideSkeletons={true}
          prefetchedData={getMetricData("new_players")} // ADDED: Pass pre-fetched data
          isDataLoading={graphsLoading} // ADDED: Pass loading state
        />
        
        {/* UPDATED: Hide skeletons for this graph and pass pre-fetched data */}
        <GetMetrics 
          selectedTime={selectedTime}
          specificMetric="avg_session_length"
          specificMetricType="line"
          readOnly={true}
          initialDateFilter={globalDateFilter}
          hideSkeletons={true}
          prefetchedData={getMetricData("avg_session_length")} // ADDED: Pass pre-fetched data
          isDataLoading={graphsLoading} // ADDED: Pass loading state
        />
      </div>
    </div>
  );
};

export default Overview;