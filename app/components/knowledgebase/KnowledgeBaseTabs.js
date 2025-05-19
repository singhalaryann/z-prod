// // components/knowledgebase/KnowledgeBaseTabs.js
// "use client";
// import React, { useState } from "react";
// import Image from "next/image";
// import { PieChart } from "lucide-react";
// import styles from "../../../styles/knowledgebase/KnowledgeBaseTabs.module.css";

// const KnowledgeBaseTabs = ({ activeTab, onTabChange }) => {
//   return (
//     <div className={styles.tabHeader}>
//       <button
//   className={`${styles.tabButton} ${
//     activeTab === "social" ? styles.active : ""
//   }`}
//   onClick={() => onTabChange("social")}
// >
//   <Image 
//     src="/social_media.svg"
//     alt="Social Media"
//     width={20}
//     height={20}
//     className={styles.tabIcon}
//   />
//   <span>Social Media</span>
// </button>
// <button
//   className={`${styles.tabButton} ${
//     activeTab === "knowledge" ? styles.active : ""
//   }`}
//   onClick={() => onTabChange("knowledge")}
// >
//   <Image 
//     src="/kb_tab.svg"
//     alt="Knowledge Base"
//     width={20}
//     height={20}
//     className={styles.tabIcon}
//   />
//   <span>Knowledge Base</span>
// </button>
//       {/* <button
//         className={`${styles.tabButton} ${
//           activeTab === "competitive" ? styles.active : ""
//         }`}
//         onClick={() => onTabChange("competitive")}
//       >
//         <PieChart size={20} />
//         <span>Competitive Analysis</span>
//       </button> */}
//     </div>
//   );
// };

// export default KnowledgeBaseTabs;