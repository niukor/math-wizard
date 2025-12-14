import React, { useState, useEffect, useRef } from 'react';
import { generateSteps } from '../utils/divisionGenerator';
// import { generateMathStory } from '../services/geminiService'; // AI Disabled
import { StepType } from '../types';
import type { DivisionStep } from '../types';
import { Visualizer } from './Visualizer';
import { HelperTable } from './HelperTable';
import { Wizard } from './Wizard';
import { Play, Pause, ChevronRight, ChevronLeft, RotateCcw, Calculator, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DivisionWizardProps {
  onBack: () => void;
}

export const DivisionWizard: React.FC<DivisionWizardProps> = ({ onBack }) => {
  // Input State
  const [dividendInput, setDividendInput] = useState<string>('144');
  const [divisorInput, setDivisorInput] = useState<string>('12');
  
  // Game State
  const [steps, setSteps] = useState<DivisionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  // const [mathStory, setMathStory] = useState<string>(''); // AI Disabled
  // const [loadingStory, setLoadingStory] = useState<boolean>(false); // AI Disabled

  const timerRef = useRef<number | null>(null);

  // Derive emotion from step type
  const getWizardEmotion = (stepType: StepType | undefined): 'happy' | 'thinking' | 'magic' | 'waiting' => {
    if (!stepType) return 'waiting';
    switch (stepType) {
      case StepType.START: return 'happy';
      case StepType.ESTIMATE: return 'thinking';
      case StepType.MULTIPLY: return 'magic';
      case StepType.SUBTRACT: return 'magic';
      case StepType.BRING_DOWN: return 'waiting';
      case StepType.FINISHED: return 'happy';
      default: return 'waiting';
    }
  };

  const startCalculation = async () => {
    const d = parseInt(dividendInput);
    const dv = parseInt(divisorInput);

    if (isNaN(d) || isNaN(dv)) {
      setErrorMsg("请输入有效的数字。");
      return;
    }
    if (dv < 10 || dv > 99) {
      setErrorMsg("除数必须是两位数 (10-99)。");
      return;
    }
    if (d < dv) {
      setErrorMsg("被除数必须大于除数。");
      return;
    }
    
    setErrorMsg('');
    const generated = generateSteps(d, dv);
    setSteps(generated);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    
    // AI Integration - Temporarily Disabled
    /*
    setLoadingStory(true);
    const story = await generateMathStory(d, dv);
    setMathStory(story);
    setLoadingStory(false);
    */
  };

  const reset = () => {
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    // setMathStory(''); // AI Disabled
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        handleNext();
      }, 3000); // Slower for kids to read
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length]);

  // Auto-stop at end
  useEffect(() => {
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-sans text-gray-800 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md p-4 text-center border-b-4 border-math-blue/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                title="返回主页"
             >
                <ArrowLeft className="w-6 h-6 text-gray-500 group-hover:text-math-blue" />
             </button>
             <div className="flex items-center gap-2">
               <div className="bg-math-blue p-2 rounded-lg text-white">
                 <Calculator className="w-6 h-6" />
               </div>
               <h1 className="text-2xl md:text-3xl font-bold font-comic text-math-blue">
                 除法小巫师
               </h1>
             </div>
           </div>
           <button onClick={reset} className="text-sm font-bold text-gray-500 hover:text-math-blue flex items-center gap-1">
             <RotateCcw className="w-4 h-4" /> 重新开始
           </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Input & Tools */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          {/* Input Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-xl border-2 border-white ring-4 ring-math-blue/5"
          >
            <h2 className="text-lg font-bold mb-4 text-gray-600 flex items-center gap-2">
              <span className="bg-math-yellow text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              设置题目
            </h2>
            
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-gray-400 mb-1 uppercase text-center">被除数</label>
                <input 
                  type="number" 
                  value={dividendInput}
                  onChange={(e) => setDividendInput(e.target.value)}
                  className="w-full text-3xl font-bold p-2 bg-transparent border-b-2 border-gray-300 focus:border-math-blue outline-none text-center text-math-blue"
                />
              </div>
              <span className="text-3xl font-bold text-gray-300">÷</span>
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-gray-400 mb-1 uppercase text-center">除数</label>
                <input 
                  type="number" 
                  value={divisorInput}
                  onChange={(e) => setDivisorInput(e.target.value)}
                  className="w-full text-3xl font-bold p-2 bg-transparent border-b-2 border-gray-300 focus:border-math-pink outline-none text-center text-math-pink"
                />
              </div>
            </div>
            
            {errorMsg && <p className="text-red-500 text-sm mb-3 font-bold bg-red-50 p-2 rounded-lg">{errorMsg}</p>}
            
            <button 
              onClick={startCalculation}
              className="w-full bg-math-blue hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              <Sparkles className="w-5 h-5" />
              开始魔法计算!
            </button>
          </motion.div>

          {/* Math Story - Temporarily Disabled */}
          {/* <AnimatePresence>
            {(mathStory || loadingStory) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-5 rounded-3xl border-2 border-purple-100 shadow-md overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <BookOpen className="w-16 h-16 text-purple-500" />
                </div>
                <h3 className="font-comic font-bold text-purple-600 mb-2 flex items-center gap-2">
                  <span className="bg-purple-100 p-1 rounded-md"><Sparkles className="w-4 h-4" /></span>
                  应用题挑战
                </h3>
                {loadingStory ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                      <div className="h-4 bg-purple-100 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-800 text-base leading-relaxed font-medium">{mathStory}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence> */}

          {/* Helper Table */}
          <AnimatePresence>
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <HelperTable divisor={parseInt(divisorInput)} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Visualizer & Wizard */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {steps.length > 0 && currentStepIndex >= 0 ? (
            <>
              {/* Wizard Message Area */}
              <div className="min-h-[140px] flex items-end">
                <Wizard 
                  emotion={getWizardEmotion(currentStep?.type)} 
                  message={currentStep.message}
                />
              </div>

              {/* The Visualizer Board */}
              <motion.div 
                className="flex-grow flex items-center justify-center py-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <Visualizer 
                  dividend={parseInt(dividendInput)}
                  divisor={parseInt(divisorInput)}
                  currentStep={currentStep}
                />
              </motion.div>

              {/* Controls */}
              <div className="bg-white p-3 rounded-full shadow-xl shadow-blue-100 border border-white flex items-center justify-between max-w-lg mx-auto w-full">
                 <button 
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 
                 <div className="flex flex-col items-center">
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                     步骤 {currentStepIndex + 1} / {steps.length}
                   </div>
                   <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={currentStepIndex >= steps.length - 1}
                    className={`w-14 h-14 rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
                      currentStepIndex >= steps.length - 1 ? 'bg-gray-300' : 'bg-math-blue hover:bg-indigo-600'
                    }`}
                   >
                     {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                   </button>
                 </div>

                 <button 
                  onClick={handleNext}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-4 border-dashed border-gray-200 rounded-[3rem] p-10 bg-white/50 min-h-[400px]">
              <div className="bg-gray-100 p-6 rounded-full mb-6">
                <Calculator className="w-16 h-16 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-500 mb-2">准备好了吗？</p>
              <p className="text-gray-400">在左侧输入数字，小巫师会带你一起解题！</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};