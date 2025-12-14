import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardProps {
  emotion: 'happy' | 'thinking' | 'magic' | 'waiting';
  message: string;
}

export const Wizard: React.FC<WizardProps> = ({ emotion, message }) => {
  
  const getEmoji = () => {
    switch(emotion) {
      case 'thinking': return '🤔';
      case 'magic': return '✨';
      case 'happy': return '🎉';
      default: return '👋';
    }
  };

  const getWizardImage = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Robe */}
        <path d="M20,90 Q50,100 80,90 L75,40 L25,40 Z" fill="#4F46E5" />
        
        {/* Head */}
        <circle cx="50" cy="35" r="20" fill="#FFD1B3" />
        
        {/* Hat */}
        <motion.path 
          d="M20,30 L50,5 L80,30 Q50,40 20,30 Z" 
          fill="#8B5CF6" 
          stroke="#4C1D95" 
          strokeWidth="2"
          animate={emotion === 'magic' ? { y: -5, rotate: [0, -5, 5, 0] } : {}}
        />
        <path d="M20,30 Q50,40 80,30" fill="none" stroke="#4C1D95" strokeWidth="2" />
        
        {/* Eyes */}
        {emotion === 'thinking' ? (
           <>
             <circle cx="43" cy="32" r="2" fill="black" />
             <circle cx="57" cy="32" r="2" fill="black" />
             <path d="M45,42 Q50,38 55,42" fill="none" stroke="black" strokeWidth="1" />
           </>
        ) : (
           <>
             <circle cx="43" cy="35" r="3" fill="black" />
             <circle cx="57" cy="35" r="3" fill="black" />
             <path d="M45,45 Q50,50 55,45" fill="none" stroke="black" strokeWidth="2" />
           </>
        )}

        {/* Arms/Wand */}
        {emotion === 'magic' && (
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
             <rect x="75" y="45" width="5" height="30" fill="#5D4037" transform="rotate(-45 75 45)" />
             <circle cx="95" cy="25" r="5" fill="#F59E0B" />
          </motion.g>
        )}
      </svg>
    );
  };

  // Function to parse the message and apply highlighting
  const renderHighlightedMessage = (text: string) => {
    // Regex matches:
    // 1. Numbers (\d+)
    // 2. Math Operators (×, ÷, =, +, -)
    // 3. Specific Keywords (试商, 余数, 落下来, 不够除, 够除, 四舍, 五入)
    const regex = /(\d+|[×÷=+\-]|试商|余数|落下来|不够除|够除|四舍|五入)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      let className = "text-gray-800"; // Default
      
      // Check if it's a number
      if (/^\d+$/.test(part)) {
        className = "text-math-blue font-bold text-xl inline-block mx-0.5";
      }
      // Check if it's an operator
      else if (/^[×÷=+\-]$/.test(part)) {
        className = "text-math-pink font-bold text-xl mx-1";
      }
      // Check keywords
      else if (["试商", "余数", "四舍", "五入"].includes(part)) {
        className = "text-math-purple font-bold border-b-2 border-math-purple/30";
      }
      else if (["落下来", "不够除", "够除"].includes(part)) {
        className = "text-math-green font-bold";
      }

      return (
        <motion.span
          key={index}
          className={className}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }} // Typewriter effect
        >
          {part}
        </motion.span>
      );
    });
  };

  return (
    <div className="flex flex-row md:flex-col items-start md:items-center gap-4 w-full">
      {/* Wizard Character */}
      <motion.div 
        className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key="wizard-char"
      >
        {getWizardImage()}
        {/* Floating Emoji Bubble */}
        <motion.div 
          className="absolute -top-2 -right-2 text-3xl bg-white rounded-full p-1 shadow-md border border-gray-100"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {getEmoji()}
        </motion.div>
      </motion.div>

      {/* Speech Bubble */}
      <motion.div 
        className="relative bg-white p-6 rounded-2xl rounded-tl-none shadow-lg border-2 border-math-blue/20 flex-grow w-full"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        key={message} // Re-mount component on new message to trigger typewriter effect
      >
        <div className="text-lg md:text-xl font-comic leading-relaxed tracking-wide">
          {renderHighlightedMessage(message)}
        </div>
        
        {/* Little tail triangle */}
        <div className="absolute top-0 left-0 -ml-2 mt-4 w-4 h-4 bg-white border-t-2 border-l-2 border-math-blue/20 transform -rotate-45"></div>
      </motion.div>
    </div>
  );
};