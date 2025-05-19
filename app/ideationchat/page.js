// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import styles from "../../styles/IdeationChat.module.css";
// import Header from "../components/layout/Header";
// import Sidebar from "../components/layout/Sidebar";
// import { 
//   Send, 
//   Loader, 
//   Brain,        
//   BarChart2,    
//   MessageCircle,
//   Store,        
//   FileText, 
//   X 
// } from 'lucide-react';
// import ReactMarkdown from "react-markdown";
// import Image from 'next/image';
// import SplitText from "./SplitText";
// import { useAuth } from "../context/AuthContext";
// import LoginModal from "../components/common/LoginModal";

// // UPDATED: Feature card component with hover state and short/full description
// const FeatureCard = ({ icon: Icon, title, description, shortDescription, onClick }) => {
//   // State to track hover interaction
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div 
//       className={styles.featureCard}
//       // UPDATED: Added hover state management
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={onClick}
//     >
//       <div className={styles.cardIcon}>
//         <Icon size={24} />
//       </div>
//       <h3 className={styles.cardTitle}>{title}</h3>
//       <p className={styles.cardDescription}>
//         {/* UPDATED: Conditionally render short or full description */}
//         {isHovered ? description : shortDescription}
//       </p>
//     </div>
//   );
// };

// // UPDATED: FileItem component with new structure for horizontal layout
// const FileItem = ({ file, onRemove }) => (
//   <div className={styles.fileItem}>
//     <div className={styles.fileContent}>
//       <FileText size={16} className={styles.fileIcon} />
//       <span className={styles.fileName}>{file.name}</span>
//     </div>
//     <button className={styles.removeFileBtn} onClick={() => onRemove(file)}>
//       <X size={14} />
//     </button>
//   </div>
// );

// export default function IdeationChat() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  
//   // UPDATED: Added states for login modal and prompt tracking
//   const [promptCount, setPromptCount] = useState(0);
//   const [showLoginModal, setShowLoginModal] = useState(false);
  
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const router = useRouter();
//   const { userId } = useAuth();

//   // UPDATED: New feature cards with short descriptions
//   const featureCards = [
//     {
//       icon: Brain,
//       title: "AI LiveOps",
//       // UPDATED: Added short description for initial view
//       shortDescription: "Optimize game events with AI",
//       description: "Smarter Events. Deeper Engagement. Automate and optimize your LiveOps with generative AI. From event planning to segmentation and deploying offers or bundles, drive better player engagement and monetization, without the grind.",
//       // UPDATED: Added click handler to open login modal
//       onClick: () => {
//         if (!userId) {
//           setShowLoginModal(true);
//         }
//       }
//     },
//     {
//       icon: BarChart2,
//       title: "Competitive Analysis",
//       // UPDATED: Added short description for initial view
//       shortDescription: "Analyze market competition quickly",
//       description: "Know Your Market Before You Build. Upload design docs or concepts and instantly get a deconstructed view of your top competitors. Analyze across core metrics and export insights in shareable formats.",
//       // UPDATED: Added click handler to open login modal
//       onClick: () => {
//         if (!userId) {
//           setShowLoginModal(true);
//         }
//       }
//     },
//     {
//       icon: MessageCircle,
//       title: "Reddit Sentiment",
//       // UPDATED: Added short description for initial view
//       shortDescription: "Track community pulse in real-time",
//       description: "Tap Into the Pulse of Your Community. Monitor Reddit threads and communities around your game. Understand how players feel, what they're saying, and whether you're even on their radar.",
//       // UPDATED: Added click handler to open login modal
//       onClick: () => {
//         if (!userId) {
//           setShowLoginModal(true);
//         }
//       }
//     },
//     {
//       icon: Store,
//       title: "Store Analysis",
//       // UPDATED: Added short description for initial view
//       shortDescription: "Decode app store trends instantly",
//       description: "Decode App Store & Play Store Trends. Get focused insights from the App Store and Play Store. Track rankings, reviews, and critical metrics to position your game more effectively.",
//       // UPDATED: Added click handler to open login modal
//       onClick: () => {
//         if (!userId) {
//           setShowLoginModal(true);
//         }
//       }
//     }
//   ];

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // UPDATED: Handler for successful login
//   const handleLoginSuccess = () => {
//     setShowLoginModal(false);
//   };

//   const handleFileUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     const newFiles = Array.from(e.target.files);
//     setUploadedFiles(prev => [...prev, ...newFiles]);
//     setIsFileUploadOpen(true);
//   };

//   const removeFile = (fileToRemove) => {
//     setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
//     if (uploadedFiles.length <= 1) {
//       setIsFileUploadOpen(false);
//     }
//   };

//   const handleSend = async () => {
//     // UPDATED: Added login modal trigger after certain number of prompts
//     if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

//     const newPromptCount = promptCount + 1;
//     setPromptCount(newPromptCount);
    
//     // UPDATED: Show login modal after 2 prompts if not logged in
//     if (newPromptCount >= 2 && !userId) {
//       setShowLoginModal(true);
//       return;
//     }

//     const formData = new FormData();
//     uploadedFiles.forEach(file => {
//       formData.append('files', file);
//     });
//     formData.append('message', input);

