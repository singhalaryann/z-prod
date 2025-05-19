// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Image from "next/image";
// import styles from "../../../styles/ExperimentForm.module.css";

// const ExperimentForm = ({
//   experimentData,
//   totalPlayers, // Changed from segmentData
//   setExperimentData,
//   onSplitChange,
// }) => {
//   // UPDATED: Better state initialization
//   const [startDate, setStartDate] = useState(() => {
//     const date = new Date();
//     date.setDate(date.getDate() + 7); // Default to 7 days from now
//     return date;
//   });

//   const [isCalendarOpen, setIsCalendarOpen] = useState(false);
//   const [isLabelValid, setIsLabelValid] = useState(true); // NEW: Label validation state

//   // UPDATED: Cleanup and better initialization
//   useEffect(() => {
//     let isSubscribed = true;
//     if (!experimentData?.duration && isSubscribed) {
//       const selectedDay = startDate.getDate(); // Get actual selected days
//       const durationInSeconds = selectedDay * 24 * 60 * 60;

//       console.log("Default selected days:", selectedDay);
//       console.log("Default duration converted to seconds:", durationInSeconds);

//       setExperimentData((prev) => ({
//         ...prev,
//         duration: durationInSeconds,
//         split: prev?.split || 50, // Default to 50% split if not set
//       }));
//     }

//     // Cleanup function
//     return () => {
//       isSubscribed = false;
//     };
//   }, []);

