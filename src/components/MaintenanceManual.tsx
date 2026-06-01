import { Book, Search, FileText, ChevronRight, Star, Clock, ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AppScreen } from '../types';

interface MaintenanceManualProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function MaintenanceManual({ onNavigate }: MaintenanceManualProps) {
  const categories = [
    { title: '硬件拆解与组装', count: 45, icon: FileText },
    { title: '系统故障排查', count: 128, icon: Book },
    { title: '驱动与固件更新', count: 62, icon: FileText },
    { title: '性能优化指南', count: 34, icon: FileText },
  ];

  const recentGuides = [
    {
      title: 'Nexus-7 高性能主机清灰与硅脂更换图解',
      category: '硬件维护',
      time: '2024-05-10',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Windows 11 系统内核隔离导致的游戏掉帧修复',
      category: '系统优化',
      time: '2024-05-08',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'NVMe 固态硬盘健康度检测与寿命预警分析',
      category: '存储维护',
      time: '2024-05-05',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1597872200370-499dee469516?auto=format&fit=crop&q=80&w=400'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-on-surface">维修手册</h1>
            <p className="text-on-surface-variant mt-1">权威的 PC 硬件维修与系统故障排查技术文档</p>
          </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="搜索维修方案、错误代码..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant/30 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </header>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-outline-variant/10 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <cat.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-on-surface">{cat.title}</h3>
            <p className="text-xs text-on-surface-variant mt-1">{cat.count} 篇专业文档</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Featured Guides */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-tertiary fill-tertiary" />
            精选维护指南
          </h2>
          <div className="space-y-4">
            {recentGuides.map((guide, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 flex flex-col md:flex-row hover:shadow-md transition-all group cursor-pointer">
                <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                  <img 
                    src={guide.image} 
                    alt={guide.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">{guide.category}</span>
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {guide.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">{guide.title}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("w-3 h-3", s <= Math.floor(guide.rating) ? "text-tertiary fill-tertiary" : "text-surface-container-highest")} />
                      ))}
                      <span className="text-xs font-bold ml-1">{guide.rating}</span>
                    </div>
                    <button className="text-primary text-sm font-bold flex items-center gap-1">
                      阅读全文 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Quick Tools & Tags */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-high rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6">快速工具</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                  <span className="text-sm font-bold">我的收藏</span>
                </div>
                <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-bold">12</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                  <span className="text-sm font-bold">分享技术文档</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10">
            <h3 className="text-lg font-bold mb-4">热门标签</h3>
            <div className="flex flex-wrap gap-2">
              {['蓝屏排查', '显卡超频', '内存超频', '散热优化', 'BIOS更新', '固态硬盘', '电源选购', '风道设计'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-surface-container-low text-on-surface-variant rounded-full text-xs font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
