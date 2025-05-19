// 'use client';
// import React from 'react';
// import { TrendingUp, TrendingDown } from 'lucide-react';
// import styles from '../../../styles/MetricsDisplay.module.css';

// const MetricsDisplay = ({ metrics }) => {
//   if (!metrics || metrics.length === 0) {
//     return null;
//   }

//   console.log('Rendering metrics:', metrics);

//   return (
//     <div className={styles.glassEffect}>
//       <div className={styles.metricsGrid}>
//         {metrics.map((metric) => {
//           // Get the latest value from the values array
//           const latestValue = metric.values ? 
//           (metric.metric_type === 'metric' ? metric.values[0][0] : metric.values[metric.values.length - 1][1]) 
//           : 0;          
//           // Calculate percentage change if we have more than one value
//           let percentageChange = 0;
//           if (metric.values && metric.values.length > 1) {
//             const previousValue = metric.values[metric.values.length - 2][1];
//             percentageChange = ((latestValue - previousValue) / previousValue) * 100;
//           }

//           const isPositive = percentageChange >= 0;
//           const formattedDelta = `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`;

//           return (
//             <div key={metric.metric_id} className={styles.card}>
//               <div className={styles.cardInner}>
//                 <div className={styles.header}>
//                   <h2 className={styles.title}>{metric.title}</h2>
//                   {percentageChange !== 0 && (
//                     <div className={isPositive ? styles.trendIconUp : styles.trendIconDown}>
//                       {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
//                     </div>
//                   )}
//                 </div>
//                 <div className={styles.mainContent}>
//                   <div className={styles.valueWrapper}>
//                     <span className={styles.value}>
//                     {metric.metric_type === 'metric'
//   // Limit to 3 decimals for metrics
//   ? Number(parseFloat(latestValue).toFixed(3)).toLocaleString()
//   : (
//       typeof latestValue === 'number'
//         ? latestValue.toLocaleString()
//         : latestValue
//     )
// }

//                     </span>
//                     <span className={styles.unit}>
//                       {metric.columns && metric.columns[1] ? 
//                         metric.columns[1].replace(/\(([^)]+)\)/, '$1') : ''}
//                     </span>
//                     {percentageChange !== 0 && (
//                       <span className={`${styles.delta} ${isPositive ? styles.positive : styles.negative}`}>
//                         ({formattedDelta})
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 {/* {metric.description && (
//                   <div className={styles.descriptionContainer}>
//                     <p className={styles.description}>{metric.description}</p>
//                   </div>
//                 )} */}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default MetricsDisplay;