//   // NEW: Click outside handler for calendar
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isCalendarOpen && !event.target.closest(".react-datepicker")) {
//         setIsCalendarOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isCalendarOpen]);

//   // Debug logging
//   useEffect(() => {
//     console.log("ExperimentForm - Current data:", {
//       experimentData,
//       totalPlayers, // Changed to totalPlayers
//     });
//   }, [experimentData, totalPlayers]);

//   // ADD NEW EFFECT HERE - After existing useEffects but before handlers
//   useEffect(() => {
//     if (
//       experimentData?.split &&
//       totalPlayers &&
//       !experimentData.groups?.control?.traffic_split
//     ) {
//       const controlUsers = Math.round(
//         (experimentData.split / 100) * totalPlayers
//       );
//       const variantUsers = totalPlayers - controlUsers;
//       onSplitChange(experimentData.split, controlUsers, variantUsers);
//     }
//   }, [
//     experimentData?.split,
//     totalPlayers,
//     onSplitChange,
//     experimentData.groups,
//   ]);

//   // UPDATED: Enhanced date handling
//   const handleDateChange = useCallback(
//     (date) => {
//       if (!date) return;

//       setStartDate(date);
//       setIsCalendarOpen(false);

//       const selectedDay = date.getDate();
//       const durationInSeconds = selectedDay * 24 * 60 * 60;

//       console.log("Selected days:", selectedDay);
//       console.log("Converted to seconds:", durationInSeconds);

//       setExperimentData((prev) => ({
//         ...prev,
//         duration: durationInSeconds,
//       }));
//     },
//     [setExperimentData]
//   );

//   // UPDATED: Enhanced label validation and change handler
//   const handleLabelChange = useCallback(
//     (e) => {
//       const value = e.target.value;
//       const isValid = value.length > 0 && value.length <= 100; // Basic validation

//       setIsLabelValid(isValid);
//       setExperimentData((prev) => ({
//         ...prev,
//         label: value,
//       }));
//     },
//     [setExperimentData]
//   );

//   // UPDATED: Enhanced split handling with validation
//   const handleSplitChange = useCallback(
//     (value) => {
//       const splitValue = Number(value);
//       if (isNaN(splitValue) || splitValue < 0 || splitValue > 100) {
//         console.error("Invalid split value:", value);
//         return;
//       }

//       console.log("Traffic split changed to:", splitValue);

//       // FIXED: Using totalPlayers prop instead of experimentData.total_players
//       const controlUsers = Math.round((splitValue / 100) * totalPlayers);
//       const variantUsers = totalPlayers - controlUsers;

//       setExperimentData((prev) => ({
//         ...prev,
//         split: splitValue,
//       }));

//       onSplitChange(splitValue, controlUsers, variantUsers);
//     },
//     [totalPlayers, setExperimentData, onSplitChange] // FIXED: Updated dependency array
//   );

//   // Update formatSegmentDisplay function
//   const formatSegmentDisplay = useCallback(() => {
//     if (!totalPlayers) return "No users available";
//     return `All Users ${totalPlayers.toLocaleString()}`;
//   }, [totalPlayers]);

//   return (
//     <div className={styles.outerWrapper}>
//       {/* Label Row */}
//       <div className={styles.rowGroup}>
//         {/* Experiment Label */}
//         <div className={styles.formGroup}>
//           <label className={styles.label}>Experiment Label</label>
//           <input
//             type="text"
//             className={`${styles.input} ${
//               !isLabelValid ? styles.inputError : ""
//             }`}
//             value={experimentData?.label || ""}
//             onChange={handleLabelChange}
//             placeholder="Enter experiment label"
//             maxLength={100}
//           />
//           {!isLabelValid && (
//             <span className={styles.errorText}>Please enter a valid label</span>
//           )}
//         </div>

//         {/* Duration with Calendar */}
//         <div className={styles.formGroup}>
//           <label className={styles.label}>Experiment Duration</label>
//           <div className={styles.durationWrapper}>
//             <input
//               type="text"
//               className={`${styles.input} ${styles.durationInput}`}
//               value={
//                 startDate
//                   ? `${Math.ceil(
//                       (startDate - new Date()) / (1000 * 60 * 60 * 24)
//                     )} days`
//                   : ""
//               }
//               placeholder="Select duration"
//               onClick={() => setIsCalendarOpen(!isCalendarOpen)}
//               readOnly
//             />
//             <button
//               className={styles.calendarButton}
//               onClick={() => setIsCalendarOpen(!isCalendarOpen)}
//               type="button"
//               aria-label="Open calendar"
//             >
//               <Image
//                 src="/calender.png"
//                 alt="Calendar"
//                 width={20}
//                 height={20}
//                 className={styles.calendarIcon}
//               />
//             </button>
//             {isCalendarOpen && (
//               <div className={styles.calendarContainer}>
//                 <DatePicker
//                   selected={startDate}
//                   onChange={handleDateChange}
//                   minDate={new Date()}
//                   inline
//                   calendarClassName={styles.calendar}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Segment Information */}
//       <div className={styles.formGroup}>
//         <label className={styles.label}>Users</label>
//         <input
//           type="text"
//           className={styles.input}
//           value={formatSegmentDisplay()}
//           readOnly
//           disabled
//         />
//       </div>

//       {/* Traffic Split Slider */}
//       <div className={styles.formGroup}>
//         <label className={styles.label}>Traffic Split</label>
//         <div className={styles.sliderContainer}>
//           <div className={styles.sliderBox}>
//             <div className={styles.sliderTrack}>
//               <div
//                 className={styles.sliderFill}
//                 style={{
//                   width: `${experimentData?.split || 0}%`,
//                 }}
//               />
//             </div>
//             <input
//               type="range"
//               min="0"
//               max="100"
//               value={experimentData?.split || 0}
//               onChange={(e) => handleSplitChange(e.target.value)}
//               className={styles.slider}
//               aria-label="Traffic split percentage"
//             />
//             <div
//               className={styles.sliderBubble}
//               style={{
//                 left: `calc(${experimentData?.split || 0}% - 15px)`,
//               }}
//             >
//               {experimentData?.split || 0}%
//             </div>
//           </div>
//           <div className={styles.sliderLabels}>
//             <span>0%</span>
//             <span>20%</span>
//             <span>40%</span>
//             <span>60%</span>
//             <span>80%</span>
//             <span>100%</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExperimentForm;
