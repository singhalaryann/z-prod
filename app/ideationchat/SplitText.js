// import React, { useEffect, useRef, useState } from 'react';

// const SplitText = ({ 
//   text, 
//   className, 
//   fontSize = "text-2xl", 
//   fontWeight = "font-semibold", 
//   textCenter = true,
//   delay = 50,
//   easing = "ease-out",
//   duration = 0.3
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver((entries) => {
//       const [entry] = entries;
//       if (entry.isIntersecting) {
//         setIsVisible(true);
//         observer.unobserve(entry.target);
//       }
//     }, {
//       threshold: 0.2,
//       rootMargin: "-50px",
//     });

//     if (containerRef.current) {
//       observer.observe(containerRef.current);
//     }

//     return () => {
//       if (containerRef.current) {
//         observer.unobserve(containerRef.current);
//       }
//     };
//   }, []);

//   // Split the text into characters
//   const characters = text.split('');

//   return (
//     <h2 
//       ref={containerRef}
//       className={`${className} ${fontSize} ${fontWeight} ${textCenter ? 'text-center' : ''} overflow-hidden`}
//     >
//       <span className="inline-block">
//         {characters.map((char, index) => (
//           <span
//             key={index}
//             className="inline-block"
//             style={{
//               opacity: isVisible ? 1 : 0,
//               transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
//               transition: `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`,
//               transitionDelay: `${index * (delay / 1000)}s`,
//             }}
//           >
//             {char === ' ' ? '\u00A0' : char}
//           </span>
//         ))}
//       </span>
//     </h2>
//   );
// };

// export default SplitText;