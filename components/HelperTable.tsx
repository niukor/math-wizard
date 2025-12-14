import React from 'react';

interface HelperTableProps {
  divisor: number;
}

export const HelperTable: React.FC<HelperTableProps> = ({ divisor }) => {
  return (
    <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-math-yellow shadow-md">
      <h3 className="text-lg font-bold text-math-yellow mb-2 font-comic text-center">乘法小助手</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-sans text-gray-700">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div key={num} className="flex justify-between border-b border-yellow-200 pb-1">
            <span>{divisor} x {num}</span>
            <span className="font-bold">= {divisor * num}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center italic">参考这个来试商！</p>
    </div>
  );
};
