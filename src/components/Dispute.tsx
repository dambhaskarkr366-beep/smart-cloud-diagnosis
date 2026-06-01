import { ArrowLeft, Play, Maximize2, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { AppScreen } from '../types';

interface DisputeProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export default function Dispute({ onBack, onNavigate }: DisputeProps) {
  const keyframes = [
    { time: '00:12', label: '建立连接', active: false },
    { time: '02:45', label: '权限确认', active: true },
    { time: '05:12', label: '执行修改', active: false },
    { time: '08:30', label: '系统重启', active: false },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">争议处理中心</h1>
          <p className="text-sm text-on-surface-variant">工单编号: #SR-20240512 · 申请时间: 2024-05-13 09:00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Video Evidence */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-black rounded-3xl overflow-hidden aspect-video relative group shadow-2xl">
            <img 
              className="w-full h-full object-cover opacity-60" 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
              alt="Service Recording"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95">
                <Play className="w-10 h-10 fill-white" />
              </button>
            </div>
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-4 text-white mb-4">
                <span className="text-xs font-mono">02:45 / 12:30</span>
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[22%]"></div>
                </div>
                <Maximize2 className="w-4 h-4 cursor-pointer" />
              </div>
              <div className="flex gap-2">
                {keyframes.map((kf, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${kf.active ? 'bg-primary text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                  >
                    {kf.time} {kf.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              争议详情描述
            </h3>
            <div className="space-y-4">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">用户陈述</p>
                <p className="text-sm leading-relaxed">在 02:45 左右，技术员在未充分说明风险的情况下执行了注册表修改，导致我的部分应用授权失效。我希望恢复受损的授权文件或获得相应赔偿。</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-primary uppercase mb-2">系统核查记录</p>
                <p className="text-sm leading-relaxed text-blue-900">记录显示在 02:44 发送了 R2 级风险确认请求，用户于 02:45 点击了“同意并继续”。修改项符合标准修复流程。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status & Appeal */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold mb-6">处理进度</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-container"></div>
              
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-primary/10">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-bold">争议受理中</p>
                <p className="text-xs text-on-surface-variant mt-1">2024-05-13 09:05</p>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">专员正在调取服务录像与系统日志进行人工核实，预计 24 小时内给出初步结论。</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-bold text-on-surface-variant">初步结论</p>
                <p className="text-xs text-on-surface-variant mt-1">等待中...</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm font-bold text-on-surface-variant">最终裁定</p>
                <p className="text-xs text-on-surface-variant mt-1">等待中...</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-high rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-4">补充证据</h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">如果您有额外的截图、视频或第三方检测报告，请在此上传以辅助判定。</p>
            <button className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <Play className="w-5 h-5 rotate-90" />
              </div>
              <span className="text-xs font-bold text-on-surface-variant uppercase">上传补充文件</span>
            </button>
            
            <div className="mt-8 pt-8 border-t border-outline-variant/20">
              <button 
                onClick={onBack}
                className="w-full bg-white text-on-surface font-bold py-4 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-all text-sm mb-3"
              >
                撤销争议申请
              </button>
              <button 
                onClick={() => onNavigate('settings')}
                className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm"
              >
                联系人工客服
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
