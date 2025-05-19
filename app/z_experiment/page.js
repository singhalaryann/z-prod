// app/z_experiment/page.js
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import styles from '../../styles/z_Experiment.module.css';
import { GAME_ID } from '../config';

export default function ExperimentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [experiments, setExperiments] = useState([]);
  const [insightId, setInsightId] = useState(null);
  const [gameId, setGameId] = useState(GAME_ID);
  
  // State to track which experiment cards are expanded
  const [expandedCards, setExpandedCards] = useState({});
  
  // Refs to store the height of expanded content for each card
  const expandedContentRefs = useRef({});
  
  // State for experiment generation
  const [generatingExperiments, setGeneratingExperiments] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  
  // Polling interval for checking experiment generation status (30 seconds)
  const POLLING_INTERVAL = 30 * 1000;

  useEffect(() => {
    const fetchExperimentData = async () => {
      const insight = searchParams.get('insight');
      console.log('🔍 Fetching experiments for insight:', insight);
      
      if (!userId || !insight) {
        console.log('⚠️ Missing userId or insightId, redirecting to dashboard');
        router.push('/');
        return;
      }
      
      setInsightId(insight);
      setLoading(true);
      
      try {
        const response = await fetch('https://get-experiments-nrosabqhla-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            insight_id: insight,
            game_id: GAME_ID,
          }),
        });
        
        const data = await response.json();
        console.log('✅ API response:', data);
        
        if (data.experiments && data.experiments.length > 0) {
          console.log('Experiments found:', data.experiments.length);
          // Filter to only show experiments with status "success"
          const successExperiments = data.experiments.filter(exp => exp.status === "success");
          console.log('Success experiments:', successExperiments.length);
          setExperiments(successExperiments);
        } else {
          console.log('No experiments found');
          setExperiments([]);
        }
      } catch (error) {
        console.error('❌ Error fetching experiment data:', error);
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperimentData();
  }, [userId, searchParams, router, gameId]);

  // Function to generate experiments
  const generateExperiments = async () => {
    if (!insightId || !gameId) {
      console.error('Missing insightId or gameId for generating experiments');
      return;
    }
    
    try {
      setGeneratingExperiments(true);
      setGenerationError(null);
      
      console.log('Generating experiments for insight:', insightId);
      
      const response = await fetch('https://generate-experiment-nrosabqhla-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insight_id: insightId,
          game_id: GAME_ID,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Generation initiated:', data);
      
      // Start polling for experiment completion
      startPolling();
      
    } catch (error) {
      console.error('Error generating experiments:', error);
      setGeneratingExperiments(false);
      setGenerationError('Failed to generate experiments. Please try again later.');
    }
  };
  
  // Function to start polling for experiment status
  const startPolling = () => {
    console.log('Starting polling for experiment completion...');
    
    const pollingId = setInterval(async () => {
      try {
        // Check if any new experiments have completed
        const response = await fetch('https://get-experiments-nrosabqhla-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            insight_id: insightId,
            game_id: GAME_ID,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Polling check response:', data);
        
        // Check if experiments are now available with success status
        if (data.experiments && data.experiments.length > 0) {
          const successExperiments = data.experiments.filter(exp => exp.status === "success");
          
          if (successExperiments.length > 0) {
            // Experiments have been successfully generated
            clearInterval(pollingId);
            console.log('Experiments generated successfully:', successExperiments.length);
            setExperiments(successExperiments);
            setGeneratingExperiments(false);
          } else {
            console.log('Experiments still generating...');
          }
        }
      } catch (error) {
        console.error('Error during polling:', error);
        clearInterval(pollingId);
        setGenerationError('An error occurred while checking experiment status.');
        setGeneratingExperiments(false);
      }
    }, POLLING_INTERVAL);
    
    // Clean up interval if component unmounts
    return pollingId;
  };

  // Toggle expanded state of a card
  const toggleCardExpansion = (index) => {
    console.log('Toggling expansion for experiment:', index);
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper function to get impact class based on impact value
  const getImpactClass = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return styles.impactHigh;
      case 'medium':
        return styles.impactMedium;
      case 'low':
        return styles.impactLow;
      default:
        return '';
    }
  };

  // Helper function to get feasibility class based on feasibility value
  const getFeasibilityClass = (feasibility) => {
    switch (feasibility?.toLowerCase()) {
      case 'high':
        return styles.feasibilityHigh;
      case 'medium':
        return styles.feasibilityMedium;
      case 'low':
        return styles.feasibilityLow;
      default:
        return '';
    }
  };
  
  // Render generate experiments button
  const renderGenerateButton = () => {
    if (generatingExperiments) {
      return (
        <button 
          className={`${styles.generateButton} ${styles.generating}`}
          disabled={true}
        >
          <Loader2 className={styles.loadingSpinner} size={16} />
          <span>Generating experiments...</span>
        </button>
      );
    }
    
    return (
      <button 
        className={styles.generateButton}
        onClick={generateExperiments}
      >
        <span>Generate Experiments</span>
      </button>
    );
  };

  // Skeleton loading for experiment content
  const renderSkeletonContent = () => (
    <>
      <div className={styles.experimentSection}>
        <div className={styles.experimentHeader}>
          <div className={styles.experimentTitleContainer}>
            <div className={styles.experimentSkeletonTitle}></div>
          </div>
        </div>
        
        <div className={styles.actionRow}>
          <div className={styles.skeletonSubText}></div>
        </div>
      </div>

      <div className={styles.skeletonExperimentsList}>
        {[1, 2, 3].map((index) => (
          <div key={index} className={styles.skeletonExperimentItem}>
            <div className={styles.skeletonExperimentTitle}></div>
            <div className={styles.skeletonExperimentText}></div>
            <div className={styles.skeletonTagsRow}>
              <div className={styles.skeletonTag}></div>
              <div className={styles.skeletonTag}></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // No experiments found state with generate button
  const renderNoExperiments = () => (
    <div className={styles.noExperiment}>
      <div className={styles.noExperimentContent}>
        <h3>No experiments found</h3>
        <p>No experiment data is available for this insight.</p>
        
        {generationError && (
          <p className={styles.errorMessage}>{generationError}</p>
        )}
        
        {renderGenerateButton()}
        
        <button 
          className={styles.returnButton} 
          onClick={() => router.back()}
        >
          Return to Insight
        </button>
      </div>
    </div>
  );

  // Render explanation section - now used for main content
  const renderContentSection = (title, content) => {
    if (!content) return null;
    
    return (
      <div className={styles.detailItem}>
        <h4 className={styles.detailTitle}>{title}</h4>
        <p className={styles.detailText}>{content}</p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.mainLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          {loading ? (
            renderSkeletonContent()
          ) : experiments.length === 0 ? (
            renderNoExperiments()
          ) : (
            <>
              <div className={styles.experimentSection}>
                <div className={styles.experimentHeader}>
                  <div className={styles.experimentTitleContainer}>
                    <h2 className={styles.experimentTitle}>Experiment Recommendations</h2>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <p className={styles.subText}>
                    Based on insights, these experiments are designed to improve your key metrics.
                  </p>
                </div>
              </div>

              <div className={styles.experimentsList}>
                {experiments.map((experiment, index) => (
                  <div key={index} className={styles.experimentItem}>
                    <div className={styles.experimentItemHeader}>
                      <h3 className={styles.experimentItemTitle}>{experiment.experiment_name}</h3>
                      <button 
                        className={styles.expandButton}
                        onClick={() => toggleCardExpansion(index)}
                        aria-expanded={expandedCards[index] ? "true" : "false"}
                        aria-label={expandedCards[index] ? "Collapse experiment details" : "Expand experiment details"}
                      >
                        {expandedCards[index] ? (
                          <ChevronUp size={20} className={styles.chevronIcon} />
                        ) : (
                          <ChevronDown size={20} className={styles.chevronIcon} />
                        )}
                      </button>
                    </div>
                    
                    {/* Initial visible content - now showing hypothesis_explanation instead of hypothesis */}
                    <div className={styles.experimentItemMain}>
                      <p className={styles.experimentItemText}>
                        {experiment.hypothesis_explanation || experiment.hypothesis || "No hypothesis information available."}
                      </p>
                      
                      <div className={styles.tagsRow}>
                        <div className={`${styles.tag} ${getImpactClass(experiment.impact)}`}>
                          <span className={styles.tagLabel}>Impact:</span>
                          <span className={styles.tagValue}>{experiment.impact}</span>
                        </div>
                        <div className={`${styles.tag} ${getFeasibilityClass(experiment.feasibility)}`}>
                          <span className={styles.tagLabel}>Feasibility:</span>
                          <span className={styles.tagValue}>{experiment.feasibility}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded details - now showing explanation fields instead of main content fields */}
                    <div 
                      className={`${styles.expandedDetails} ${expandedCards[index] ? styles.expanded : ''}`}
                      aria-hidden={!expandedCards[index]}
                    >
                      {renderContentSection(
                        "Test Design", 
                        experiment.test_design_explanation || experiment.test_design
                      )}
                      
                      {renderContentSection(
                        "Success Guardrail Metrics", 
                        experiment.success_guardrail_metrics_explanation || experiment.success_guardrail_metrics
                      )}
                      
                      {renderContentSection(
                        "Data Rationale", 
                        experiment.data_rationale_explanation || experiment.data_rationale
                      )}
                      
                      {renderContentSection(
                        "Math & Statistical Notes", 
                        experiment.math_stat_notes_explanation || experiment.math_stat_notes
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}