// "use client";
// import React, { useState, useEffect } from "react";
// import styles from "../../../styles/LoginModal.module.css";
// import { useAuth } from "../../context/AuthContext";
// import { useRouter } from "next/navigation";

// const LoginModal = ({ onClose, onSuccess, redirectPath }) => {
//   const [userId, setUserId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [mounted, setMounted] = useState(false);
//   const { login } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     // Check for the specific user ID
//     const trimmedUserId = userId.trim();
//     if (trimmedUserId !== "a724a284-dd80-4ff2-8d0a-b36bff0fa426") {
//       setError("Invalid user ID. Please enter the correct ID.");
//       setLoading(false);
//       return;
//     }

//     // Direct login for the fixed user ID
//     try {
//       console.log("Logging in with fixed user ID");
//       login(trimmedUserId);
      
//       // Close modal first
//       if (onClose) {
//         onClose();
//       }
      
//       // Call onSuccess callback last, after other operations
//       if (onSuccess) {
//         onSuccess(trimmedUserId);
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       setError("An error occurred during login. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={`${styles.content} ${mounted ? styles.mounted : ""}`}>
//         <div className={styles.glassEffect}>
//           <div className={styles.title}>
//             Welcome to <span className={styles.highlight}>XG</span>
//           </div>
//           <p className={styles.subtitle}>Enter your user ID to continue</p>
//           <form onSubmit={handleSubmit} className={styles.form}>
//             <input
//               type="text"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               placeholder="Enter your ID"
//               className={styles.input}
//               disabled={loading}
//               autoFocus
//             />
//             <button
//               type="submit"
//               className={styles.button}
//               disabled={loading || !userId.trim()}
//             >
//               {loading ? "Validating..." : "Enter"}
//             </button>
//           </form>
//           {error && <p className={styles.error}>{error}</p>}
//           {onClose && (
//             <button onClick={onClose} className={styles.cancelButton}>
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;