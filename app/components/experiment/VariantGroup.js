// "use client";
// import React from "react";
// import styles from "../../../styles/VariantGroup.module.css";

// const VariantGroup = ({ experimentData, offerData }) => {
//   // Debug logging
//   console.log("VariantGroup received props:", {
//     experimentData,
//     offerData,
//   });

//   // Basic validation check
//   if (!experimentData || !experimentData.groups) {
//     return (
//       <div className={styles.variantSection}>
//         <div className={styles.noVariants}>No experiment data available</div>
//       </div>
//     );
//   }

//   const { control, variant } = experimentData.groups;

//   const renderVariantSection = (groupData, title, isControl = false) => {
//     if (!groupData) {
//       return (
//         <div className={styles.variantGroup}>
//           <div className={styles.variantTitleContainer}>
//             <span className={styles.variantTitle}>{title}</span>
//           </div>
//           <div className={styles.variantContent}>
//             <div className={styles.noData}>
//               No data available for this variant
//             </div>
//           </div>
//         </div>
//       );
//     }

//     const groupOfferData = isControl ? offerData?.control : offerData?.variant;
//     const trafficSplit = groupData?.traffic_split || 0;

//     return (
//       <div className={styles.variantGroup}>
//         {/* Variant Title */}
//         <div className={styles.variantTitleContainer}>
//           <span className={styles.variantTitle}>{title}</span>
//         </div>
//         <div className={styles.variantContent}>
//           {/* Bundle Name */}
//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Bundle Name</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={groupOfferData?.offer_name || "No Bundle Name"}
//               readOnly
//             />
//           </div>

//           {/* Traffic Split Display */}
//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Traffic Split</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={`${trafficSplit.toLocaleString()} users`}
//               readOnly
//             />
//           </div>

//           {/* Offer ID */}
//           <div className={styles.inputGroup}>
//             <label className={styles.label}>Offer ID</label>
//             <input
//               type="text"
//               className={styles.input}
//               value={groupData?.offer_id || "No offer ID"}
//               readOnly
//             />
//           </div>

//           {/* Items Table */}
//           <div className={styles.glassBox}>
//             <table className={styles.featureTable}>
//               <thead>
//                 <tr>
//                   <th className={styles.tableHeader}>Name</th>
//                   <th className={styles.tableHeader}>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupOfferData?.items?.length > 0 ? (
//                   groupOfferData.items.map((item, index) => (
//                     <tr
//                       key={`${item.name}-${index}`}
//                       className={styles.tableRow}
//                     >
//                       <td className={styles.tableCell}>{item.name || "N/A"}</td>
//                       <td
//                         className={`${styles.tableCell} ${styles.quantityCell}`}
//                       >
//                         {item.amount || 0}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={2}
//                       className={`${styles.tableCell} ${styles.noItems}`}
//                     >
//                       No items available
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   try {
//     return (
//       <div className={styles.variantSection}>
//         {/* Render Control Group */}
//         {renderVariantSection(control, "Control Group", true)}

//         {/* Render Variant A */}
//         {renderVariantSection(variant, "Variant A", false)}

//         {/* Show message if no variants available */}
//         {!control && !variant && (
//           <div className={styles.noVariants}>No variant groups available</div>
//         )}
//       </div>
//     );
//   } catch (error) {
//     console.error("Error rendering VariantGroup:", error);
//     return (
//       <div className={styles.variantSection}>
//         <div className={styles.error}>
//           Error displaying variant groups. Please try again.
//         </div>
//       </div>
//     );
//   }
// };

// export default VariantGroup;
// //