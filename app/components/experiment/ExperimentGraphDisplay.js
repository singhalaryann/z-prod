// // ExperimentGraphDisplay.js
// 'use client';
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   ReferenceArea,
// } from 'recharts';
// import styles from '../../../styles/ExperimentGraphDisplay.module.css';
// import { RotateCcw, MousePointer } from 'lucide-react';

// // Tooltip for control/variant line charts
// const LineTooltip = ({ active, payload, x_label, y_label, x_unit, y_unit }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className={styles.customTooltip}>
//         <p>{`${x_label}: ${payload[0].payload.x}${x_unit ? ` ${x_unit}` : ''}`}</p>
//         <p>{`Control: ${payload[0].payload.control}${y_unit ? ` ${y_unit}` : ''}`}</p>
//         <p>{`Variant: ${payload[0].payload.variant}${y_unit ? ` ${y_unit}` : ''}`}</p>
//       </div>
//     );
//   }
//   return null;
// };

// const ExperimentGraphDisplay = ({ graphs }) => {
//   if (!graphs || graphs.length === 0) return null;

//   // Function to render a chart with zoom functionality
//   const renderChart = (graph, index) => {
//     const { columns, values, x_unit, y_unit } = graph;

//     // Validate data
//     if (!Array.isArray(values) || values.length === 0) {
//       console.log(`Invalid or empty values array for chart ${graph.title || 'unknown'}`);
//       return null;
//     }

//     // State for zoom functionality
//     const [zoomState, setZoomState] = useState({
//       left: 'dataMin',
//       right: 'dataMax',
//       refAreaLeft: '',
//       refAreaRight: '',
//       top: 'dataMax+10%',
//       bottom: 'dataMin-10%',
//       animation: true,
//     });
//     const [isZoomed, setIsZoomed] = useState(false);
//     // State for zoom mode (drag or wheel)
//     const [zoomMode, setZoomMode] = useState('wheel'); // Default to wheel zoom
//     // Ref for chart container to add wheel event listener
//     const chartContainerRef = useRef(null);

//     const x_label = columns?.[0] || 'Date';
//     const y_label = columns?.[1] || 'Value';

//     // Calculate y-axis domain with padding
//     const calculateDomain = (data, keys) => {
//       const allValues = data.flatMap(d => keys.map(key => parseFloat(d[key])));
//       const min = Math.min(...allValues);
//       const max = Math.max(...allValues);
//       const padding = (max - min) * 0.1;
//       return [min - padding, max + padding];
//     };

//     // Transform data for control and variant lines with safety check
//     const data = values.map(([date, controlVariantArray], index) => {
//       // Ensure controlVariantArray is an array with at least 2 elements
//       const controlVal = Array.isArray(controlVariantArray) && controlVariantArray.length > 0 
//         ? controlVariantArray[0] : 0;
//       const variantVal = Array.isArray(controlVariantArray) && controlVariantArray.length > 1 
//         ? controlVariantArray[1] : 0;
        
//       return {
//         x: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//         control: parseFloat(controlVal),
//         variant: parseFloat(variantVal),
//         originalIndex: index
//       };
//     });
    
//     const yDomain = calculateDomain(data, ['control', 'variant']);

//     // Calculate appropriate number of ticks based on visible data range
//     const calculateTickCount = () => {
//       if (!isZoomed || typeof zoomState.left === 'string' || typeof zoomState.right === 'string') {
//         return Math.min(10, data.length);
//       }
      
//       const { startIdx, endIdx } = getVisibleIndices();
//       const visiblePoints = endIdx - startIdx + 1;
      
//       // Calculate a sensible number of ticks: roughly 1 tick per 3-5 data points, but at least 2
//       return Math.max(2, Math.min(Math.floor(visiblePoints / 3), 10));
//     };

//     // Zoom event handlers
//     const zoom = () => {
//       if (zoomState.refAreaLeft === zoomState.refAreaRight || zoomState.refAreaRight === '') {
//         setZoomState((prevState) => ({
//           ...prevState,
//           refAreaLeft: '',
//           refAreaRight: '',
//         }));
//         return;
//       }

//       // xAxis domain
//       let left = Math.min(zoomState.refAreaLeft, zoomState.refAreaRight);
//       let right = Math.max(zoomState.refAreaLeft, zoomState.refAreaRight);

//       // yAxis domain
//       const dataInRange = data.filter(
//         d => d.originalIndex >= left && d.originalIndex <= right
//       );
//       const newYDomain = calculateDomain(dataInRange, ['control', 'variant']);

//       setZoomState({
//         ...zoomState,
//         refAreaLeft: '',
//         refAreaRight: '',
//         left: left,
//         right: right,
//         bottom: newYDomain[0],
//         top: newYDomain[1],
//       });
      
//       setIsZoomed(true);
//     };

