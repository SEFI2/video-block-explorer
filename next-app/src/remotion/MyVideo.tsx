import React, { useCallback } from 'react';
import { 
  AbsoluteFill, 
  // The following imports are commented out but kept for future use
  // Img,
  // staticFile,
  // Audio
  useVideoConfig,
  Series,
  spring,
  useCurrentFrame,
  interpolate
} from 'remotion';
import { IntroScene } from './IntroScene';
import { OutroScene } from './OutroScene';
import { TextOverlay } from './TextOverlay';
import { TransactionReport } from '@/types/report';

// Interface for component props
interface VideoTransactionProps {
  userAddress: string;
  chainId: number;
  networkName: string;
  balance: string;
  transactionCount: number;
  introText: string;
  reports: TransactionReport[],
  outroText: string;
}

// Simplified video preview component
export const VideoPreview: React.FC<{props: VideoTransactionProps}> = ({props}) => {
  // Must use useVideoConfig() at the top level of a Remotion component
  const videoConfig = useVideoConfig();
  
  // Check if reports exist to prevent errors
  const reports = props.reports || [];
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {/* Use Remotion's built-in Series instead of TransitionSeries */}
      <Series>
        <Series.Sequence durationInFrames={3 * videoConfig.fps}>
          <IntroScene userAddress={props.userAddress} introText={props.introText} />
        </Series.Sequence>
        
        {reports.length > 0 && reports.map((report, index) => (
          <Series.Sequence 
            key={`report-${index}`} 
            durationInFrames={5 * videoConfig.fps}
          >
            <AbsoluteFill>
              <ReportScene report={report} index={index} />
            </AbsoluteFill>
          </Series.Sequence>
        ))}
        
        <Series.Sequence durationInFrames={5 * videoConfig.fps}>
          <OutroScene userAddress={props.userAddress} outroText={props.outroText} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// Scene component for reports
const ReportScene: React.FC<{
  report: TransactionReport;
  index: number;
}> = ({ report, index }) => {  
  const videoConfig = useVideoConfig();
  const frame = useCurrentFrame();
  
  // Animation timing constants
  const TITLE_DURATION = 15;
  const CARD_STAGGER = 10;
  const STATS_STAGGER = 8;
  const ITEM_STAGGER = 6;

  // Element entrance animations
  const titleOpacity = interpolate(
    frame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  const titleY = interpolate(
    frame,
    [0, 15],
    [-20, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Data points counter animation
  const animateNumber = (value: number, delay: number = 0) => {
    return Math.min(
      value,
      Math.floor(
        interpolate(
          frame - (TITLE_DURATION + CARD_STAGGER + delay),
          [0, 30],
          [0, value],
          { extrapolateRight: 'clamp' }
        )
      )
    );
  };
  
  // Helper for animated highlight items
  const getHighlightItemStyle = (index: number) => {
    const delay = TITLE_DURATION + CARD_STAGGER + (index * ITEM_STAGGER);
    const opacity = interpolate(
      frame - delay,
      [0, 10],
      [0, 1],
      { extrapolateRight: 'clamp' }
    );
    const x = interpolate(
      frame - delay,
      [0, 15],
      [-20, 0],
      { extrapolateRight: 'clamp' }
    );
    return { opacity, transform: `translateX(${x}px)` };
  };
  
  // Educational annotations
  const showAnnotations = frame > TITLE_DURATION + CARD_STAGGER + 40;
  const annotationOpacity = interpolate(
    frame - (TITLE_DURATION + CARD_STAGGER + 40),
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Animated values for stats
  const statValue1 = typeof report.statistics?.totalValue === 'string' 
    ? parseFloat(report.statistics.totalValue.replace(/[^0-9.]/g, '')) 
    : 0;
  
  const statPercent1 = interpolate(
    frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER),
    [0, 45],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );
  
  const statPercent2 = interpolate(
    frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER*2),
    [0, 45],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );
  
  const statPercent3 = interpolate(
    frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER*3),
    [0, 45],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0A1429 0%, #111D36 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
      overflow: 'hidden',
      padding: '5rem 2.5rem 2rem'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 70% 20%, rgba(114, 63, 255, 0.2) 0%, rgba(0, 0, 0, 0) 60%)',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        top: '-5%',
        right: '-10%',
        width: '60%',
        height: '60%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(65, 120, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      
      {/* Grid Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 0
      }} />
      
      {/* Extra glow effect at top */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        width: '30%',
        height: '20%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(114, 163, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        transform: 'translateX(-50%)'
      }} />
      
      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: 'translateY(-2.5rem) scale(0.9) translateX(0%)'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '1.85rem',
                height: '1.85rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.6rem',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: 0,
                color: 'white',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                Wallet Activity Report
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <p style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0
              }}>
                Analysis for period {index + 1}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '999px',
                padding: '0.3rem 0.8rem',
                marginLeft: '1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#4F8FF6',
                  marginRight: '0.5rem',
                  boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
                }} />
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#4F8FF6'
                }}>
                  LIVE
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              marginRight: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 20H7C5.89543 20 5 19.1046 5 18V6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H15M9 20V14M9 20H15M15 20V14M15 14H9M13 4L12 2L11 4H13Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0
              }}>
                Wallet 
              </p>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                margin: '0.125rem 0 0 0',
                color: 'white'
              }}>
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.75rem',
          flex: 1,
          maxHeight: '75vh'
        }}>
          {/* Left Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {/* Key Highlights Card */}
            {report.highlights && report.highlights.length > 0 && (
              <div style={{
                background: 'rgba(16, 28, 56, 0.7)',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.25rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                opacity: interpolate(frame - TITLE_DURATION, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `scale(${spring({
                  frame: frame - TITLE_DURATION,
                  from: 0.95,
                  to: 1,
                  fps: videoConfig.fps,
                  config: { damping: 12 }
                })})`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem',
                    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    margin: 0,
                    color: 'white'
                  }}>
                    Key Highlights
                  </h2>
                </div>
                
                <div style={{
                  flex: 1
                }}>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {report.highlights.map((highlight, i) => (
                      <li 
                        key={i}
                        style={{
                          ...getHighlightItemStyle(i),
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.75rem',
                          marginTop: '0.125rem',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 500,
                          lineHeight: 1.5,
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            )}
          </div>
          
          {/* Right Column - Statistics */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {report.statistics && (
              <>
                {/* Total Value Stat */}
                <div style={{
                  background: 'rgba(16, 28, 56, 0.7)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.25rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  opacity: interpolate(frame - (TITLE_DURATION + CARD_STAGGER), [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateX(${interpolate(frame - (TITLE_DURATION + CARD_STAGGER), [0, 15], [20, 0], { extrapolateRight: 'clamp' })}px)`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Total Value
                      </p>
                      <h3 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        margin: '0.5rem 0 0 0',
                        color: 'white',
                        letterSpacing: '-0.02em'
                      }}>
                        {report.statistics.totalValue}
                      </h3>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.375rem' }}>
                        <path d="M18 15L12 9L6 15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#10B981'
                      }}>
                        {report.statistics.totalValue}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    height: '0.5rem',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${statPercent1}%`,
                      background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      margin: 0
                    }}>
                      Period Average: {(statValue1 * 0.7).toFixed(2)} ETH
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      margin: 0
                    }}>
                      Target: {(statValue1 * 1.2).toFixed(2)} ETH
                    </p>
                  </div>
                </div>
                
                {/* Additional Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem'
                }}>
                  {/* Unique Addresses */}
                  <div style={{
                    background: 'rgba(16, 28, 56, 0.7)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.25rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(10px)',
                    opacity: interpolate(frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER), [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `translateY(${interpolate(frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER), [0, 15], [20, 0], { extrapolateRight: 'clamp' })}px)`
                  }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Unique Addresses
                    </p>
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      margin: '0.5rem 0 0 0',
                      color: 'white',
                      letterSpacing: '-0.02em'
                    }}>
                      {animateNumber(report.statistics.uniqueAddresses, STATS_STAGGER)}
                    </h3>
                    
                    {/* Small Donut Chart */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem'
                    }}>
                      {/* Background circle */}
                      <svg width="100%" height="100%" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" />
                        
                        {/* Progress arc - using stroke-dasharray and stroke-dashoffset to animate the circle */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.9" 
                          fill="none" 
                          stroke="#8B5CF6" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          strokeDasharray="100"
                          strokeDashoffset={100 - statPercent2}
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      
                      {/* Percentage text in the center */}
                      <div style={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'white'
                        }}>
                          {Math.min(100, Math.round(statPercent2))}%
                        </span>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                          Growth
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Significant Transactions */}
                  <div style={{
                    background: 'rgba(16, 28, 56, 0.7)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.25rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(10px)',
                    opacity: interpolate(frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER*2), [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `translateY(${interpolate(frame - (TITLE_DURATION + CARD_STAGGER + STATS_STAGGER*2), [0, 15], [20, 0], { extrapolateRight: 'clamp' })}px)`
                  }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Significant TXs
                    </p>
                    <h3 style={{
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      margin: '0.5rem 0 0 0',
                      color: 'white',
                      letterSpacing: '-0.02em'
                    }}>
                      {animateNumber(report.statistics.significantTransactions, STATS_STAGGER*2)}
                    </h3>
                    
                    {/* Bar Chart */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: '5rem',
                      padding: '0.5rem 0'
                    }}>
                      {[0.3, 0.5, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                        <div key={i} style={{
                          width: '14%',
                          height: `${height * statPercent3/100 * 100}%`,
                          background: i % 2 === 0 ? '#3B82F6' : '#60A5FA',
                          borderRadius: '3px',
                          transition: 'height 0.5s ease'
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Educational annotation */}
                {showAnnotations && (
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    opacity: annotationOpacity
                  }}>
           
                    <p style={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      margin: 0,
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Higher unique addresses indicates a more diverse network, while significant transactions represent high-value or important wallet interactions.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Footer with additional context if present */}
        {report.text && (
          <div style={{
            marginTop: '1.5rem',
            opacity: interpolate(frame - (TITLE_DURATION + CARD_STAGGER + 30), [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(frame - (TITLE_DURATION + CARD_STAGGER + 30), [0, 20], [20, 0], { extrapolateRight: 'clamp' })}px)`,
            width: '94%',
            marginLeft: '3%',
            maxWidth: '1000px'
          }}>
            <div style={{
              background: 'linear-gradient(180deg, rgba(23, 37, 84, 0.8) 0%, rgba(30, 58, 138, 0.8) 100%)',
              borderRadius: '1rem',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              padding: '1.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px rgba(59, 130, 246, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              {/* Decorative element */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                filter: 'blur(20px)',
                zIndex: 0
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1,
                maxWidth: '95%',
                paddingLeft: '2%'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                  marginRight: '1rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                    <path d="M12 7V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'white',
                    margin: '0 0 0.75rem 0',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    Analysis Summary
                  </h3>
                  <p style={{
                    fontSize: '1.125rem',
                    lineHeight: 1.6,
                    fontWeight: 500,
                    color: 'white',
                    margin: 0,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    {report.text}
                  </p>
                </div>
              </div>
              
              {/* Decorative bottom accent */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)',
                zIndex: 0,
                opacity: 0.8
              }} />
            </div>
          </div>
        )}

      </div>
    </AbsoluteFill>
  );
};
