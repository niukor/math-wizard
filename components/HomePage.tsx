import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole } from '../types';
import { 
  Calculator, 
  Ruler, 
  LayoutGrid, 
  ArrowRight, 
  Star, 
  Trophy,
  User as UserIcon,
  Divide,
  X,
  Binary,
  Thermometer,
  Compass,
  Clock,
  Shapes,
  Coins,
  Scale,
  Calendar,
  Footprints,
  Apple,
  BookOpen,
  PieChart,
  Target,
  Triangle,
  BoxSelect,
  Layers,
  GraduationCap,
  LogOut
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentUser: User;
  onLogout: () => void;
}

// Data Models
type UnitStatus = 'locked' | 'active' | 'completed';

interface Unit {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  status: UnitStatus;
  desc?: string;
  action?: string; // For navigation routing
}

interface SemesterData {
  1: Unit[]; // Vol 1 (上册)
  2: Unit[]; // Vol 2 (下册)
}

interface GradeData {
  [key: number]: SemesterData;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentUser, onLogout }) => {
  // Initialize state based on the logged-in user
  const [activeGrade, setActiveGrade] = useState<number>(currentUser.grade || 4);
  const [activeSemester, setActiveSemester] = useState<1 | 2>(currentUser.semester || 1); 

  // If user changes (unlikely without unmounting, but good practice), update state
  useEffect(() => {
    if (currentUser.role === 'student' && currentUser.grade) {
      setActiveGrade(currentUser.grade);
      setActiveSemester(currentUser.semester || 1);
    }
  }, [currentUser]);

  // Display configurations based on role
  const userDisplay = currentUser.role === 'teacher' ? {
    welcome: "您正在查看全校课程进度",
    subtitle: "教学管理模式"
  } : {
    welcome: "准备好今天的数学探险了吗？",
    subtitle: currentUser.className || `${currentUser.grade}年级`
  };

  // Curriculum Data (Based on BNU - North Normal University Version)
  const curriculumData: GradeData = {
    1: {
      1: [
        { id: 1, title: "快乐的校园", icon: <Apple className="w-8 h-8" />, color: "bg-red-100 text-red-600", status: "locked", desc: "10以内数的认识" },
        { id: 2, title: "比较", icon: <Scale className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "比大小、比多少" },
        { id: 3, title: "加与减(一)", icon: <Calculator className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "10以内的加减法" },
        { id: 4, title: "分类", icon: <LayoutGrid className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "整理房间" },
        { id: 5, title: "位置与顺序", icon: <Footprints className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "前后上下左右" },
        { id: 6, title: "认识图形", icon: <Shapes className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "长方体、正方体等" },
        { id: 7, title: "加与减(二)", icon: <Binary className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "20以内的加减法" },
        { id: 8, title: "认识钟表", icon: <Clock className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "小明的一天" },
      ],
      2: [
        { id: 1, title: "加与减(一)", icon: <Calculator className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "20以内退位减法" },
        { id: 2, title: "观察物体", icon: <BoxSelect className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "看一看(一)" },
        { id: 3, title: "生活中的数", icon: <Binary className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "100以内数的认识" },
        { id: 4, title: "有趣的图形", icon: <Shapes className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "认识平面图形" },
        { id: 5, title: "加与减(二)", icon: <Calculator className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "100以内不进位加减" },
        { id: 6, title: "加与减(三)", icon: <Target className="w-8 h-8" />, color: "bg-red-100 text-red-600", status: "locked", desc: "100以内进位退位" },
      ]
    },
    2: {
      1: [
        { id: 1, title: "加与减", icon: <Calculator className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "100以内连加连减" },
        { id: 2, title: "购物", icon: <Coins className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "认识人民币" },
        { id: 3, title: "数一数与乘法", icon: <X className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "乘法的初步认识" },
        { id: 4, title: "图形的变化", icon: <Shapes className="w-8 h-8" />, color: "bg-indigo-100 text-indigo-600", status: "locked", desc: "折一折，做一做" },
        { id: 5, title: "2-5的乘法口诀", icon: <Binary className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "快乐的动物" },
        { id: 6, title: "测量", icon: <Ruler className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "教室有多长" },
        { id: 7, title: "分一分与除法", icon: <Divide className="w-8 h-8" />, color: "bg-red-100 text-red-600", status: "locked", desc: "除法的初步认识" },
        { id: 8, title: "6-9的乘法口诀", icon: <Trophy className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "数学好玩" },
      ],
      2: [
        { id: 1, title: "除法", icon: <Divide className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "有余数的除法" },
        { id: 2, title: "方向与位置", icon: <Compass className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "东南西北" },
        { id: 3, title: "生活中的大数", icon: <Binary className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "万以内数的认识" },
        { id: 4, title: "测量", icon: <Ruler className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "分米、毫米、千米" },
        { id: 5, title: "加与减", icon: <Calculator className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "三位数的加减法" },
        { id: 6, title: "认识图形", icon: <Shapes className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "角、长方形、正方形" },
        { id: 7, title: "时、分、秒", icon: <Clock className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "时间单位" },
        { id: 8, title: "调查与记录", icon: <PieChart className="w-8 h-8" />, color: "bg-red-100 text-red-600", status: "locked", desc: "数据的整理" },
      ]
    },
    3: {
      1: [
        { id: 1, title: "混合运算", icon: <Calculator className="w-8 h-8" />, color: "bg-indigo-100 text-indigo-600", status: "locked", desc: "小熊购物" },
        { id: 2, title: "观察物体", icon: <BoxSelect className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "看一看" },
        { id: 3, title: "加与减", icon: <Binary className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "三位数的连加连减" },
        { id: 4, title: "乘与除", icon: <X className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "整十、整百乘除" },
        { id: 5, title: "周长", icon: <Ruler className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "图形的周长" },
        { id: 6, title: "乘法", icon: <LayoutGrid className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "两三位数乘一位数" },
        { id: 7, title: "年、月、日", icon: <Calendar className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "时间与数学" },
        { id: 8, title: "认识小数", icon: <Coins className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "文具店" },
      ],
      2: [
        { id: 1, title: "除法", icon: <Divide className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "两三位数除以一位数" },
        { id: 2, title: "图形的运动", icon: <Triangle className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "对称、平移、旋转" },
        { id: 3, title: "乘法", icon: <X className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "两位数乘两位数" },
        { id: 4, title: "千克、克、吨", icon: <Scale className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "质量单位" },
        { id: 5, title: "面积", icon: <Layers className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "长方形面积" },
        { id: 6, title: "认识分数", icon: <PieChart className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "分一分(一)" },
        { id: 7, title: "数据的整理", icon: <Binary className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "统计图表" },
      ]
    },
    4: {
      1: [
        { id: 1, title: "认识更大的数", icon: <Binary className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked" },
        { id: 2, title: "线与角", icon: <Ruler className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked" },
        { id: 3, title: "乘法", icon: <X className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", status: "locked", desc: "三位数乘两位数" },
        { id: 4, title: "运算律", icon: <LayoutGrid className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked" },
        { id: 5, title: "方向与位置", icon: <Compass className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked" },
        { id: 6, title: "除法", icon: <Divide className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "active", desc: "2位数除法动画演示", action: 'division' },
        { id: 7, title: "生活中的负数", icon: <Thermometer className="w-8 h-8" />, color: "bg-indigo-100 text-indigo-600", status: "locked" },
        { id: 8, title: "数学好玩", icon: <Trophy className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked" },
      ],
      2: [
        { id: 1, title: "小数的意义", icon: <Coins className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", status: "locked", desc: "小数加减法" },
        { id: 2, title: "认识三角形", icon: <Triangle className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", status: "locked", desc: "三角形和四边形" },
        { id: 3, title: "小数乘法", icon: <X className="w-8 h-8" />, color: "bg-green-100 text-green-600", status: "locked", desc: "小数乘法运算" },
        { id: 4, title: "观察物体", icon: <BoxSelect className="w-8 h-8" />, color: "bg-purple-100 text-purple-600", status: "locked", desc: "多角度观察" },
        { id: 5, title: "认识方程", icon: <Binary className="w-8 h-8" />, color: "bg-pink-100 text-pink-600", status: "locked", desc: "字母表示数" },
        { id: 6, title: "数据的表示", icon: <PieChart className="w-8 h-8" />, color: "bg-teal-100 text-teal-600", status: "locked", desc: "条形统计图" },
      ]
    }
  };

  const handleUnitClick = (unit: Unit) => {
    if (unit.status === 'active' && unit.action) {
      onNavigate(unit.action);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-gray-800 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-math-blue text-white p-2 rounded-xl shadow-lg shadow-blue-200">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 font-comic tracking-tight">数学小宇宙</h1>
              <p className="text-xs text-gray-500 font-bold">北师大版 · {activeSemester === 1 ? '上册' : '下册'}</p>
            </div>
          </div>

          {/* Right Area: Profile & Logout */}
          <div className="flex items-center gap-4">
             {/* Profile */}
             <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-full border-2 border-gray-100 shadow-sm">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
                  <span className="text-xs text-gray-400 font-medium">{userDisplay.subtitle}</span>
                </div>
                
                <div className="flex items-center gap-3">
                   {currentUser.role === 'student' && (
                     <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                       <Star className="w-4 h-4 text-yellow-500 fill-current" />
                       <span className="text-sm font-bold text-yellow-700">128</span>
                     </div>
                   )}
                   <div className={`w-10 h-10 ${currentUser.avatarColor || 'bg-math-blue'} rounded-full flex items-center justify-center text-white border-2 border-white shadow-md`}>
                     {currentUser.role === 'teacher' ? <GraduationCap className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                   </div>
                </div>
             </div>

             {/* Logout Button */}
             <button 
               onClick={onLogout}
               className="bg-red-50 hover:bg-red-100 p-2 rounded-full text-red-400 hover:text-red-500 transition-colors"
               title="退出登录"
             >
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Welcome Hero & Controls */}
        <div className="mb-8 flex flex-col xl:flex-row items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center xl:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-math-blue mb-2 font-comic">
              欢迎回来，{currentUser.name}！ 👋
            </h2>
            <p className="text-gray-500 font-medium text-lg">{userDisplay.welcome}</p>
          </motion.div>

          {/* Teacher Controls: Only visible when role is teacher */}
          <AnimatePresence>
            {currentUser.role === 'teacher' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col sm:flex-row gap-4 items-center"
              >
                 {/* Semester Toggle */}
                 <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 flex">
                   <button
                     onClick={() => setActiveSemester(1)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeSemester === 1 ? 'bg-math-yellow text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <BookOpen className="w-4 h-4" /> 上册
                   </button>
                   <button
                     onClick={() => setActiveSemester(2)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeSemester === 2 ? 'bg-math-yellow text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <BookOpen className="w-4 h-4" /> 下册
                   </button>
                 </div>

                 {/* Grade Selector */}
                 <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex overflow-x-auto max-w-full">
                   {[1, 2, 3, 4].map((grade) => (
                     <button
                       key={grade}
                       onClick={() => setActiveGrade(grade)}
                       className={`
                         px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                         ${activeGrade === grade 
                           ? 'bg-math-blue text-white shadow-md scale-105' 
                           : 'text-gray-400 hover:text-math-blue hover:bg-gray-50'}
                       `}
                     >
                       {grade} 年级
                     </button>
                   ))}
                 </div>
              </motion.div>
            )}
            
            {/* Student Badge: Visible when student */}
            {currentUser.role === 'student' && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white px-6 py-3 rounded-2xl border-2 border-math-blue/10 shadow-sm flex items-center gap-3"
               >
                 <div className="bg-blue-100 p-2 rounded-lg text-math-blue">
                   <Target className="w-5 h-5" />
                 </div>
                 <div>
                   <div className="text-xs font-bold text-gray-400 uppercase">当前课程</div>
                   <div className="text-lg font-bold text-gray-800">{activeGrade}年级 ({activeSemester === 1 ? '上' : '下'}册)</div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Curriculum Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeGrade}-${activeSemester}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {curriculumData[activeGrade]?.[activeSemester]?.map((unit, index) => (
              <motion.div
                key={`${activeGrade}-${activeSemester}-${unit.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={unit.status === 'active' ? { scale: 1.05, y: -5 } : {}}
                onClick={() => handleUnitClick(unit)}
                className={`
                  relative p-6 rounded-[2rem] border-b-8 transition-all duration-300 flex flex-col h-48 justify-between shadow-xl
                  ${unit.status === 'active' 
                    ? 'bg-white cursor-pointer hover:shadow-2xl border-gray-200' 
                    : 'bg-gray-50/80 border-gray-200/50 opacity-70 cursor-not-allowed grayscale-[0.3]'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${unit.color} shadow-sm`}>
                    {unit.icon}
                  </div>
                  {unit.status === 'locked' && (
                    <div className="bg-gray-200 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">
                      待解锁
                    </div>
                  )}
                  {unit.status === 'active' && (
                    <div className="bg-green-100 px-2 py-1 rounded-lg text-xs font-bold text-green-600 animate-pulse">
                      进行中
                    </div>
                  )}
                  {unit.status === 'completed' && (
                    <div className="bg-yellow-100 px-2 py-1 rounded-lg text-xs font-bold text-yellow-600">
                      已完成
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-800 mb-1">{unit.title}</h3>
                  <p className="text-sm text-gray-400 font-medium truncate">
                    {unit.desc || `第${unit.id}单元核心课程`}
                  </p>
                </div>

                {unit.status === 'active' && (
                  <div className="absolute bottom-6 right-6 bg-math-blue text-white p-2 rounded-full shadow-lg shadow-indigo-200">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Filler for empty states if needed, or visual balance */}
            {(!curriculumData[activeGrade]?.[activeSemester] || curriculumData[activeGrade]?.[activeSemester]?.length === 0) && (
               <div className="col-span-4 text-center py-20 text-gray-400">
                 <p className="text-xl font-bold">该学期课程内容正在筹备中...</p>
               </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm font-medium">
          © 2024 数学小宇宙 | 依据北师大版小学数学教材设计 | 当前为 {activeGrade} 年级{activeSemester === 1 ? '上册' : '下册'}
        </div>

      </main>
    </div>
  );
};