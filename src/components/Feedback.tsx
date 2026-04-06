import { CheckCircle, FileText, Brain, Wrench, ShieldCheck, Info, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AppScreen } from '../types';

interface FeedbackProps {
  onNext: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export default function Feedback({ onNext, onNavigate }: FeedbackProps) {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Confirmation Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">服务已完成</h1>
        <p className="text-on-surface-variant text-lg">您的设备问题已成功修复，请对本次服务进行评价</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Service Summary */}
        <div className="md:col-span-7 space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">服务摘要</h2>
            </div>
            
            <div className="space-y-6 relative">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center z-10">
                    <Brain className="w-4 h-4 text-tertiary" />
                  </div>
                  <div className="w-0.5 h-full bg-surface-container-high -mt-1 mb-1"></div>
                </div>
                <div className="pb-6">
                  <h3 className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">故障根因 (Root Cause)</h3>
                  <p className="text-on-surface leading-relaxed">系统检测到主板南桥芯片组电容老化导致供电不稳定，触发了内核保护性宕机。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center z-10">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div className="w-0.5 h-full bg-surface-container-high -mt-1 mb-1"></div>
                </div>
                <div className="pb-6">
                  <h3 className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">处理方案 (Treatment)</h3>
                  <p className="text-on-surface leading-relaxed">更换了原厂级电容组件，并同步升级了 B.0.4 稳定版固件以优化电压调节算法。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center z-10">
                    <ShieldCheck className="w-4 h-4 text-green-700" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">验证状态 (Verification)</h3>
                  <p className="text-on-surface leading-relaxed">通过 48 小时压力测试，系统各项指标正常，功耗降低 12%，稳定性达成 100%。</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-surface-container-low rounded-xl p-5 flex items-start gap-4">
            <Info className="w-6 h-6 text-secondary" />
            <div>
              <h4 className="font-semibold text-sm text-on-surface">专家建议</h4>
              <p className="text-xs text-on-surface-variant mt-1">建议定期进行灰尘清理，避免环境湿度过高导致的元器件氧化。下次维护建议：2024年10月。</p>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Form */}
        <div className="md:col-span-5">
          <section className="bg-white rounded-xl p-8 shadow-lg border border-outline-variant/20 sticky top-24">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">满意度打分</h2>
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-8 h-8 text-tertiary fill-tertiary cursor-pointer hover:scale-110 transition-transform" />
                ))}
              </div>
              <p className="text-sm text-tertiary font-medium mt-2">极其满意</p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-3 text-on-surface">多维评价标签</p>
                <div className="flex flex-wrap gap-2">
                  {['技术精湛', '效率极高', '沟通顺畅', '方案专业', '准时到达'].map((tag) => (
                    <button key={tag} className="px-4 py-2 bg-primary/5 text-primary rounded-full text-xs font-medium border border-primary/10 hover:bg-primary hover:text-white transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <label className="text-sm font-semibold mb-2 block">额外反馈 (选填)</label>
                <textarea 
                  className="w-full bg-surface-container-low rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-primary/20 min-h-[100px] placeholder:text-outline-variant" 
                  placeholder="说点什么吧...您的建议是我们进步的动力"
                ></textarea>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={onNext}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-sm"
                >
                  提交评价
                </button>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="w-full bg-white text-on-surface font-semibold py-4 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-all text-sm"
                >
                  返回首页
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
