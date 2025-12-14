import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-comic text-math-blue mb-4 tracking-tight drop-shadow-sm">
            数学小宇宙
          </h1>
          <p className="text-xl text-gray-500 font-medium">请选择你的身份进入数学世界</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Card */}
          <motion.button
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole('student')}
            className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-transparent hover:border-math-blue transition-all group flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-math-blue" />
            <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:bg-math-blue transition-colors">
              <User className="w-12 h-12 text-math-blue group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-math-blue">我是学生</h2>
            <p className="text-gray-400 mb-8 font-medium">开启我的学习探险</p>
            <div className="mt-auto flex items-center gap-2 text-math-blue font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
              去登录 <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>

          {/* Teacher Card */}
          <motion.button
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole('teacher')}
            className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-transparent hover:border-math-purple transition-all group flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-math-purple" />
            <div className="bg-purple-100 p-6 rounded-full mb-6 group-hover:bg-math-purple transition-colors">
              <GraduationCap className="w-12 h-12 text-math-purple group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-math-purple">我是老师</h2>
            <p className="text-gray-400 mb-8 font-medium">进入教学管理后台</p>
            <div className="mt-auto flex items-center gap-2 text-math-purple font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
              去登录 <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};