//     // Reset zoom handler
//     const zoomOut = () => {
//       setZoomState({
//         left: 'dataMin',
//         right: 'dataMax',
//         refAreaLeft: '',
//         refAreaRight: '',
//         top: 'dataMax+10%',
//         bottom: 'dataMin-10%',
//         animation: true,
//       });
//       setIsZoomed(false);
//     };

//     // Mouse event handlers for drag zooming
//     const onMouseDown = (e) => {
//       if (!e || zoomMode !== 'drag') return;
//       setZoomState((prevState) => ({
//         ...prevState,
//         refAreaLeft: e.activeTooltipIndex,
//       }));
//     };

//     const onMouseMove = (e) => {
//       if (!e || zoomMode !== 'drag') return;
//       if (zoomState.refAreaLeft !== '') {
//         setZoomState((prevState) => ({
//           ...prevState,
//           refAreaRight: e.activeTooltipIndex,
//         }));
//       }
//     };

//     const onMouseUp = () => {
//       if (zoomMode !== 'drag') return;
//       zoom();
//     };

//     // Calculate the visible data indices
//     const getVisibleIndices = () => {
//       // If not zoomed, all data is visible
//       if (!isZoomed || typeof zoomState.left === 'string' || typeof zoomState.right === 'string') {
//         return { startIdx: 0, endIdx: data.length - 1 };
//       }
      
//       // Otherwise use zoom boundaries
//       return {
//         startIdx: Math.max(0, Math.floor(zoomState.left)),
//         endIdx: Math.min(data.length - 1, Math.ceil(zoomState.right))
//       };
//     };

//     // Handle mouse wheel zoom
//     const handleWheel = (e) => {
//       if (zoomMode !== 'wheel' || !data || !Array.isArray(data) || data.length === 0) return;
      
//       e.preventDefault();
      
//       // Get mouse position relative to container
//       const containerRect = e.currentTarget.getBoundingClientRect();
//       const mouseX = e.clientX - containerRect.left;
//       const containerWidth = containerRect.width;
      
//       // Convert mouse position to a percentage of the chart width
//       const mouseXPercent = mouseX / containerWidth;
      
//       // Get current visible data range
//       const { startIdx, endIdx } = getVisibleIndices();
//       const visibleRange = endIdx - startIdx;
      
//       // Calculate zoom factor based on wheel delta
//       // Negative delta = zoom in, Positive delta = zoom out
//       const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9; // 10% zoom per wheel tick
      
//       // Calculate new range, ensuring a minimum range of 2 points
//       let newRange = Math.max(2, visibleRange * zoomFactor);
      
//       // Calculate new start and end points, keeping the mouse position as the focal point
//       let newStart = startIdx + (mouseXPercent * visibleRange) - (mouseXPercent * newRange);
//       let newEnd = newStart + newRange;
      
//       // Ensure the new range doesn't go out of bounds
//       if (newStart < 0) {
//         newStart = 0;
//         newEnd = Math.min(data.length - 1, newStart + newRange);
//       }
      
//       if (newEnd > data.length - 1) {
//         newEnd = data.length - 1;
//         newStart = Math.max(0, newEnd - newRange);
//       }
      
//       // Calculate new Y domain based on the visible data
//       const visibleData = data.filter(
//         d => d.originalIndex >= newStart && d.originalIndex <= newEnd
//       );
//       const newYDomain = calculateDomain(visibleData, ['control', 'variant']);
      
//       // Update zoom state
//       setZoomState({
//         ...zoomState,
//         left: newStart,
//         right: newEnd,
//         bottom: newYDomain[0],
//         top: newYDomain[1],
//       });
      
//       setIsZoomed(true);
//     };

//     // Effect to add/remove wheel event listener
//     useEffect(() => {
//       const currentContainer = chartContainerRef.current;
      
//       if (currentContainer && zoomMode === 'wheel') {
//         currentContainer.addEventListener('wheel', handleWheel, { passive: false });
//       }
      
//       return () => {
//         if (currentContainer) {
//           currentContainer.removeEventListener('wheel', handleWheel);
//         }
//       };
//     }, [zoomMode, zoomState, isZoomed, data.length]);

//     // Determine X domain based on zoom state
//     const xDomain = isZoomed 
//       ? [zoomState.left, zoomState.right] 
//       : ['dataMin', 'dataMax'];

//     // Determine Y domain based on zoom state
//     const yDomainFinal = isZoomed 
//       ? [zoomState.bottom, zoomState.top] 
//       : yDomain;

//     // Calculate appropriate tick count based on visible data
//     const tickCount = calculateTickCount();

//     // Toggle between zoom modes
//     const toggleZoomMode = () => {
//       setZoomMode(prevMode => prevMode === 'drag' ? 'wheel' : 'drag');
//     };

