import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { User, UserRole } from '../types';
import { Calculator, User as UserIcon, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock Database
const MOCK_USERS: User[] = [
  { id: 's1', name: '李小明', role: 'student', grade: 4, semester: 1, className: '四年级(2)班', avatarColor: 'bg-math-blue' },
  { id: 's2', name: '张小红', role: 'student', grade: 2, semester: 1, className: '二年级(1)班', avatarColor: 'bg-math-pink' },
  { id: 't1', name: '李老师', role: 'teacher', className: '数学教研组', avatarColor: 'bg-math-purple' }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [inputValue, setInputValue] = useState(''); // Name for student, Pwd for teacher
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'student') {
      // Simple Name Matching
      const user = MOCK_USERS.find(u => u.role === 'student' && u.name === inputValue.trim());
      if (user) {
        onLogin(user);
      } else {
        setError('找不到这位同学哦，试试输入“李小明”或“张小红”');
      }
    } else {
      // Simple Password Check (Mock: password is 'admin')
      if (inputValue === 'admin') {
        const teacher = MOCK_USERS.find(u => u.role === 'teacher');
        if (teacher) onLogin(teacher);
      } else {
        setError('密码错误。提示：试试 admin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border-4 border-white"
      >
        {/* Left Side: Visual */}
        <div className="bg-math-blue p-10 md:w-1/2 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 text-white">
            <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-sm">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold font-comic mb-4">数学小宇宙</h1>
            <p className="text-blue-100 text-lg font-medium">开启你的奇妙数学探险之旅！</p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 mt-12">
             <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
               <p className="text-sm text-blue-100 italic">"数学是打开科学大门的钥匙。"</p>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 md:w-1/2 bg-white flex flex-col justify-center">
          
          {/* Role Tabs */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 self-center w-full max-w-xs">
            <button
              onClick={() => { setRole('student'); setInputValue(''); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'student' ? 'bg-white text-math-blue shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserIcon className="w-4 h-4" /> 我是学生
            </button>
            <button
              onClick={() => { setRole('teacher'); setInputValue(''); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'teacher' ? 'bg-white text-math-purple shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> 我是老师
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {role === 'student' ? '欢迎回来，同学！' : '教师登录'}
            </h2>
            <p className="text-gray-400 text-sm">
              {role === 'student' ? '请输入你的名字开始学习' : '请输入管理密码进入后台'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                {role === 'student' ? '你的名字' : '管理密码'}
              </label>
              <input
                type={role === 'student' ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={role === 'student' ? "例如：李小明" : "请输入密码"}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg font-bold text-gray-700 focus:outline-none focus:border-math-blue focus:bg-white transition-colors placeholder:font-medium placeholder:text-gray-300"
                autoFocus
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:brightness-110 ${
                role === 'student' ? 'bg-math-blue shadow-blue-200' : 'bg-math-purple shadow-purple-200'
              }`}
            >
              {role === 'student' ? '出发！' : '登录'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {role === 'student' && (
             <div className="mt-8 text-center">
               <p className="text-xs text-gray-400">试玩账号：李小明 (4年级) 或 张小红 (2年级)</p>
             </div>
          )}
          {role === 'teacher' && (
             <div className="mt-8 text-center">
               <p className="text-xs text-gray-400">测试密码：admin</p>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};