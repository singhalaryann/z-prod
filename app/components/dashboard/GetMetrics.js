"use client";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/GetMetrics.module.css";
import GraphDisplay from "../analysis/GraphDisplay";
import { useAuth } from "../../context/AuthContext";
import { GAME_ID } from '../../config';

const GetMetrics = ({ 
  selectedTime, 
  onTimeChange, 
  specificMetric = null, 
  specificMetricType = null, // For the overview Graphs!!!
  readOnly = false,
  initialDateFilter = null,
  hideSkeletons = false,  
  userIds = [],
  prefetchedData = null, // For the overview Graphs!!
  isDataLoading = false
}) => {
  const { userId } = useAuth();
  
  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(isDataLoading !== false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(initialDateFilter || { type: "last", days: 30 });
  const [metricKnowledge, setMetricKnowledge] = useState({});
  
  const CACHE_DURATION = 5 * 60 * 1000;
  
// UPDATED: Handle both single metric and array of metrics to optimize API calls
const metricsToRequest = Array.isArray(specificMetric) 
  ? specificMetric   // If specificMetric is already an array, use it directly
  : specificMetric 
    ? [specificMetric]   // If specificMetric is a single string, wrap in array
    : [
      "dau",
      "wau", 
      "mau", 
      "rolling_retention", 
      "total_sessions_each_day", 
      "avg_sessions_per_day", 
      "session_distribution_by_hour", 
      "avg_session_length", 
      "session_length_distribution",
    ];

  // const GAME_ID = "ludogoldrush";

  useEffect(() => {
    if (initialDateFilter) {
      console.log('GetMetrics - Using updated initialDateFilter:', initialDateFilter);
      setDateFilter(initialDateFilter);
      return;
    }
    console.log('GetMetrics - Time filter changed to:', selectedTime);
    console.log('GetMetrics - For specific metric:', specificMetric);
    
    if (!selectedTime) {
      console.log('GetMetrics - No selectedTime provided, skipping filter update');
      return;
    }
    
    let apiDateFilter = { type: "last", days: 30 };
    
    switch(selectedTime) {
      case "Today":
        apiDateFilter = { type: "last", days: 0 };
        break;
      case "Yesterday":
        apiDateFilter = { type: "last", days: 1 };
        break;
      case "7D":
        apiDateFilter = { type: "last", days: 7 };
        break;
      case "30D":
        apiDateFilter = { type: "last", days: 30 };
        break;
      case "3M":
        apiDateFilter = { type: "last", days: 90 };
        break;
      case "6M":
        apiDateFilter = { type: "last", days: 180 };
        break;
      case "12M":
        apiDateFilter = { type: "last", days: 365 };
        break;
      default:
        if (selectedTime.includes(" - ")) {
          const [start, end] = selectedTime.split(" - ");
          apiDateFilter = { 
            type: "between", 
            start_date: formatApiDate(start.trim()),
            end_date: formatApiDate(end.trim())
          };
          console.log('GetMetrics - Parsed date range:', apiDateFilter);
        } else if (selectedTime.startsWith("Since ")) {
          const sinceDate = selectedTime.replace("Since ", "").trim();
          apiDateFilter = { 
            type: "since", 
            start_date: formatApiDate(sinceDate)
          };
          console.log('GetMetrics - Parsed since date:', apiDateFilter);
        } else if (selectedTime.startsWith("Last ")) {
          const daysText = selectedTime.replace("Last ", "").replace(" days", "").trim();
          const days = parseInt(daysText);
          if (!isNaN(days)) {
            apiDateFilter = { type: "last", days: days };
            console.log(`GetMetrics - Parsed custom Last ${days} days filter`);
          } else {
            console.log('GetMetrics - Could not parse days from:', selectedTime);
          }
        }
    }
    
    console.log('GetMetrics - Converted to API date filter:', apiDateFilter);
    console.log('GetMetrics - Using for specific metric:', specificMetric || 'all metrics');
    setDateFilter(apiDateFilter);
  }, [selectedTime, specificMetric, initialDateFilter]);

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
  
  // Simple mock function that returns empty knowledge data
  const fetchMetricKnowledge = async () => {
    console.log('GetMetrics - Using mock metric knowledge data (API disabled)');
    return {}; 
  };
  
  const transformMetricsForGraphs = (metricsData, knowledgeData = {}) => {
    if (!metricsData || !metricsData.metrics || !Array.isArray(metricsData.metrics)) {
      console.log("GetMetrics - No valid metrics data to transform");
      return [];
    }

    console.log("GetMetrics - Transforming metrics data:", metricsData);
    console.log("GetMetrics - Using knowledge data:", knowledgeData);

    return metricsData.metrics.map(metric => {
      let metricType = metric.type;
      if (specificMetric && metric.metric_id === specificMetric && specificMetricType) {
        metricType = specificMetricType;
        console.log(`GetMetrics - Using specific metric type ${specificMetricType} for ${specificMetric}`);
      }
      
      const isTimeSeries = metricType === "line" || 
                          (metric.values && metric.values.length > 0 && 
                           metric.values[0].length === 2 && 
                           !isNaN(new Date(metric.values[0][0])));

      metricType = metricType || (isTimeSeries ? 'line' : 'bar');

      console.log(`GetMetrics - Processing metric ${metric.metric_id} as ${metricType} chart`);
      
      const metricId = metric.metric_id || '';
      const knowledgeInfo = knowledgeData[metricId] || {};
      const description = knowledgeInfo.description || metric.description || '';

      if (metricType === 'multiline') {
        return {
          metric_id: metricId || `metric-${Math.random().toString(36).substr(2, 9)}`,
          metric_type: metricType,
          title: metric.name || "Untitled Metric",
          description: description,
          categories: metric.categories || [],
          series: metric.series || [],
          x_label: metric.x_label || "Date",
          y_label: metric.y_label || "Value",
          x_unit: metric.x_unit || "",
          y_unit: metric.y_unit || "",
          value_unit: metric.value_unit || "",
          status: knowledgeInfo.status || "pending"
        };
      } else {
// In the transformMetricsForGraphs function in GetMetrics.js, modify the non-multiline section:
return {
  metric_id: metricId || `metric-${Math.random().toString(36).substr(2, 9)}`,
  metric_type: metricType,
  title: metric.name || "Untitled Metric",
  description: description,
  columns: [
    metric.x_label || "Date", 
    metric.y_label || "Value"
  ],
  values: metric.values || [],
  categories: metric.categories || [], // Add this line to pass categories
  x_unit: metric.x_unit || "",
  y_unit: metric.y_unit || "",
  value_unit: metric.value_unit || "",
  status: knowledgeInfo.status || "pending"
};
      }
    });
  };

  const processPrefetchedData = async () => {
    if (!prefetchedData) {
      console.log("GetMetrics - No pre-fetched data available, skipping");
      return false;
    }
    
    console.log("GetMetrics - Processing pre-fetched data:", prefetchedData);
    
    try {
      const knowledgeData = await fetchMetricKnowledge();
      
      const singleMetricData = {
        metrics: [prefetchedData]
      };
      
      const transformedData = transformMetricsForGraphs(singleMetricData, knowledgeData);
      console.log('GetMetrics - Transformed pre-fetched data with knowledge:', transformedData);
      
      setGraphData(transformedData);
      setIsLoading(false);
      
      return true;
    } catch (err) {
      console.error('GetMetrics - Error processing pre-fetched data:', err);
      return false;
    }
  };

  const fetchMetricsData = async () => {
    try {
      setIsLoading(true);
      
      const dataProcessed = await processPrefetchedData();
      if (dataProcessed) {
        console.log('GetMetrics - Used pre-fetched data, skipping API call');
        return;
      }
      
      const dateFilterStr = JSON.stringify(dateFilter);
      const cacheKey = specificMetric 
        ? `dashboard_metrics_graphs_cache_${specificMetric}_${dateFilterStr}` 
        : `dashboard_metrics_graphs_cache_${dateFilterStr}`;
      
      console.log('GetMetrics - Using cache key:', cacheKey);
      
      if (specificMetric) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`dashboard_metrics_graphs_cache_${specificMetric}_`) && key !== cacheKey) {
            console.log('GetMetrics - Clearing conflicting cache:', key);
            localStorage.removeItem(key);
          }
        });
      }
      
      const cachedMetrics = localStorage.getItem(cacheKey);
      if (cachedMetrics) {
        const { data: cachedMetricsData, timestamp } = JSON.parse(cachedMetrics);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('GetMetrics - Loading metrics from cache for filter:', dateFilter);
          
          const knowledgeData = await fetchMetricKnowledge();
          
          const transformedData = transformMetricsForGraphs(cachedMetricsData, knowledgeData);
          console.log('GetMetrics - Transformed cached data with knowledge:', transformedData);
          
          setGraphData(transformedData);
          setIsLoading(false);
          return;
        } else {
          console.log('GetMetrics - Cache expired, fetching fresh data');
        }
      } else {
        console.log('GetMetrics - No cache found, fetching fresh data');
      }

      const startTime = performance.now();
      console.log('GetMetrics - Fetching fresh metrics data with filter:', dateFilter);
      console.log('GetMetrics - Requesting metrics:', metricsToRequest);
      
      const requestBody = {
        metrics: metricsToRequest,
        date_filter: dateFilter,
        ...(userIds && userIds.length > 0 && { user_ids: userIds }),
        ...(userId && (!userIds || userIds.length === 0) && { user_id: userId }),
        game_id: GAME_ID
      };
      
      console.log('GetMetrics - Full API request payload:', requestBody);
      
      const response = await fetch('https://get-metrics-nrosabqhla-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const endTime = performance.now();
      console.log(`GetMetrics - API response time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const metricsData = await response.json();
      console.log('GetMetrics - API Response:', metricsData);
      
      const knowledgeData = await fetchMetricKnowledge();
      
      const graphsData = transformMetricsForGraphs(metricsData, knowledgeData);
      console.log('GetMetrics - Transformed graph data with knowledge:', graphsData);
      
      setGraphData(graphsData);

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: metricsData,
          timestamp: Date.now()
        }));
        console.log('GetMetrics - Metrics data cached successfully with key:', cacheKey);
      } catch (error) {
        console.error('GetMetrics - Error caching metrics:', error);
      }
    } catch (err) {
      console.error('GetMetrics - Error fetching metrics:', err);
      setError(`Failed to load metrics data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('GetMetrics - Fetching data for dateFilter:', dateFilter, 'specificMetric:', specificMetric, 'prefetchedData:', prefetchedData ? 'available' : 'not available');
    
    if (isDataLoading !== undefined) {
      setIsLoading(isDataLoading);
    }
    
    fetchMetricsData();
  }, [dateFilter, specificMetric, prefetchedData, isDataLoading]);

  const renderSkeletonGraphs = () => {
    return (
      <>
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className={`${styles.skeletonGraph}`}>
            <div className={styles.skeletonGraphTitle}></div>
            <div className={styles.skeletonGraphContent}></div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={styles.metricsGraphContainer}>
      {!readOnly && <h3 className={styles.sectionTitle}>Metrics Visualization</h3>}
      
      {isLoading ? (
        !hideSkeletons ? (
          <div className={styles.skeletonContainer}>
            {renderSkeletonGraphs()}
          </div>
        ) : <div className={styles.hiddenLoading}></div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : (
        graphData.length > 0 ? (
          <div className={styles.graphsWrapper}>
            <GraphDisplay graphs={graphData} />
          </div>
        ) : (
          <div className={styles.noDataState}>
            No graph data available
          </div>
        )
      )}
    </div>
  );
};

export default GetMetrics;