import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '../types';
import { User as UserIcon, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

interface StudentLoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

// Mock Student Data with Phone Numbers
const MOCK_STUDENTS: User[] = [
  { id: 's1', name: '李小明', phoneNumber: '13800000001', role: 'student', grade: 4, semester: 1, className: '四年级(2)班', avatarColor: 'bg-math-blue' },
  { id: 's2', name: '张小红', phoneNumber: '13800000002', role: 'student', grade: 2, semester: 1, className: '二年级(1)班', avatarColor: 'bg-math-pink' },
];

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onLogin, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      setError('请填写完整的姓名和手机号哦');
      return;
    }

    // Validate both Name and Phone
    const student = MOCK_STUDENTS.find(s => s.name === trimmedName && s.phoneNumber === trimmedPhone);

    if (student) {
      onLogin(student);
    } else {
      setError('姓名或手机号不对，请检查一下。(试玩: 李小明 / 13800000001)');
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 w-full max-w-md relative border-t-8 border-math-blue"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-math-blue" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">学生登录</h2>
          <p className="text-gray-400 text-sm mt-2">欢迎回来，开始今天的挑战吧！</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">姓名</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入你的名字"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-3 font-bold text-gray-700 focus:outline-none focus:border-math-blue focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">家长手机号</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号码"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-5 py-3 font-bold text-gray-700 focus:outline-none focus:border-math-blue focus:bg-white transition-colors"
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
            className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-blue-200 bg-math-blue hover:bg-blue-600 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            登录 <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-300">
          测试账号: 李小明 / 13800000001
        </div>
      </motion.div>
    </div>
  );
};