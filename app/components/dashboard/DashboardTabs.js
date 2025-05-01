"use client";
import React from "react";
import Image from "next/image";
import { Layout } from "lucide-react";
import styles from "../../../styles/DashboardTabs.module.css";
import Overview from "./Overview";

const DashboardTabs = ({
  activeTab,
  onTabChange,
  children,
  experimentContent,
  selectedTime,
  onTimeChange,
}) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "overview" ? styles.active : ""
          }`}
          onClick={() => onTabChange("overview")}
        >
          <Layout
            className={styles.tabIcon}
            size={20}
          />
          <span>Overview</span>
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "insights" ? styles.active : ""
          }`}
          onClick={() => onTabChange("insights")}
        >
          <Image
            src="/insights.svg"
            alt="Insights"
            width={20}
            height={20}
            className={styles.tabIcon}
          />
          <span>Insights</span>
        </button>
        {/* COMMENTED: Experiment tab removed
        <button
          className={`${styles.tabButton} ${
            activeTab === "experiment" ? styles.active : ""
          }`}
          onClick={() => onTabChange("experiment")}
        >
          <Image
            src="/experiment_content.svg"
            alt="Experiments"
            width={20}
            height={20}
            className={styles.tabIcon}
          />
          <span>Experiments</span>
        </button>
        */}
      </div>
      <div className={styles.tabContent}>
        {activeTab === "insights"
          ? children
          : activeTab === "overview"
          ? <Overview selectedTime={selectedTime} />
          : experimentContent
        }
      </div>
    </div>
  );
};

export default DashboardTabs;