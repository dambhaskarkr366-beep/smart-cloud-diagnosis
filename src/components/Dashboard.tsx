import { PlayCircle, Zap, Settings, MemoryStick as Memory, Code, Router, ArrowRight } from 'lucide-react';
import type { AppScreen } from '../types';

interface DashboardProps {
  onStartDiagnosis: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export default function Dashboard({ onStartDiagnosis, onNavigate }: DashboardProps) {
  const modules = [
    {
      title: '系统核心诊断',
      desc: '分析系统日志、优化注册表配置与底层驱动兼容性检测',
      icon: Settings,
      color: 'bg-blue-50 text-primary',
      hoverColor: 'group-hover:bg-primary group-hover:text-white'
    },
    {
      title: '硬件健康检测',
      desc: '硬件压力测试、硬盘健康评估及内部清灰维护排查',
      icon: Memory,
      color: 'bg-orange-50 text-tertiary',
      hoverColor: 'group-hover:bg-tertiary group-hover:text-white'
    },
    {
      title: '软件维护更新',
      desc: 'BIOS/固件版本同步、应用层冲突热修复与安全补丁',
      icon: Code,
      color: 'bg-blue-50 text-primary',
      hoverColor: 'group-hover:bg-primary group-hover:text-white'
    },
    {
      title: '网络链路监测',
      desc: '网络带宽吞吐压测、延迟波动分析及无线信号优化',
      icon: Router,
      color: 'bg-emerald-50 text-emerald-700',
      hoverColor: 'group-hover:bg-emerald-600 group-hover:text-white'
    }
  ];

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto">
      {/* Active Ticket Status */}
      <section className="mb-8">
        <div className="bg-primary rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase">进行中</span>
                <h2 className="text-lg font-bold">当前工单状态</h2>
              </div>
              <p className="text-blue-100 text-sm font-medium">主站服务器延迟抖动诊断 · <span className="opacity-80">预计还需 15 分钟</span></p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <button 
              onClick={() => onNavigate('session')}
              className="flex-1 md:flex-none bg-white text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            >
              查看实时进程
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative rounded-[2rem] overflow-hidden min-h-[440px] flex items-center shadow-lg mb-16">
        <img 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
          alt="Tech Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/60 to-transparent"></div>
        <div className="relative z-10 p-8 md:p-16 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            智能诊断，<br/>让维护更简单。
          </h1>
          <p className="text-blue-100 text-lg mb-8 opacity-90 leading-relaxed max-w-lg">
            利用 Nexus AI 核心算法进行全方位的云端扫描，实时定位系统性风险，为您提供专家级的精准维护方案。
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStartDiagnosis}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-3 active:scale-95 shadow-lg"
            >
              <PlayCircle className="w-6 h-6" />
              开始快速诊断
            </button>
            <button 
              onClick={() => onNavigate('new-ticket')}
              className="bg-tertiary text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center gap-3 active:scale-95 shadow-lg"
            >
              <Zap className="w-6 h-6" />
              紧急救助
            </button>
          </div>
        </div>
      </section>

      {/* Service Modules */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">服务模块</h2>
            <p className="text-sm text-on-surface-variant mt-1">选择特定领域进行深度检测与优化</p>
          </div>
          <button 
            onClick={() => onNavigate('knowledge')}
            className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
          >
            全部模块 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, idx) => (
            <div 
              key={idx}
              onClick={onStartDiagnosis}
              className="group bg-white p-8 rounded-[2rem] border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-14 h-14 ${mod.color} rounded-2xl flex items-center justify-center mb-6 ${mod.hoverColor} transition-colors`}>
                <mod.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