//     return (
//       <div className={styles.chartWrapper} ref={chartContainerRef}>
//         {/* Zoom controls with mode toggle */}
//         <div className={styles.zoomControls}>
//           {/* Zoom mode toggle button */}
//           <button 
//             onClick={toggleZoomMode} 
//             title={`Switch to ${zoomMode === 'drag' ? 'wheel' : 'drag'} zoom`}
//             className={styles.zoomButton}
//             style={{ marginRight: '8px' }}
//           >
//             {zoomMode === 'drag' ? 
//               <MousePointer size={16} color="white" /> : 
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="8" x2="12" y2="16" />
//                 <line x1="8" y1="12" x2="16" y2="12" />
//               </svg>
//             }
//             <span>{zoomMode === 'drag' ? 'Drag Zoom' : 'Wheel Zoom'}</span>
//           </button>
          
//           {/* Reset zoom button */}
//           <button 
//             onClick={zoomOut} 
//             disabled={!isZoomed}
//             title="Reset zoom"
//             className={`${styles.zoomButton} ${!isZoomed ? styles.disabled : ''}`}
//           >
//             <RotateCcw size={16} color="white" />
//             <span>Reset Zoom</span>
//           </button>
//         </div>

//         {/* Added zoom-related props to LineChart */}
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart 
//             data={data} 
//             margin={{ top: 35, right: 30, left: 20, bottom: 30 }}
//             onMouseDown={onMouseDown}
//             onMouseMove={onMouseMove}
//             onMouseUp={onMouseUp}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
//             <XAxis
//               dataKey="originalIndex"
//               type="number"
//               stroke="rgba(255,255,255,0.6)"
//               tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
//               // Use calculated tick count
//               tickCount={tickCount}
//               // Improved tick formatter to ensure labels are visible
//               tickFormatter={(index) => {
//                 // Make sure index is within bounds
//                 if (index < 0 || index >= data.length) return '';
//                 const item = data[Math.floor(index)];
//                 return item ? item.x : '';
//               }}
//               domain={xDomain}
//               allowDataOverflow
//               label={{
//                 value: x_label,
//                 position: 'bottom',
//                 fill: 'rgba(255,255,255,0.6)',
//                 fontSize: 12
//               }}
//             />
//             <YAxis
//               stroke="rgba(255,255,255,0.6)"
//               tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
//               label={{
//                 value: y_label,
//                 angle: -90,
//                 position: 'left',
//                 fill: 'rgba(255,255,255,0.6)',
//                 fontSize: 12
//               }}
//               domain={yDomainFinal}
//               allowDataOverflow
//               scale="linear"
//             />
//             <Tooltip
//               content={(props) => (
//                 <LineTooltip
//                   {...props}
//                   x_label={x_label}
//                   y_label={y_label}
//                   x_unit={x_unit}
//                   y_unit={y_unit}
//                 />
//               )}
//             />
//             <Legend 
//               verticalAlign="bottom"
//               align="right"
//               wrapperStyle={{ marginTop: '15px' }}
//               iconType="circle"
//             />
//             <Line
//               type="monotone"
//               dataKey="control"
//               stroke="#82FF83"
//               strokeWidth={2}
//               dot={{ fill: '#82FF83', r: 3 }}
//               activeDot={{ r: 5, stroke: '#82FF83' }}
//               name="Control"
//               isAnimationActive={false}
//             />
//             <Line
//               type="monotone"
//               dataKey="variant"
//               stroke="#FF33F1"
//               strokeWidth={2}
//               dot={{ fill: '#FF33F1', r: 3 }}
//               activeDot={{ r: 5, stroke: '#FF33F1' }}
//               name="Variant A"
//               connectNulls={true}
//               isAnimationActive={false}
//             />
            
//             {/* Highlight zoom area while dragging */}
//             {zoomState.refAreaLeft && zoomState.refAreaRight ? (
//               <ReferenceArea 
//                 x1={zoomState.refAreaLeft} 
//                 x2={zoomState.refAreaRight} 
//                 strokeOpacity={0.3}
//                 fill="rgba(255, 255, 255, 0.2)" 
//               />
//             ) : null}
//           </LineChart>
//         </ResponsiveContainer>
        
//         {/* Modified zoom instructions based on mode */}
//         {!isZoomed && (
//           <div className={styles.zoomInstructions}>
//             {zoomMode === 'drag' 
//               ? 'Click and drag on the chart to zoom' 
//               : 'Use mouse wheel to zoom in/out'}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className={styles.analyticsContainer}>
//       {graphs.map((graph, index) => (
//         <div key={`${graph.metric_id || 'graph'}-${index}`} className={styles.section}>
//           <div className={styles.glassEffect}>
//             <h3 className={styles.chartTitle}>{graph.title || 'Untitled Chart'}</h3>
//             {renderChart(graph, index)}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ExperimentGraphDisplay;