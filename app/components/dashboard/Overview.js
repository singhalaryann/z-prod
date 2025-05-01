"use client";
import React from "react";
import { Users, Target, TrendingUp, Clock, Award, ChartBar } from "lucide-react";
import styles from "../../../styles/Overview.module.css";

const Overview = () => {
  // Dummy data for overview section
  const overviewStats = [
    {
      title: "Total Users",
      value: "124.8K",
      change: "+12.50%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: "3.42%",
      change: "+0.8%",
      isPositive: true,
      icon: Target,
    },
    {
      title: "Revenue Growth",
      value: "$847.5K",
      change: "-2.4%",
      isPositive: false,
      icon: TrendingUp,
    },
    {
      title: "Avg. Session Time",
      value: "4m 38s",
      change: "+1.2%",
      isPositive: true,
      icon: Clock,
    }
  ];

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