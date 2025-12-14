import { DivisionStep, StepType } from '../types';

export const generateSteps = (dividend: number, divisor: number): DivisionStep[] => {
  const steps: DivisionStep[] = [];
  const dividendStr = dividend.toString();
  const digits = dividendStr.split('').map(Number);
  
  const quotient: (string | null)[] = new Array(digits.length).fill(null);
  const history: { value: string; offset: number; isSubtraction: boolean; operator?: string }[] = [];

  let currentWorkingVal = 0;
  let hasStarted = false;
  
  // Prepare rounding logic for "Test Quotient" method
  const unitDigit = divisor % 10;
  let roundedDivisor = 0;
  let roundingMethod = "";
  
  if (unitDigit < 5) {
    roundedDivisor = Math.floor(divisor / 10) * 10;
    roundingMethod = "四舍";
  } else {
    roundedDivisor = (Math.floor(divisor / 10) + 1) * 10;
    roundingMethod = "五入";
  }

  // 1. Initial Greeting
  steps.push({
    stepIndex: 0,
    type: StepType.START,
    message: `让我们计算 ${dividend} ÷ ${divisor}。使用“试商法”来解决！`,
    quotient: [...quotient],
    history: [],
    highlightDivisor: true,
  });

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    
    // Accumulate digits
    if (!hasStarted) {
      currentWorkingVal = currentWorkingVal * 10 + digit;
      
      // Strict 2-digit logic check
      if (i < 1) continue; // Need at least 2 digits
      
      if (currentWorkingVal < divisor && i < digits.length - 1) {
         continue;
      }
      
      hasStarted = true;
      
      // Construct the explanation message based on how many digits we took
      let startMsg = "";
      const firstTwoDigitsVal = parseInt(digits.slice(0, 2).join(''));

      if (i === 1) { 
          startMsg = `除数是两位数 (${divisor})，先看被除数的前两位：${currentWorkingVal}。因为 ${currentWorkingVal} ≥ ${divisor} (够除)，所以商写在十位上。`;
      } else {
          startMsg = `除数是两位数 (${divisor})，先看被除数的前两位：${firstTwoDigitsVal}。因为 ${firstTwoDigitsVal} < ${divisor} (不够除)，所以要看前三位：${currentWorkingVal}。`;
      }

      steps.push({
        stepIndex: steps.length,
        type: StepType.BRING_DOWN,
        message: startMsg,
        quotient: [...quotient],
        history: [...history],
        highlightDividendRange: [0, i],
        currentDividend: currentWorkingVal
      });

    } else {
      // Bring Down Step
      const prevRemainderVal = history[history.length - 1].value;
      const oldVal = parseInt(prevRemainderVal);
      currentWorkingVal = oldVal * 10 + digit;
      
      const newValStr = currentWorkingVal.toString();
      const newOffset = i - newValStr.length + 1;
      
      const newHistoryItem = { 
        value: newValStr, 
        offset: newOffset, 
        isSubtraction: false 
      };
      
      history[history.length - 1] = newHistoryItem;

      steps.push({
        stepIndex: steps.length,
        type: StepType.BRING_DOWN,
        message: `把 ${digit} 落下来，现在是 ${currentWorkingVal}。`,
        quotient: [...quotient],
        history: [...history],
        highlightDividendRange: [i, i],
        currentDividend: currentWorkingVal
      });
    }

    // --- ESTIMATE (Test Quotient Logic) ---
    const digitQuotient = Math.floor(currentWorkingVal / divisor);
    
    let estimateMessage = "";
    
    // Check if we need to show rounding
    const needsRounding = divisor !== roundedDivisor;

    if (!needsRounding) {
        // Exact 10s (e.g., 20, 30) don't need rounding
        estimateMessage = `想：${currentWorkingVal} 里面有几个 ${divisor}？`;
    } else {
        // Use Rounding
        estimateMessage = `试商：把 ${divisor} 看作 ${roundedDivisor} (${roundingMethod})。${currentWorkingVal} 里面大约有几个 ${roundedDivisor}？`;
    }

    estimateMessage += ` 我们可以试商 ${digitQuotient}。`;

    steps.push({
      stepIndex: steps.length,
      type: StepType.ESTIMATE,
      message: estimateMessage,
      quotient: [...quotient],
      history: [...history],
      highlightDivisor: true,
      currentDividend: currentWorkingVal,
      // Inject Rounding Data if needed
      roundedDivisor: needsRounding ? roundedDivisor : undefined,
      roundingMethod: needsRounding ? roundingMethod : undefined,
    });

    quotient[i] = digitQuotient.toString();

    // --- MULTIPLY ---
    const product = digitQuotient * divisor;
    const productStr = product.toString();
    const productOffset = i - productStr.length + 1;
    
    steps.push({
      stepIndex: steps.length,
      type: StepType.MULTIPLY,
      message: `商是 ${digitQuotient}。计算 ${divisor} × ${digitQuotient} = ${product}。`,
      quotient: [...quotient],
      history: [...history], 
      highlightQuotientIndex: i,
      highlightDivisor: true,
      currentProduct: product
    });

    // Push product to history
    history.push({
      value: productStr,
      offset: productOffset,
      isSubtraction: true,
      operator: '-'
    });

    // --- SUBTRACT ---
    const remainder = currentWorkingVal - product;
    const remainderStr = remainder.toString();
    const remainderOffset = i - remainderStr.length + 1;

    // Push remainder to history
    history.push({
      value: remainderStr,
      offset: remainderOffset,
      isSubtraction: false
    });

    steps.push({
      stepIndex: steps.length,
      type: StepType.SUBTRACT,
      message: `${currentWorkingVal} 减 ${product} 等于 ${remainder}。余数要比除数小。`,
      quotient: [...quotient],
      history: [...history],
      currentRemainder: remainder,
      currentDividend: currentWorkingVal,
      currentProduct: product
    });
  }

  // --- FINISHED ---
  const finalRem = history.length > 0 ? history[history.length - 1].value : "0";
  
  const finalPhrases = ["减得准！👍", "轻松减！😄", "减法棒！✨", "仔细减！👀"];
  const randomPhrase = finalPhrases[Math.floor(Math.random() * finalPhrases.length)];

  steps.push({
    stepIndex: steps.length,
    type: StepType.FINISHED,
    message: `${randomPhrase} 答案是 ${quotient.join('').replace(/^0+/, '') || '0'}，余数是 ${finalRem}。`,
    quotient: [...quotient],
    history: [...history],
    currentRemainder: parseInt(finalRem)
  });

  return steps;
};
