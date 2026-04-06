import { RefreshCw, Clock, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import type { AppScreen } from '../types';

interface QueueStatusProps {
  onNext: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export default function QueueStatus({ onNext, onNavigate }: QueueStatusProps) {
  return (
    <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
      {/* Queue Progress Header */}
      <section className="mb-8">
        <div className="bg-primary-container rounded-3xl p-8 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium opacity-90">正在匹配技术员</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">当前排队第3位</h1>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 inline-flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">预计等待 5 分钟</span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        </div>
      </section>

      {/* Bento Grid AI Results */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Question Summary */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-blue-700 font-bold">#</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">问题摘要</h2>
          </div>
          <div className="space-y-4">
            <p className="text-on-surface-variant leading-relaxed">
              基于上传的系统日志与硬件监控数据分析，系统检测到设备在运行高负载应用时 CPU 温度异常升高（最高达 98°C）。初步判定为**散热模组效能下降**，伴随核心频率大幅波动（降频保护）。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface-variant">#散热异常</span>
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface-variant">#CPU过热</span>
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface-variant">#三级预警</span>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="md:col-span-4 bg-tertiary rounded-3xl p-8 text-white">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">风险提示</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed mb-6">
            当前状态如继续满负荷运行，系统预测 4 小时内发生硬件过热保护性关机的概率为 85%。
          </p>
          <div className="bg-white/20 rounded-2xl p-4 text-[11px] font-bold">
            ⚠️ 建议立即清理风扇积灰或更换导热硅脂。
          </div>
        </div>

        {/* Probabilities Section */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low rounded-3xl p-8 border border-transparent hover:border-primary/30 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">可能原因 (高概率)</h3>
              <span className="text-2xl font-black text-primary opacity-20">85%</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary"></div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">散热模组积灰严重</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">散热鳍片被灰尘堵塞，导致热交换效率大幅下降，热量无法及时排出机壳。</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 border border-transparent hover:border-outline-variant transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">可能原因 (中概率)</h3>
              <span className="text-2xl font-black text-secondary opacity-30">35%</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-secondary"></div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">导热硅脂干裂失效</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">CPU 表面导热硅脂由于长时间高温作业导致硬化干裂，无法填补微型缝隙，引发传热受阻。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Actions */}
      <div className="mt-12 flex flex-col md:flex-row gap-4 items-center justify-center">
        <button 
          onClick={onNext}
          className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          继续匹配技术员
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="w-full md:w-auto px-10 py-4 bg-white border border-outline-variant text-on-surface rounded-full font-bold text-sm hover:bg-slate-50 transition-all"
        >
          仅获取AI报告并退出
        </button>
      </div>

      {/* Decorative Image */}
      <div className="mt-16 rounded-3xl overflow-hidden aspect-[21/9]">
        <img 
          className="w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070" 
          alt="AI Diagnostics"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
