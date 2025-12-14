import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DivisionStep, StepType } from '../types';
import { ArrowDown, X, Equal, BrainCircuit } from 'lucide-react';

interface VisualizerProps {
  dividend: number;
  divisor: number;
  currentStep: DivisionStep;
}

export const Visualizer: React.FC<VisualizerProps> = ({ dividend, divisor, currentStep }) => {
  const dividendStr = dividend.toString();
  const digits = dividendStr.split('');

  // Config for unit size (width of a digit block)
  const UNIT_W = 3; // rem
  const UNIT_H = 3.5; // rem

  // Helper to render the quotient row
  const renderQuotient = () => {
    return (
      <div className="flex ml-2 relative">
        {digits.map((_, idx) => (
          <motion.div 
            key={`q-${idx}`} 
            className="flex items-center justify-center font-bold text-3xl text-math-blue"
            style={{ width: `${UNIT_W}rem`, height: `${UNIT_H}rem` }}
          >
            <AnimatePresence mode="popLayout">
              {currentStep.quotient[idx] !== null && (
                <motion.span
                  key={`q-val-${idx}`}
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: currentStep.highlightQuotientIndex === idx ? 1.5 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {currentStep.quotient[idx]}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper to render history rows (subtractions)
  const renderHistory = () => {
    return (
      <AnimatePresence initial={false}>
        {currentStep.history.map((row, rIdx) => {
          const paddingLeft = row.offset * UNIT_W; 
          
          return (
            <motion.div 
              key={`h-${rIdx}`} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center ml-2 relative ${row.isSubtraction ? 'border-b-4 border-gray-800' : ''}`}
              style={{ paddingLeft: `${paddingLeft}rem` }}
            >
              {row.operator && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute left-0 -ml-6 text-2xl font-bold text-gray-400 font-sans"
                >
                  {row.operator}
                </motion.span>
              )}
              {row.value.split('').map((char, cIdx) => (
                <div 
                  key={`h-${rIdx}-${cIdx}`} 
                  className="flex items-center justify-center text-2xl font-sans font-bold text-gray-700"
                  style={{ width: `${UNIT_W}rem`, height: `${UNIT_H}rem` }}
                >
                  {char}
                </div>
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    );
  };

  // Render Dividend Digits with "Bring Down" Arrow Logic
  const renderDividend = () => {
    return digits.map((digit, idx) => {
      // Logic for Bring Down Arrow
      const isBringDownTarget = currentStep.type === StepType.BRING_DOWN && 
                                currentStep.highlightDividendRange &&
                                idx === currentStep.highlightDividendRange[1] &&
                                currentStep.stepIndex > 1;

      const isHighlighted = currentStep.highlightDividendRange && 
                            idx >= currentStep.highlightDividendRange[0] && 
                            idx <= currentStep.highlightDividendRange[1];

      return (
        <div 
          key={`d-${idx}`} 
          className="relative flex items-center justify-center font-bold text-3xl"
          style={{ width: `${UNIT_W}rem`, height: `${UNIT_H}rem` }}
        >
          {/* Background Highlight */}
          {isHighlighted && (
            <motion.div 
              layoutId="dividend-highlight"
              className="absolute inset-0 bg-math-yellow/20 rounded-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* The Digit */}
          <span className={isHighlighted ? 'text-black' : 'text-gray-900'}>{digit}</span>

          {/* Bring Down Arrow Animation */}
          {isBringDownTarget && (
             <motion.div
               className="absolute top-full left-1/2 -ml-3 text-math-pink z-20"
               initial={{ y: -10, opacity: 0 }}
               animate={{ y: [0, 40, 40], opacity: [1, 1, 0] }}
               transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
             >
               <ArrowDown strokeWidth={4} className="w-6 h-6" />
             </motion.div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-2xl border-4 border-math-blue/10 max-w-3xl w-full mx-auto overflow-x-auto relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Equal size={100} />
      </div>

      <div className="inline-block min-w-min">
        
        {/* Main Flex Row: Left (Divisor) | Right (Quotient + Dividend + History) */}
        <div className="flex items-start pl-2">
          
          {/* Left Column: Spacer + Divisor */}
          {/* Added ml-28 (roughly 112px) to reserve space for the absolute positioned speech bubble on the left */}
          <div className="flex flex-col mr-4 ml-28">
             {/* Spacer to push divisor down below the quotient line */}
             <div style={{ height: `${UNIT_H}rem` }}></div>
             
             {/* The Divisor */}
             <div className="flex items-center justify-end pt-1 relative h-[3.5rem]">
                
                {/* Visual Bubble for Rounding (Test Quotient) */}
                <AnimatePresence>
                  {currentStep.roundedDivisor && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, x: -20, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, x: -8, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0, x: -20 }}
                      className="absolute right-full mr-2 top-[-1rem] bg-gradient-to-br from-green-50 to-white border-2 border-math-green text-math-green rounded-2xl p-2 shadow-lg min-w-[90px] text-center z-20"
                    >
                       <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-500 bg-green-100 rounded-full py-0.5 px-2 mb-1 w-fit mx-auto">
                         {currentStep.roundingMethod === '四舍' ? '⬇️ 四舍' : '⬆️ 五入'}
                       </div>
                       <div className="text-xs font-bold text-gray-400">看作</div>
                       <div className="text-3xl font-extrabold text-math-green font-comic">{currentStep.roundedDivisor}</div>
                       
                       {/* Speech bubble tail pointing to divisor */}
                       <div className="absolute top-1/2 -right-2 w-3 h-3 bg-white border-t-2 border-r-2 border-math-green transform rotate-45 mt-1"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  className={`text-3xl font-bold pr-2 ${currentStep.highlightDivisor ? 'text-math-pink' : 'text-gray-800'}`}
                  animate={currentStep.highlightDivisor ? { scale: 1.1 } : { scale: 1 }}
                >
                  {divisor}
                  {currentStep.highlightDivisor && (
                    <motion.div 
                      layoutId="divisor-box"
                      className="absolute inset-0 -ml-2 border-2 border-math-pink rounded-lg pointer-events-none"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
             </div>
          </div>

          {/* Right Column: Quotient (Top) | Dividend & History (Bottom) */}
          <div className="flex flex-col relative">
             
             {/* 1. Quotient Row */}
             {renderQuotient()}

             {/* 2. Dividend Row + Bracket */}
             <div className="relative">
                {/* The Big Bracket SVG - Absolute positioned relative to this container */}
                <svg className="absolute left-0 top-0 h-full w-6 -ml-4 pointer-events-none overflow-visible">
                  <path 
                    d="M15,100 C-5,80 -5,20 15,0" 
                    fill="none" 
                    stroke="black" 
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    className="h-full"
                  />
                </svg>

                {/* Dividend Numbers */}
                <div className="flex ml-2 pt-1 border-t-4 border-black">
                  {renderDividend()}
                </div>
             </div>

             {/* 3. History Rows */}
             <div className="ml-2 flex flex-col items-start mt-1 space-y-0">
                {renderHistory()}
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};
