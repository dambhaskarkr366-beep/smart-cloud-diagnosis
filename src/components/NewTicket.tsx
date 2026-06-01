import { useState } from 'react';
import { ShieldCheck, Info, Lightbulb, AlertTriangle, Check, Zap, Camera, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewTicketProps {
  onNext: () => void;
  onBack: () => void;
}

export default function NewTicket({ onNext, onBack }: NewTicketProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Side: Problem Input */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        {/* Progress Section */}
        <section className="bg-surface-container-low p-6 rounded-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-medium text-primary">问题描述</h2>
              <p className="text-on-surface-variant text-sm mt-1">请详细描述您遇到的系统异常情况</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary">完整度进度 65%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[65%] transition-all duration-500"></div>
          </div>
        </section>

        {/* Natural Language Input */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="space-y-6">
            <div className="relative">
              <label className="text-xs font-semibold tracking-wider text-primary uppercase mb-2 block">症状详述</label>
              <textarea 
                className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary transition-all p-4 rounded-t-lg outline-none min-h-[120px] resize-none text-on-surface placeholder:text-slate-400" 
                placeholder="请用自然语言描述，例如：'系统在启动高负载任务时出现蓝屏，伴随风扇异响...'"
              ></textarea>
            </div>

            {/* Dynamic Follow-up Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase block">何时开始</label>
                <input className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-3 rounded-t-lg outline-none transition-all" type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase block">错误代码 (如有)</label>
                <input className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-3 rounded-t-lg outline-none transition-all" placeholder="例如: 0x0000007B" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase block">复现频率</label>
                <select className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-3 rounded-t-lg outline-none transition-all">
                  <option>始终复现</option>
                  <option>偶尔出现</option>
                  <option>仅特定操作后出现</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase block">影响范围</label>
                <select className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-3 rounded-t-lg outline-none transition-all">
                  <option>核心业务中断</option>
                  <option>局部功能异常</option>
                  <option>仅界面显示问题</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Attachment Grid */}
        <div className="grid grid-cols-3 gap-4 h-48">
          <div className="col-span-2 bg-slate-200 rounded-xl overflow-hidden relative group cursor-pointer border border-outline-variant/20">
            <img 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
              src="https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=2070" 
              alt="Diagnostic Dashboard"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" /> 上传异常截图
              </span>
            </div>
          </div>
          <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-primary/10 transition-colors group cursor-pointer">
            <PlusCircle className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-primary uppercase text-center">添加日志文件</span>
          </div>
        </div>
      </div>

      {/* Right Side: Authorization */}
      <aside className="lg:col-span-5 flex flex-col gap-6">
        <section className="bg-surface-container-high rounded-2xl p-8 sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-tertiary" />
            <h3 className="text-lg font-bold text-on-surface">授权说明与合规告知</h3>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-xl bg-white">
              <div className="bg-blue-50 p-2 rounded-lg h-fit">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-1">采集项说明</h4>
                <p className="text-xs leading-relaxed text-on-surface-variant">我们将采集系统日志、硬件序列号、运行快照及相关性能指标。采集过程经过端到端加密。</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white">
              <div className="bg-blue-50 p-2 rounded-lg h-fit">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-1">用途说明</h4>
                <p className="text-xs leading-relaxed text-on-surface-variant">数据仅用于本次故障诊断与专家建议生成。不会用于商业营销或第三方数据分发。</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white">
              <div className="bg-orange-50 p-2 rounded-lg h-fit">
                <AlertTriangle className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-tertiary mb-1">风险说明</h4>
                <p className="text-xs leading-relaxed text-on-surface-variant">深度扫描期间可能会有短暂的系统响应延迟（&lt;200ms）。请确保重要业务已进行非实时同步。</p>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/30">
              <label className="flex items-start gap-3 cursor-pointer group mb-6">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded focus:ring-0 checked:bg-primary checked:border-primary transition-all" 
                  />
                  <Check className="absolute text-white w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-xs text-on-surface-variant leading-normal select-none">
                  我已阅读并同意 <a className="text-primary font-semibold underline underline-offset-4" href="#">《数据采集授权协议》</a> 及 <a className="text-primary font-semibold underline underline-offset-4" href="#">《隐私政策说明》</a>，授权智维云诊进行深度系统诊断。
                </span>
              </label>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={!agreed}
                  onClick={onNext}
                  className={cn(
                    "w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all",
                    agreed 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95" 
                      : "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                  )}
                >
                  <span>同意授权并开始</span>
                  <Zap className="w-4 h-4" />
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-3 bg-white text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                  取消并返回
                </button>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
