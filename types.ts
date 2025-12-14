
export enum StepType {
  START = 'START',
  ESTIMATE = 'ESTIMATE',
  MULTIPLY = 'MULTIPLY',
  SUBTRACT = 'SUBTRACT',
  BRING_DOWN = 'BRING_DOWN',
  REMAINDER = 'REMAINDER',
  FINISHED = 'FINISHED'
}

export interface DivisionStep {
  stepIndex: number;
  type: StepType;
  message: string;
  quotient: (string | null)[];
  
  // The working rows representing the subtraction history
  // Each row is a string of numbers positioned by offset
  history: {
    value: string;
    offset: number; // visual indentation
    isSubtraction: boolean; // if true, draw a line under it
    operator?: string; // '-'
  }[];

  // Visual highlights
  highlightDividendRange?: [number, number]; // [start, end] index of current working dividend
  highlightDivisor?: boolean;
  highlightQuotientIndex?: number;
  
  // Rounding Logic Visualization (New)
  roundedDivisor?: number;
  roundingMethod?: string; // "四舍" | "五入"

  // Current working variables for display
  currentDividend?: number;
  currentProduct?: number;
  currentRemainder?: number;
}

export interface DivisionProblem {
  dividend: number;
  divisor: number;
}
