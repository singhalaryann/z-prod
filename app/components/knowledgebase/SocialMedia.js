// "use client";

// import React, { useState, useEffect } from "react";
// import styles from "../../../styles/knowledgebase/SocialMedia.module.css";
// import { ChevronDown } from "lucide-react";
// import LoadingAnimation from "../common/LoadingAnimation";

// const SocialMedia = () => {
//     // State management
//     const [hoveredId, setHoveredId] = useState(null);
//     const [socialData, setSocialData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedTag, setSelectedTag] = useState(null);
//     const [showSortMenu, setShowSortMenu] = useState(false);
//     const [availableTags, setAvailableTags] = useState([]);

//     // API URL
//     const BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_API_URL || "https://fetchminecraftposts-w5guhfrcya-uc.a.run.app";

//     // Initial data fetch
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 console.log("Fetching initial data...");

//                 const response = await fetch(BASE_URL);
//                 const result = await response.json();
                
//                 if (result.success) {
//                     console.log("Posts received:", result.data);
//                     console.log("Available tags:", result.availableTags);
                    
//                     setSocialData(result.data);
//                     setAvailableTags(result.availableTags);
                    
//                     if (result.availableTags?.length > 0) {
//                         setSelectedTag(result.availableTags[0]);
//                     }
//                 } else {
//                     throw new Error("Failed to fetch data");
//                 }
//             } catch (err) {
//                 console.error("Error fetching data:", err);
//                 setError("Failed to load data");
//                 setSocialData([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     // Fetch filtered posts when tag changes
//     useEffect(() => {
//         const fetchFilteredPosts = async () => {
//             if (!selectedTag) return;

//             try {
//                 setLoading(true);
//                 console.log("Fetching posts for tag:", selectedTag);

//                 const response = await fetch(`${BASE_URL}?tag=${encodeURIComponent(selectedTag)}`);
//                 const result = await response.json();

//                 if (result.success) {
//                     console.log("Filtered posts:", result.data);
//                     setSocialData(result.data);
//                 } else {
//                     throw new Error("Failed to fetch filtered posts");
//                 }
//             } catch (err) {
//                 console.error("Error fetching filtered posts:", err);
//                 setError("Failed to load filtered posts");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchFilteredPosts();
//     }, [selectedTag]);

//     // Close sort menu when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (showSortMenu && !event.target.closest(`.${styles.sortContainer}`)) {
//                 setShowSortMenu(false);
//             }
//         };

//         document.addEventListener('click', handleClickOutside);
//         return () => document.removeEventListener('click', handleClickOutside);
//     }, [showSortMenu]);

//     // Loading state
//     if (loading) {
//         return (
//             <main className={styles.mainContent}>
//                 <LoadingAnimation />
//             </main>
//         );
//     }

//     // Error state
//     if (error) {
//         return <div className={styles.error}>{error}</div>;
//     }

//     // Data validation
//     if (!Array.isArray(socialData)) {
//         console.error("Invalid data format:", socialData);
//         return <div className={styles.error}>Invalid data format</div>;
//     }

//     // Empty state
//     if (socialData.length === 0) {
//         return (
//             <div className={styles.emptyState}>
//                 No posts found {selectedTag ? `for tag: ${selectedTag}` : ''}
//             </div>
//         );
//     }

//     return (
//         <div className={styles.container}>
//             {/* Sort dropdown */}
//             <div className={styles.sortContainer}>
//             <button 
//     className={styles.sortButton}
//     onClick={() => setShowSortMenu(!showSortMenu)}
// >
//     <span>Sort by: {selectedTag || "Select Tag"}</span>
//     <ChevronDown className={showSortMenu ? styles.rotated : ""} />
// </button>
                
//                 {showSortMenu && (
//                     <div className={styles.sortMenu}>
//                         {availableTags.map((tag) => (
//                             <button
//                                 key={tag}
//                                 className={styles.sortOption}
//                                 onClick={() => {
//                                     console.log("Selected tag:", tag);
//                                     setSelectedTag(tag);
//                                     setShowSortMenu(false);
//                                 }}
//                             >
//                                 {tag}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Posts list */}
//             <div className={styles.feedContainer}>
//                 {socialData.map((item, index) => (
//                     <div
//                         key={item.post_id || `post-${index}`}
//                         className={`${styles.card} ${styles.reddit}`}
//                         onMouseEnter={() => setHoveredId(item.post_id)}
//                         onMouseLeave={() => setHoveredId(null)}

//                     >
//                         <div className={styles.cardContent}>
//                             <div className={styles.leftSection}>
//                                 <div className={styles.platformIcon}>
//                                     <img src="/reddit.png" alt="Reddit" width={20} height={20} />
//                                 </div>
//                                 <div className={styles.contentWrapper}>
//                                 <p className={styles.content}>
//                                   {hoveredId === item.post_id ? item.fullContent : item.truncatedSummary}
//                                     </p>
//                                     <div className={styles.tagContainer}>
//                                         {item.tags?.map((tag, tagIndex) => (
//                                             <span key={tagIndex} className={styles.tag}>
//                                                 {tag}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                             <span className={styles.date}>{item.date}</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default SocialMedia;