//     setMessages((prev) => [...prev, { 
//       content: input + (uploadedFiles.length > 0 ? 
//         `\n\n*Uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(', ')}*` : 
//         ''), 
//       sender: "human" 
//     }]);
    
//     setIsLoading(true);

//     try {
//       const response = await fetch("https://generate-direct-flnr5jia5q-uc.a.run.app", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.chat_id) {
//           router.push(`/analysis?chat=${data.chat_id}`);
//         }
//       } else {
//         console.error("Network response not OK:", response.status);
//       }
//     } catch (err) {
//       console.error("Error in handleSend:", err);
//     } finally {
//       setInput("");
//       setUploadedFiles([]);
//       setIsFileUploadOpen(false);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <Header />
//       <div className={styles.mainLayout}>
//         <Sidebar />
//         <main className={styles.mainContent}>
//           <div className={styles.chatContainer}>
//             <div className={styles.glassWrapper}>
//               <div className={styles.messagesArea}>
//                 {messages.length === 0 && (
//                   <div className={styles.welcomeContent}>
//                     <SplitText
//                       className={styles.welcomeHeading}
//                       text="What can we help with?"
//                       fontSize="text-xl"
//                       fontWeight="font-semibold"
//                       textCenter={true}
//                       delay={50}
//                       animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
//                       animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
//                       easing="easeOutCubic"
//                       threshold={0.2}
//                       rootMargin="-50px"
//                       duration={0.3}
//                     />
                    
//                     <div className={styles.searchWrapper}>
//                       {/* UPDATED: Moved uploadedFilesContainer ABOVE the searchContainer */}
//                       {isFileUploadOpen && (
//                         <div className={styles.uploadedFilesContainer}>
//                           <div className={styles.uploadedFiles}>
//                             {uploadedFiles.map((file, idx) => (
//                               <FileItem key={idx} file={file} onRemove={removeFile} />
//                             ))}
//                           </div>
//                         </div>
//                       )}
                      
//                       <div className={styles.searchContainer}>
//                         <input
//                           type="text"
//                           value={input}
//                           onChange={(e) => setInput(e.target.value)}
//                           placeholder="What would you like to explore?"
//                           className={styles.searchInput}
//                           onKeyPress={(e) => e.key === "Enter" && handleSend()}
//                           disabled={isLoading}
//                         />
//                         <button 
//                           className={styles.plusButton} 
//                           onClick={handleFileUploadClick}
//                         >
//                           <FileText size={18} />
//                         </button>
//                         <input
//                           type="file"
//                           multiple
//                           ref={fileInputRef}
//                           onChange={handleFileChange}
//                           className={styles.fileInput}
//                         />
//                         <button
//                           onClick={handleSend}
//                           className={styles.arrowButton}
//                           disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
//                         >
//                           <Send size={18} />
//                         </button>
//                       </div>
//                     </div>
                    
//                     {/* UPDATED: Feature grid with new cards and hover interactions */}
//                     <div className={styles.featureGrid}>
//                       {featureCards.map((card, idx) => (
//                         <FeatureCard
//                           key={idx}
//                           icon={card.icon}
//                           title={card.title}
//                           description={card.description}
//                           shortDescription={card.shortDescription}
//                           onClick={card.onClick}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {messages.map((msg, idx) => (
//                   <div
//                     key={idx}
//                     className={`${styles.message} ${
//                       msg.sender === "human" ? styles.userMessage : styles.aiMessage
//                     }`}
//                   >
//                     <div className={styles.messageContent}>
//                       <ReactMarkdown>{msg.content}</ReactMarkdown>
//                     </div>
//                   </div>
//                 ))}

//                 {isLoading && (
//                   <div className={styles.loadingMessage}>
//                     <Loader className={styles.loadingIcon} size={18} />
//                     <span>AI is thinking...</span>
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               {messages.length > 0 && (
//                 <div className={styles.inputWrapper}>
//                   {/* UPDATED: Moved uploadedFilesContainer ABOVE the inputContainer */}
//                   {isFileUploadOpen && (
//                     <div className={styles.uploadedFilesContainer}>
//                       <div className={styles.uploadedFiles}>
//                         {uploadedFiles.map((file, idx) => (
//                           <FileItem key={idx} file={file} onRemove={removeFile} />
//                         ))}
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className={styles.inputContainer}>
//                     <input
//                       type="text"
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       placeholder="What's on your mind? Share your thoughts..."
//                       className={styles.input}
//                       onKeyPress={(e) => e.key === "Enter" && handleSend()}
//                       disabled={isLoading}
//                     />
//                     <button 
//                       className={styles.fileButton} 
//                       onClick={handleFileUploadClick}
//                       disabled={isLoading}
//                     >
//                       <FileText size={18} />
//                     </button>
//                     <input
//                       type="file"
//                       multiple
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       className={styles.fileInput}
//                     />
//                     <button
//                       onClick={handleSend}
//                       className={styles.sendButton}
//                       disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
//                     >
//                       <Send size={18} />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
      
//       {/* UPDATED: Login modal with new handling */}
//       {showLoginModal && (
//         <LoginModal
//           onClose={() => setShowLoginModal(false)} 
//           onSuccess={handleLoginSuccess}
//         />
//       )}
//     </div>
//   );
// }