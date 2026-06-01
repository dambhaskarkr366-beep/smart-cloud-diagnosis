import { useState } from 'react';
import { Send, Headset, Activity, History, AlertTriangle, MoreHorizontal, Play, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SessionProps {
  onNext: () => void;
}

export default function Session({ onNext }: SessionProps) {
  const [showRiskAlert, setShowRiskAlert] = useState(true);

  return (
    <div className="p-4 md:p-8 overflow-y-auto relative bg-surface-container-low min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Status */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary text-xs font-bold tracking-widest uppercase">智维云诊远程服务中</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">远程诊断会话: #SR-20240512</h1>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">当前状态</span>
              <span className="text-sm font-semibold text-primary">技术员已接入</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">当前阶段</span>
              <span className="text-sm font-semibold">系统内核分析</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Live Chat & Phase (Left/Top) */}
          <div className="md:col-span-8 space-y-6">
            {/* Chat Window */}
            <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-outline-variant/20 h-[500px]">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-bright">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">高级技术专家: 张工</p>
                    <p className="text-[10px] text-on-surface-variant">工号: TECH-9527</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">连接稳定</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" alt="Tech" referrerPolicy="no-referrer" />
                  </div>
                  <div className="bg-surface-container-low rounded-2xl rounded-tl-none p-4">
                    <p className="text-sm leading-relaxed">您好，我是技术专家张工。已经完成初步硬件扫描，现在需要深入分析系统驱动与内核日志。请保持电脑运行且不要断开网络。</p>
                    <span className="text-[10px] text-on-surface-variant mt-2 block">10:15</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-medium">
                    系统正在收集 驱动程序加载项 信息... (78%)
                  </div>
                </div>

                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" alt="Tech" referrerPolicy="no-referrer" />
                  </div>
                  <div className="bg-surface-container-low rounded-2xl rounded-tl-none p-4">
                    <p className="text-sm leading-relaxed">在分析中发现引导项异常，我需要对 <span className="font-mono bg-white/50 px-1 rounded">System Registry</span> 进行部分修改以修复冲突。这属于 R2 级风险操作，请您确认。</p>
                    <span className="text-[10px] text-on-surface-variant mt-2 block">10:22</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/10">
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 border border-outline-variant/30">
                  <input className="flex-1 border-none focus:ring-0 text-sm bg-transparent" placeholder="回复技术员..." type="text" />
                  <button className="text-primary"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {/* Current Phase Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  当前阶段进度
                </h3>
                <span className="text-primary font-mono text-lg font-bold">45%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-primary h-full w-[45%] rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">执行动作</p>
                  <p className="text-sm font-semibold">内核分析与注册表扫描</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">剩余预计时间</p>
                  <p className="text-sm font-semibold">约 12 分钟</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Alerts (Right/Bottom) */}
          <div className="md:col-span-4 space-y-6">
            {showRiskAlert && (
              <div className="bg-orange-100 rounded-2xl p-6 shadow-xl ring-2 ring-orange-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <AlertTriangle className="w-24 h-24 text-orange-900" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">R2 级</span>
                  <h3 className="text-orange-900 font-bold">风险操作确认</h3>
                </div>
                <p className="text-sm text-orange-800 mb-6 leading-relaxed">
                  技术员请求修改系统注册表项以修复引导异常。
                  <br/><span className="text-xs mt-2 block opacity-80 italic">注意：此操作可能会导致系统重启。</span>
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={onNext}
                    className="w-full bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 active:scale-95 transition-transform"
                  >
                    同意并继续
                  </button>
                  <button 
                    onClick={() => setShowRiskAlert(false)}
                    className="w-full bg-white/50 text-orange-900 py-2 rounded-xl text-sm font-semibold hover:bg-white/80 transition-colors"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Logs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-on-surface-variant" />
                服务日志
              </h3>
              <div className="space-y-6 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-surface-container"></div>
                
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-primary uppercase">10:22</span>
                    <span className="bg-primary/5 text-primary text-[8px] px-1.5 py-0.5 rounded font-bold">进行中</span>
                  </div>
                  <p className="text-xs font-semibold">请求注册表修改权限</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">触发 R2 级风险管控协议</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">10:15</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">技术员 张工 已接入</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">建立远程加密隧道</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">10:10</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">AI 智能诊断完成</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">初步判定：引导扇区配置错误</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
