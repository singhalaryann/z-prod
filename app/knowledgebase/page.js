// // components/knowledgebase/KnowledgeBase.js
// "use client";
// import React, { useState } from "react";
// import Header from "../components/layout/Header";
// import Sidebar from "../components/layout/Sidebar";
// import KnowledgeBaseTabs from "../components/knowledgebase/KnowledgeBaseTabs";
// import SocialMedia from "../components/knowledgebase/SocialMedia";
// import { Database, MoreVertical } from "lucide-react";
// import styles from "../../styles/knowledgebase/KnowledgeBase.module.css";
// import CompetitiveAnalysis from "../components/knowledgebase/CompetitiveAnalysis";

// const KnowledgeBase = () => {
//   const [activeTab, setActiveTab] = useState("knowledge");

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className={styles.container}>
//       <Header />
//       <div className={styles.mainContainer}>
//         <Sidebar />
//         <div className={styles.content}>
//           <KnowledgeBaseTabs
//             activeTab={activeTab}
//             onTabChange={handleTabChange}
//           />
//           <div className={styles.contentContainer}>
//             {activeTab === "social" && (
//               <SocialMedia /> // New social media component
//             )}
//             {activeTab === "knowledge" && (
//               <div className={styles.dataSourcesContainer}>
//                 <div className={styles.header}>
//                   <h2>Data Sources</h2>
//                   <button className={styles.addButton}>
//                     <span>+</span> Add Data Source
//                   </button>
//                 </div>
//                 <div className={styles.cardsContainer}>
//                   {/* Card with glass effect */}
//                   <div className={styles.card}>
//                     <div className={styles.glassEffect}>
//                       <div className={styles.cardContent}>
//                         <div className={styles.cardHeader}>
//                           <div className={styles.cardIcon}>
//                             <Database size={24} />
//                           </div>
//                           <button className={styles.menuButton}>
//                             <MoreVertical size={16} />
//                           </button>
//                         </div>
//                         <h3>User Events</h3>
//                         <p>MongoDB Data</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Second card */}
//                   <div className={styles.card}>
//                     <div className={styles.glassEffect}>
//                       <div className={styles.cardContent}>
//                         <div className={styles.cardHeader}>
//                           <div className={styles.cardIcon}>
//                             <Database size={24} />
//                           </div>
//                           <button className={styles.menuButton}>
//                             <MoreVertical size={16} />
//                           </button>
//                         </div>
//                         <h3>User Logins</h3>
//                         <p>JSON File</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Third card */}
//                   <div className={styles.card}>
//                     <div className={styles.glassEffect}>
//                       <div className={styles.cardContent}>
//                         <div className={styles.cardHeader}>
//                           <div className={styles.cardIcon}>
//                             <Database size={24} />
//                           </div>
//                           <button className={styles.menuButton}>
//                             <MoreVertical size={16} />
//                           </button>
//                         </div>
//                         <h3>User Analytics</h3>
//                         <p>Mixpanel Data</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {activeTab === "competitive" && <CompetitiveAnalysis />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KnowledgeBase;
