import { BookOpen, Search, Filter, Book, FileText, HelpCircle, ChevronRight, Star, Download, ExternalLink, ArrowLeft } from 'lucide-react';
import type { AppScreen } from '../types';

interface KnowledgeBaseProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function KnowledgeBase({ onNavigate }: KnowledgeBaseProps) {
  const categories = [
    { name: '系统维护', count: 124, icon: BookOpen, color: 'bg-blue-50 text-primary' },
    { name: '硬件手册', count: 86, icon: Book, color: 'bg-orange-50 text-tertiary' },
    { name: '常见问题', count: 215, icon: HelpCircle, color: 'bg-emerald-50 text-emerald-700' },
    { name: '安全合规', count: 42, icon: FileText, color: 'bg-purple-50 text-purple-700' },
  ];

  const popularArticles = [
    { title: 'Nexus-7 高性能主机引导异常排查指南', category: '系统维护', views: '1.2k', rating: 4.8 },
    { title: '无线路由器 R-12 固件升级注意事项 (2024版)', category: '硬件手册', views: '856', rating: 4.9 },
    { title: '如何处理大型游戏运行时的内存溢出', category: '常见问题', views: '2.1k', rating: 4.7 },
    { title: '智维云诊数据采集与隐私保护白皮书', category: '安全合规', views: '432', rating: 5.0 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="relative rounded-[3rem] overflow-hidden min-h-[320px] flex items-center shadow-lg">
        <img 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2070" 
          alt="Knowledge Base"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/60 to-transparent"></div>
        <div className="relative z-10 p-12 max-w-2xl">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="mb-6 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            知识库中心
          </h1>
          <p className="text-blue-100 text-lg mb-8 opacity-90 leading-relaxed max-w-lg">
            汇集全球顶尖专家的维护经验，为您提供最权威的系统诊断与修复指南。
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="搜索手册、故障代码或解决方案..." 
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl text-on-surface shadow-xl focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
            <p className="text-sm text-on-surface-variant">{cat.count} 篇文档</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Popular Articles */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">热门文档</h2>
              <p className="text-sm text-on-surface-variant mt-1">社区最常引用的技术指南</p>
            </div>
            <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {popularArticles.map((art, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{art.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{art.category}</span>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <Star className="w-3 h-3 text-tertiary fill-tertiary" />
                        <span className="font-bold">{art.rating}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{art.views} 次阅读</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links & Resources */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold mb-6">快速资源</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                  <span className="text-sm font-bold">离线手册包 (v2.4)</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                  <span className="text-sm font-bold">故障代码速查表</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                  <span className="text-sm font-bold">社区专家论坛</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-tertiary rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('new-ticket')}>
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <HelpCircle className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">没找到答案？</h3>
            <p className="text-xs opacity-80 mb-6 relative z-10 leading-relaxed">我们的 AI 助手可以为您提供实时的技术支持，或者为您转接人工专家。</p>
            <button className="bg-white text-tertiary px-6 py-3 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all relative z-10">
              咨询 AI 助手
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
