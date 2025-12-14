import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { GraduationCap, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface TeacherLoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

// Mock Teacher Data
const MOCK_TEACHER: User = { 
  id: 't1', 
  name: '李老师', 
  role: 'teacher', 
  className: '数学教研组', 
  avatarColor: 'bg-math-purple' 
};

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === 'admin') {
      onLogin(MOCK_TEACHER);
    } else {
      setError('密码错误，请重试。(默认密码: admin)');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 w-full max-w-md relative border-t-8 border-math-purple"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-math-purple" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">教师登录</h2>
          <p className="text-gray-400 text-sm mt-2">教学管理系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">管理员密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-3 font-bold text-gray-700 focus:outline-none focus:border-math-purple focus:bg-white transition-colors"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-purple-200 bg-math-purple hover:bg-purple-600 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            登录后台 <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-300">
          默认密码: admin
        </div>
      </motion.div>
    </div>
  );
};