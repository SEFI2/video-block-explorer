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
        <Series.Sequence durationInFrames={5 * videoConfig.fps}>
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
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(114, 63, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '40%',
        height: '40%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(65, 120, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
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
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 0
      }} />
      
      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '2.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
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
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: 0,
                color: 'white',
                letterSpacing: '-0.02em'
              }}>
                Wallet Activity Report
              </h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <p style={{
                fontSize: '1.125rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0
              }}>
                Analysis for period {index + 1}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                marginLeft: '1rem'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  marginRight: '0.5rem'
                }} />
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#3B82F6'
                }}>
                  LIVE
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              marginRight: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
                Wallet Address
              </p>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                margin: '0.125rem 0 0 0',
                color: 'white'
              }}>
                {report?.userAddress ? `${report.userAddress.substring(0, 6)}...${report.userAddress.substring(report.userAddress.length - 4)}` : '0x1234...5678'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          flex: 1
        }}>
          {/* Left Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Key Highlights Card */}
            {report.highlights && report.highlights.length > 0 && (
              <div style={{
                background: 'rgba(16, 28, 56, 0.6)',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                    gap: '1.25rem'
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
                
                {/* Educational annotation */}
                {showAnnotations && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    opacity: annotationOpacity
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                        <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
                        <path d="M12 7V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="#3B82F6"/>
                      </svg>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#3B82F6'
                      }}>
                        Why This Matters
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      margin: 0,
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      These key activities represent significant patterns in your wallet behavior that impact your overall portfolio performance.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Statistics */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {report.statistics && (
              <>
                {/* Total Value Stat */}
                <div style={{
                  background: 'rgba(16, 28, 56, 0.6)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                        fontSize: '2rem',
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
                  gap: '1.5rem'
                }}>
                  {/* Unique Addresses */}
                  <div style={{
                    background: 'rgba(16, 28, 56, 0.6)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                      fontSize: '2rem',
                      fontWeight: 700,
                      margin: '0.5rem 0 0.75rem 0',
                      color: 'white'
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
                    background: 'rgba(16, 28, 56, 0.6)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
                      fontSize: '2rem',
                      fontWeight: 700,
                      margin: '0.5rem 0 0.75rem 0',
                      color: 'white'
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                        <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2"/>
                        <path d="M12 7V12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="#8B5CF6"/>
                      </svg>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#8B5CF6'
                      }}>
                        Understanding These Numbers
                      </span>
                    </div>
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
            opacity: interpolate(frame - (TITLE_DURATION + CARD_STAGGER + 50), [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(frame - (TITLE_DURATION + CARD_STAGGER + 50), [0, 20], [20, 0], { extrapolateRight: 'clamp' })}px)`
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '1.25rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(59, 130, 246, 0.1)',
                  marginRight: '0.75rem',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2"/>
                    <path d="M12 7V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="#3B82F6"/>
                  </svg>
                </div>
                <div>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.8)',
                    margin: 0
                  }}>
                    {report.text}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.75rem', flexShrink: 0 }}>
                      <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                      Consider reviewing your transaction patterns and optimizing gas usage for better portfolio management.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Branding Watermark */}
        <div style={{
          position: 'absolute',
          right: '1.5rem',
          bottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.5
        }}>
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.7)',
            marginRight: '0.5rem'
          }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.05em'
          }}>
            Wallet Insights • Period {index + 1}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
