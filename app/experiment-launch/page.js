"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import styles from "../../styles/ExperimentLaunch.module.css";

export default function ExperimentLaunch() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      console.log("Redirecting to experiment dashboard...");
      router.push("/?tab=experiment");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.mainLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.experimentGlass}>
            <div className={`${styles.glassEffect} ${isVisible ? styles.visible : ''}`}>
              <div className={styles.contentRow}>
                <div className={`${styles.rocketCircle} ${isVisible ? styles.animate : ''}`}>
                  <Image
                    src="/rocket.svg"
                    alt="Rocket Icon"
                    width={80}
                    height={80}
                    priority
                    className={styles.rocketIcon}
                  />
                </div>
                <h1 className={`${styles.launchTitle} ${isVisible ? styles.visible : ''}`}>
                  Experiment Successfully Launched!
                </h1>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}