// // app/ideas/page.js
// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '../context/AuthContext';
// import Header from '../components/layout/Header';
// import Sidebar from '../components/layout/Sidebar';
// import IdeaCard from '../components/ideas/IdeaCard';
// import styles from '../../styles/Ideas.module.css';
// import LoadingAnimation from '../components/common/LoadingAnimation';
// import { FaLightbulb } from 'react-icons/fa';
// import { GAME_ID } from '../../config';

// export default function IdeasPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { userId } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [ideasData, setIdeasData] = useState(null);
  
//   // Cache duration: 5 minutes in milliseconds
//   const CACHE_DURATION = 5 * 60 * 1000;
  
//   const [isInitialRender, setIsInitialRender] = useState(true);
  
//   // Fixed game ID for ideas as provided
//   // const GAME_ID = "ludogoldrush";

//   useEffect(() => {
//     const fetchIdeas = async () => {
//       try {
//         const insightId = searchParams.get('insight');
//         console.log('🔍 Processing ideas request for:', { userId, insightId, gameId: GAME_ID });
        
//         setIsInitialRender(false);
        
//         if (!userId) {
//           console.log('⚠️ Missing user ID, redirecting to dashboard');
//           router.push('/');
//           return;
//         }

//         // Check cache first
//         const cacheKey = `ideas_cache_${GAME_ID}`;
//         const cachedData = localStorage.getItem(cacheKey);
//         if (cachedData) {
//           const { data: cachedIdeas, timestamp } = JSON.parse(cachedData);
//           if (Date.now() - timestamp < CACHE_DURATION) {
//             const loadStart = performance.now();
//             console.log('🔄 Loading ideas from cache...');
            
//             setIdeasData(cachedIdeas);
            
//             const loadEnd = performance.now();
//             console.log(`✅ Cache load completed in ${((loadEnd - loadStart) / 1000).toFixed(2)} seconds`);
//             setLoading(false);
//             return;
//           } else {
//             console.log('🕒 Cache expired, fetching fresh data...');
//           }
//         } else {
//           console.log('💭 No cache found, fetching fresh data...');
//         }
        
//         // Fetch from API if no valid cache
//         const apiStart = performance.now();
//         console.log('🔄 Starting API call to fetch ideas...');
        
//         const response = await fetch('https://get-ideas-nrosabqhla-uc.a.run.app', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user_id: userId,
//             game_id: GAME_ID
//           })
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('📊 Received ideas data:', data);
        
//         const apiEnd = performance.now();
//         console.log(`✅ API call completed in ${((apiEnd - apiStart) / 1000).toFixed(2)} seconds`);
        
//         // Process the data directly without merging with previous
//         const processedData = {
//           count: data.count,
//           ideas: data.ideas || []
//         };
        
//         setIdeasData(processedData);

//         // Cache the data
//         try {
//           localStorage.setItem(cacheKey, JSON.stringify({
//             data: processedData,
//             timestamp: Date.now()
//           }));
//           console.log('💾 Ideas data cached successfully');
//         } catch (error) {
//           console.error('❌ Error caching ideas:', error);
//         }

//       } catch (error) {
//         console.error('❌ Error fetching ideas:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchIdeas();
//   }, [userId, searchParams, router, GAME_ID]);

//   // Render skeleton content function
//   const renderSkeletonContent = () => {
//     return (
//       <div className={styles.content}>
//         {/* Added section title to skeleton */}
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.sectionTitle}>
//             <FaLightbulb className={styles.titleIcon} />
//             Ideas
//           </h2>
//         </div>
        
//         <div className={styles.ideasContainer}>
//           {[1, 2, 3, 4].map((index) => (
//             <div key={index} className={`${styles.skeletonCard}`}>
//               <div className={styles.glassEffect}>
//                 <div className={styles.content}>
//                   <div className={`${styles.skeletonIdeaLabel}`}>
//                     <div className={styles.skeletonBulb}></div>
//                     <div className={styles.skeletonLabelText}></div>
//                   </div>
//                   <div className={styles.skeletonDescription}></div>
//                   <div className={styles.skeletonButton}></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className={styles.container}>
//       <Header />
//       <div className={styles.mainLayout}>
//         <Sidebar />
//         <main className={styles.mainContent}>
//           {/* Show skeleton content when loading */}
//           {isInitialRender || loading ? (
//             renderSkeletonContent()
//           ) : (
//             <div className={styles.content}>
//               {/* Added section title here */}
//               <div className={styles.sectionHeader}>
//                 <h2 className={styles.sectionTitle}>
//                   <FaLightbulb className={styles.titleIcon} />
//                   Ideas
//                 </h2>
//               </div>
              
//               <div className={styles.ideasContainer}>
//                 {ideasData?.ideas && ideasData.ideas.length > 0 ? (
//                   ideasData.ideas.map((idea, index) => (
//                     <IdeaCard
//                       key={idea.idea_id || `idea-${index}`}
//                       number={index + 1}
//                       description={idea.idea_desc || idea.description || ''}
//                       ideaId={idea.idea_id || `idea-${index}`}
//                       insightId={idea.insights || searchParams.get('insight') || ''}
//                     />
//                   ))
//                 ) : (
//                   <div className={styles.noIdeas}>No ideas available</div>
//                 )}
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }