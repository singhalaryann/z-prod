// 'use client';
// import React, { useState, useRef, useEffect } from 'react';
// import { Lightbulb, Send, Loader } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import ReactMarkdown from 'react-markdown'; // NEW: Added for markdown support
// import styles from '../../../styles/ChatInterface.module.css';

// const ChatInterface = ({ 
//   messages = [], 
//   ideaId, 
//   insightId, 
//   userId, 
//   ideaDescription, 
//   chatId,
//   onMetricsUpdate,
//   onGraphsUpdate 
// }) => {
//   const router = useRouter();
//   const [chatMessages, setChatMessages] = useState(messages);
//   const [newMessage, setNewMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   useEffect(() => {
//     setChatMessages(messages);
//   }, [messages]);

//   // Handles the main AI response, plus sub-agent logic
//   const handleResponse = async (responseData) => {
//     console.log('Handling response:', responseData);

//     // 1. Always add the AI reply if present
//     if (responseData.reply) {
//       const aiMessage = {
//         content: responseData.reply,
//         sender: 'ai'
//       };
//       setChatMessages(prev => [...prev, aiMessage]);
//     }

//     // 2. Check if we need to call a sub-agent
//     if (responseData.is_asking_sub_agent === true && responseData.agent_instructions) {
//       const { agent_name, instructions } = responseData.agent_instructions;

//       // Handle Metric Agent
//       if (agent_name === "ask_metric_agent_to_display_chart") {
//         try {
//           console.log('Calling metric agent with:', { instructions, chatId });
//           const metricResponse = await fetch('https://metric-agent-endpoint-flnr5jia5q-uc.a.run.app', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               chat_id: chatId,
//               instructions: instructions,
//               displayed_metrics: []
//             })
//           });
//           const metricData = await metricResponse.json();
//           console.log('Metric data received:', metricData);

//           // If we got metrics back, update them
//           if (metricData.metrics) {
//             onMetricsUpdate(metricData.metrics);
//           }
          
//           if (metricData.graphs) {
//             onGraphsUpdate(metricData.graphs);
//           }
          
//         } catch (error) {
//           console.error('Metric agent error:', error);
//         }
//       }
//       // Handle Idea Agent
//       else if (agent_name === "ask_idea_agent_to_generate_idea") {
//         try {
//           console.log('Calling idea agent with:', { chatId, instructions, userId, insightId });
//           const ideaResponse = await fetch('https://idea-agent-endpoint-flnr5jia5q-uc.a.run.app', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               insight_id: insightId,
//               user_id: userId,
//               chat_id: chatId,
//               query: instructions
//             })
//           });

//           const ideaData = await ideaResponse.json();
//           console.log('Idea data received:', ideaData);

//           // If new ideas are generated, redirect to ideas page
//           if (ideaData.idea_ids && ideaData.idea_ids.length > 0) {
//             setIsLoading(true);
//             router.push(`/ideas?insight=${insightId}`);
//             return; // Important: stop further processing
//           }
//         } catch (error) {
//           console.error('Idea agent error:', error);
//         }
//       }
//       // Handle Data Agent
//       else if (agent_name === "ask_db_agent") {
//         try {
//           console.log('Calling data agent with instructions:', instructions);
//           const dataResponse = await fetch('https://data-agent-endpoint-flnr5jia5q-uc.a.run.app', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               chat_id: chatId,
//               query: instructions
//             })
//           });
//           const dataResult = await dataResponse.json();
//           console.log('Data response received:', dataResult);

//           // Recursively handle the data result in case it has more instructions
//           await handleResponse(dataResult);

//         } catch (error) {
//           console.error('Data agent error:', error);
//         }
//       }
//     }

//     // NOTE: If is_asking_sub_agent is false, we do NOT call any sub-agent
//     // We simply have the AI reply that was added above
//   };

//   // Sends a message to the main chat endpoint
//   const handleSendMessage = async () => {

//     if (!newMessage.trim() || isLoading) return;

//     try {
//       setIsLoading(true);
//       console.log('Sending message:', { newMessage, chatId, insightId });

//       // Immediately add the user's message to the chat
//       const userMessage = {
//         content: newMessage,
//         sender: 'human'
//       };
//       setChatMessages(prev => [...prev, userMessage]);
//       setNewMessage('');

//       // Call main chat endpoint
//       const response = await fetch('https://chat-endpoint-flnr5jia5q-uc.a.run.app', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           chat_id: chatId,
//           message: newMessage
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to send message');
//       }

//       const data = await response.json();
//       console.log('Chat response received:', data);

//       // Pass data to handleResponse
//       await handleResponse(data);

//     } catch (error) {
//       console.error('Error in message flow:', error);
//       setChatMessages(prev => [...prev, {
//         content: 'Error sending message. Please try again.',
//         sender: 'system'
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render the chat UI
//   return (
//     <div className={styles.glassWrapper}>
//       <div className={styles.chatContainer}>

//         {/* Idea Card */}
//         {/* <div className={styles.ideaCard}>
//           <div className={styles.ideaHeader}>
//             <div className={styles.ideaIconWrapper}>
//               <Lightbulb className={styles.ideaIcon} size={20} />
//             </div>
//             <span className={styles.ideaLabel}>Idea</span>
//           </div>
//           <p className={styles.ideaDescription}>
//             {ideaDescription || 'No idea description available'}
//           </p>
//         </div> */}

//         {/* Messages List */}
//         <div className={styles.messagesContainer}>
//   {chatMessages.map((message, index) => (
//     // Remove extra message div wrapping, keeping single div with message styling
//     <div
//       key={index}
//       className={`${styles.message} ${
//         message.sender === 'human' ? styles.userMessage :
//         message.sender === 'system' ? styles.systemMessage :
//         styles.aiMessage
//       }`}
//     >
//       <ReactMarkdown>{message.content}</ReactMarkdown>
//             </div>
//           ))}

//           {/* "AI is thinking" loader */}
//           {isLoading && (
//             <div className={styles.loadingMessage}>
//               <Loader className={styles.loadingIcon} size={20} />
//               <span>AI is thinking...</span>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Box */}
//         <div className={styles.inputContainer}>
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Uncover actionable insights for each metric."
//             className={styles.input}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             disabled={isLoading}
//           />
//           <button
//             onClick={handleSendMessage}
//             className={styles.sendButton}
//             disabled={!newMessage.trim() || isLoading}
//           >
//             <Send size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;