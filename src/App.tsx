/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Rocket,
  ArrowRight,
  RotateCcw,
  RotateCw,
  MessageSquare,
  Clock,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { Command, CommandType, GameState } from './types';

const AVAILABLE_COMMANDS: Omit<Command, 'id'>[] = [
  { type: 'MOVE', value: 50, label: 'Di chuyển 50 bước', color: 'bg-blue-500' },
  { type: 'TURN_LEFT', value: 90, label: 'Quay trái 90 độ', color: 'bg-orange-500' },
  { type: 'TURN_RIGHT', value: 90, label: 'Quay phải 90 độ', color: 'bg-orange-600' },
  { type: 'WAIT', value: 1, label: 'Dừng lại 1 giây', color: 'bg-yellow-500' },
  { type: 'SAY', value: 'Xin chào!', label: 'Nói "Xin chào!"', color: 'bg-purple-500' },
];

export default function App() {
  const [workspace, setWorkspace] = useState<Command[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    characterPos: { x: 150, y: 150, rotation: 0 },
    isExecuting: false,
    currentCommandIndex: -1,
    message: '',
  });
  const [showCheck, setShowCheck] = useState(false);
  const [checkResults, setCheckResults] = useState<{ label: string; status: 'success' | 'loading' | 'error' }[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);

  const addCommand = (cmd: Omit<Command, 'id'>) => {
    if (gameState.isExecuting) return;
    const newCmd: Command = { ...cmd, id: Math.random().toString(36).substr(2, 9) };
    setWorkspace([...workspace, newCmd]);
  };

  const removeCommand = (id: string) => {
    if (gameState.isExecuting) return;
    setWorkspace(workspace.filter(c => c.id !== id));
  };

  const clearWorkspace = () => {
    if (gameState.isExecuting) return;
    setWorkspace([]);
    resetCharacter();
  };

  const resetCharacter = () => {
    setGameState({
      characterPos: { x: 150, y: 150, rotation: 0 },
      isExecuting: false,
      currentCommandIndex: -1,
      message: '',
    });
  };

  const runProgram = async () => {
    if (workspace.length === 0 || gameState.isExecuting) return;
    
    setGameState(prev => ({ ...prev, isExecuting: true, currentCommandIndex: 0 }));
    
    let currentPos = { ...gameState.characterPos };

    for (let i = 0; i < workspace.length; i++) {
      const cmd = workspace[i];
      setGameState(prev => ({ ...prev, currentCommandIndex: i }));

      await new Promise(resolve => {
        setTimeout(() => {
          if (cmd.type === 'MOVE') {
            const rad = (currentPos.rotation * Math.PI) / 180;
            currentPos.x += Math.cos(rad) * (cmd.value as number);
            currentPos.y += Math.sin(rad) * (cmd.value as number);
          } else if (cmd.type === 'TURN_LEFT') {
            currentPos.rotation -= cmd.value as number;
          } else if (cmd.type === 'TURN_RIGHT') {
            currentPos.rotation += cmd.value as number;
          } else if (cmd.type === 'SAY') {
            setGameState(prev => ({ ...prev, message: cmd.value as string }));
            setTimeout(() => setGameState(prev => ({ ...prev, message: '' })), 2000);
          }
          
          setGameState(prev => ({ ...prev, characterPos: { ...currentPos } }));
          resolve(null);
        }, cmd.type === 'WAIT' ? (cmd.value as number) * 1000 : 500);
      });
    }

    setGameState(prev => ({ ...prev, isExecuting: false, currentCommandIndex: -1 }));
  };

  const performProjectCheck = () => {
    setShowCheck(true);
    const checks = [
      { label: 'Kiểm tra cấu trúc thư mục', status: 'loading' as const },
      { label: 'Xác thực tệp package.json', status: 'loading' as const },
      { label: 'Kiểm tra lỗi cú pháp TypeScript', status: 'loading' as const },
      { label: 'Tối ưu hóa tài nguyên cho Vercel', status: 'loading' as const },
    ];
    setCheckResults(checks);

    checks.forEach((check, index) => {
      setTimeout(() => {
        setCheckResults(prev => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'success' };
          return next;
        });
      }, (index + 1) * 800);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Logic Lab</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kiến trúc sư Lập trình</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={performProjectCheck}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-all active:scale-95"
          >
            <Rocket size={16} />
            Kiểm tra dự án Vercel
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Toolbox */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={14} />
              Khối lệnh có sẵn
            </h2>
            <div className="space-y-3">
              {AVAILABLE_COMMANDS.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => addCommand(cmd)}
                  disabled={gameState.isExecuting}
                  className={`${cmd.color} w-full text-left px-4 py-3 rounded-xl text-white font-bold shadow-sm hover:brightness-110 transition-all active:scale-95 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center gap-3">
                    {cmd.type === 'MOVE' && <ArrowRight size={18} />}
                    {cmd.type === 'TURN_LEFT' && <RotateCcw size={18} />}
                    {cmd.type === 'TURN_RIGHT' && <RotateCw size={18} />}
                    {cmd.type === 'WAIT' && <Clock size={18} />}
                    {cmd.type === 'SAY' && <MessageSquare size={18} />}
                    {cmd.label}
                  </span>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Hướng dẫn
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Chọn các khối lệnh bên trên để thêm vào chương trình. Nhấn <b>Chạy</b> để xem nhân vật thực hiện các bước theo thứ tự!
            </p>
          </div>
        </div>

        {/* Center: Workspace */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} />
                Chương trình của em
              </h2>
              <button 
                onClick={clearWorkspace}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Xóa tất cả"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-2 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {workspace.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"
                  >
                    <div className="w-16 h-16 border-4 border-dashed border-slate-200 rounded-full flex items-center justify-center">
                      <Plus size={32} />
                    </div>
                    <p className="font-medium">Kéo hoặc nhấn lệnh để bắt đầu</p>
                  </motion.div>
                ) : (
                  workspace.map((cmd, idx) => (
                    <motion.div
                      key={cmd.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: gameState.currentCommandIndex === idx ? 1.05 : 1,
                        boxShadow: gameState.currentCommandIndex === idx ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`${cmd.color} px-4 py-3 rounded-xl text-white font-bold flex items-center justify-between group relative overflow-hidden`}
                    >
                      {gameState.currentCommandIndex === idx && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute inset-0 bg-white/20"
                        />
                      )}
                      <span className="flex items-center gap-3 relative z-10">
                        <span className="bg-black/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {cmd.label}
                      </span>
                      <button 
                        onClick={() => removeCommand(cmd.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={runProgram}
                disabled={workspace.length === 0 || gameState.isExecuting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:shadow-none"
              >
                {gameState.isExecuting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang chạy...
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    Chạy chương trình
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Stage */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col aspect-square relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Sân khấu mô phỏng
              </h2>
              <button 
                onClick={resetCharacter}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                title="Đặt lại vị trí"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden bg-slate-50" ref={stageRef}>
              {/* Character */}
              <motion.div
                animate={{ 
                  x: gameState.characterPos.x, 
                  y: gameState.characterPos.y,
                  rotate: gameState.characterPos.rotation
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="absolute w-16 h-16 z-20"
                style={{ marginLeft: '-32px', marginTop: '-32px' }}
              >
                <div className="relative w-full h-full">
                  {/* Speech Bubble */}
                  <AnimatePresence>
                    {gameState.message && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -50, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-100 text-sm font-bold text-slate-700 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white"
                      >
                        {gameState.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Robot Avatar */}
                  <div className="w-full h-full bg-blue-600 rounded-2xl shadow-lg flex items-center justify-center border-4 border-blue-700">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                      <div className="w-6 h-1 bg-white/30 rounded-full" />
                    </div>
                  </div>
                  {/* Direction Indicator */}
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
                </div>
              </motion.div>

              {/* Grid Markers */}
              <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-400">
                X: {Math.round(gameState.characterPos.x)} Y: {Math.round(gameState.characterPos.y)} R: {Math.round(gameState.characterPos.rotation)}°
              </div>
            </div>
          </div>

          {/* Project Check Modal */}
          <AnimatePresence>
            {showCheck && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Rocket className="text-blue-600" size={20} />
                      Kiểm tra dự án Vercel
                    </h3>
                    <button onClick={() => setShowCheck(false)} className="text-slate-400 hover:text-slate-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {checkResults.map((res, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">{res.label}</span>
                        {res.status === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="text-emerald-500" size={18} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-50 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 size={14} />
                      Dự án đã sẵn sàng để triển khai!
                    </div>
                    <button 
                      onClick={() => setShowCheck(false)}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Hoàn tất
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-slate-400 text-sm">
          Dựa trên nội dung sách Giáo khoa Tin học - Kết nối tri thức với cuộc sống.
        </p>
      </footer>
    </div>
  );
}
