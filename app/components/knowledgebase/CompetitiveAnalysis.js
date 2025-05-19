// // components/knowledgebase/CompetitiveAnalysis.js
// "use client";
// import React, { useState, useEffect } from "react";
// import styles from "../../../styles/knowledgebase/CompetitiveAnalysis.module.css";
// import { PieChart, BarChart2, TrendingUp } from "lucide-react";

// const CompetitiveAnalysis = () => {
//   // State management
//   const [analysisData, setAnalysisData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get icon based on analysis type
//   const getAnalysisIcon = (type) => {
//     switch (type?.toLowerCase()) {
//       case 'market':
//         return <PieChart size={20} />;
//       case 'performance':
//         return <BarChart2 size={20} />;
//       case 'trend':
//         return <TrendingUp size={20} />;
//       default:
//         return <PieChart size={20} />;
//     }
//   };

//   useEffect(() => {
//     const fetchAnalysisData = async () => {
//       try {
//         setLoading(true);
//         console.log("Fetching competitive analysis data...");

//         // TODO: Replace with actual API endpoint
//         // const response = await fetch('YOUR_API_ENDPOINT');
//         // const data = await response.json();
//         // console.log("Received data:", data);
//         // setAnalysisData(data);

//         // Temporary mock data - remove when API is available
//         setAnalysisData([
//           {
//             id: 1,
//             type: "market",
//             title: "Market Share Analysis",
//             content: "Competitive positioning in the gaming market shows strong growth potential",
//             date: "5 Feb 2025"
//           },
//           // Add more mock items as needed
//         ]);

//       } catch (err) {
//         console.error("Error fetching analysis data:", err);
//         setError("Failed to load competitive analysis data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalysisData();
//   }, []);

//   if (loading) {
//     return <div className={styles.loading}>Loading...</div>;
//   }

//   if (error) {
//     return <div className={styles.error}>{error}</div>;
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h2>Competitive Analysis</h2>
//       </div>

//       <div className={styles.analysisContainer}>
//         {analysisData.map((item) => (
//           <div key={item.id} className={styles.card}>
//             <div className={styles.glassEffect}>
//               <div className={styles.cardContent}>
//                 <div className={styles.cardHeader}>
//                   <div className={styles.analysisIcon}>
//                     {getAnalysisIcon(item.type)}
//                   </div>
//                   <span className={styles.date}>{item.date}</span>
//                 </div>
//                 <h3 className={styles.title}>{item.title}</h3>
//                 <p className={styles.content}>{item.content}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CompetitiveAnalysis;