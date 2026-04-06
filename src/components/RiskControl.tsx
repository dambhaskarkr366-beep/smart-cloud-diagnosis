import { ShieldAlert, AlertTriangle, ShieldCheck, Activity, BarChart3, Lock, Eye, ChevronRight, MoreVertical, Search, Filter, ArrowLeft } from 'lucide-react';
import type { AppScreen } from '../types';

interface RiskControlProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function RiskControl({ onNavigate }: RiskControlProps) {
  const risks = [
    { title: '多任务运行下的内存溢出风险', level: '高', status: '预警中', category: '系统稳定性', time: '10:24' },
    { title: '系统安全证书即将过期', level: '中', status: '待处理', category: '安全合规', time: '09:15' },
    { title: '系统后台进程 CPU 占用异常波动', level: '低', status: '监控中', category: '性能负载', time: '08:45' },
  ];

  const metrics = [
    { label: '系统安全评分', value: '92', change: '+2.4%', color: 'text-green-600' },
    { label: '实时风险点', value: '3', change: '-1', color: 'text-orange-600' },
    { label: '合规通过率', value: '100%', change: '0%', color: 'text-primary' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-on-surface">风险管控</h1>
            <p className="text-on-surface-variant mt-1">实时监控系统风险、安全预警及合规状态</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-outline-variant px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-surface-container transition-colors">
            <Filter className="w-4 h-4" /> 筛选
          </button>
          <button className="bg-tertiary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-tertiary/20">
            <ShieldAlert className="w-4 h-4" /> 紧急风险响应
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{metric.label}</span>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {idx === 0 ? <ShieldCheck className="w-5 h-5" /> : idx === 1 ? <AlertTriangle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-extrabold tracking-tight ${metric.color}`}>{metric.value}</span>
              <span className="text-xs font-bold text-on-surface-variant mb-1">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Alerts List */}
        <section className="lg:col-span-8 bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-tertiary">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">实时风险预警</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="搜索风险项..." 
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {risks.map((risk, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 rounded-2xl hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/20">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${risk.level === '高' ? 'bg-orange-100 text-orange-700' : risk.level === '中' ? 'bg-blue-100 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">{risk.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{risk.category}</span>
                      <span className="text-xs text-on-surface-variant">{risk.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">风险等级</p>
                    <p className={`text-sm font-black ${risk.level === '高' ? 'text-orange-600' : risk.level === '中' ? 'text-primary' : 'text-on-surface-variant'}`}>{risk.level}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container">
                    <span className={`w-2 h-2 rounded-full ${risk.status === '预警中' ? 'bg-orange-500 animate-pulse' : 'bg-primary'}`}></span>
                    <span className="text-xs font-bold">{risk.status}</span>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:bg-white rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Overview */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">安全态势感知</h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-surface-container-low rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">网络攻击拦截</span>
                  <span className="text-xs font-bold text-primary">2,415 次/日</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%] rounded-full"></div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">异常流量监测</span>
                  <span className="text-xs font-bold text-tertiary">正常</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[12%] rounded-full"></div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">系统合规扫描</span>
                  <span className="text-xs font-bold text-green-600">100%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full rounded-full"></div>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-surface-container-high rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all group">
              <Eye className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
              查看详细安全报告
            </button>
          </div>

          <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/20">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Lock className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">合规审计中心</h3>
            <p className="text-xs opacity-80 mb-6 relative z-10 leading-relaxed">系统已通过 ISO 27001 与 SOC2 Type II 认证。点击查看最新的合规审计报告。</p>
            <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all relative z-10">
              查看审计详情 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
