// 'use client';
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import styles from '../../../styles/IdeaCard.module.css';
// import {ArrowRight} from 'lucide-react';
// import Image from "next/image";
// import { GAME_ID } from '../../config';

// const IdeaCard = ({ number, description, ideaId, insightId }) => {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Cache duration: 5 minutes in milliseconds
//   const CACHE_DURATION = 5 * 60 * 1000;
  
//   // Game ID constant
//   // const GAME_ID = "ludogoldrush";
  
//   const handleViewIdea = async () => {
//     console.log("🖱️ View idea clicked for idea:", ideaId);
//     try {
//       setIsLoading(true);
      
//       // Check cache first
//       const cacheKey = `chat_cache_${ideaId}`;
//       const cachedData = localStorage.getItem(cacheKey);
//       if (cachedData) {
//         const { chatId, timestamp } = JSON.parse(cachedData);
//         if (Date.now() - timestamp < CACHE_DURATION) {
//           const loadStart = performance.now();
//           console.log('🔄 Loading chat ID from cache...');
//           const loadEnd = performance.now();
//           console.log(`✅ Cache load completed in ${((loadEnd - loadStart) / 1000).toFixed(2)} seconds`);
          
//           // Route to analysis page with cached chat ID
//           router.push(`/analysis?idea=${ideaId}&insight=${insightId}&chat=${chatId}`);
//           return;
//         } else {
//           console.log('🕒 Chat cache expired, fetching fresh data...');
//         }
//       } else {
//         console.log('💭 No chat cache found, fetching fresh data...');
//       }
      
//       // If no valid cache, initialize new chat
//       const apiStart = performance.now();
//       console.log('🔄 Starting API call to initialize chat...');
      
//       const response = await fetch('https://generate-chat-endpoint-flnr5jia5q-uc.a.run.app', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           idea_id: ideaId,
//           game_id: GAME_ID
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to initialize chat: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('📊 Chat initialization response:', data);
      
//       const apiEnd = performance.now();
//       console.log(`✅ Chat initialization completed in ${((apiEnd - apiStart) / 1000).toFixed(2)} seconds`);
      
//       // Cache the chat ID
//       try {
//         localStorage.setItem(cacheKey, JSON.stringify({
//           chatId: data.chat_id,
//           timestamp: Date.now()
//         }));
//         console.log('💾 Chat ID cached successfully');
//       } catch (error) {
//         console.error('❌ Error caching chat ID:', error);
//       }
      
//       // Route to analysis page with new chat ID
//       router.push(`/analysis?idea=${ideaId}&insight=${insightId}&chat=${data.chat_id}`);
//     } catch (error) {
//       console.error('❌ Error initializing chat:', error);
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <div className={styles.card}>
//       <div className={styles.glassEffect}>
//         <div className={styles.content}>
//           {/* CHANGED: Replaced ideaLabel with ideaPill to get the pill-shaped button */}
//           <div className={styles.ideaPill}>
//             <Image
//               src="/bulb.svg"
//               alt="Lightbulb"
//               width={16}
//               height={16}
//               className={styles.bulbIcon}
//             />
//             <span>Idea {number}</span>
//           </div>
          
//           <p className={styles.description}>{description || 'No description available'}</p>
          
//           {isLoading ? (
//             <button className={styles.viewButton} disabled>
//               <div className={styles.viewButtonContent}>
//                 <span>Loading...</span>
//               </div>
//             </button>
//           ) : (
//             <button className={styles.viewButton} onClick={handleViewIdea}>
//               <div className={styles.viewButtonContent}>
//                 <Image
//                   src="/bulb.svg"
//                   alt="Lightbulb"
//                   width={16}
//                   height={16}
//                   className={styles.buttonIcon}
//                 />
//                 <span>View Idea</span>
//                 <ArrowRight size={16} />
//               </div>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IdeaCard;