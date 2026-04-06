import { Package, Search, Filter, ShoppingCart, ArrowRight, CheckCircle2, AlertCircle, Cpu, HardDrive, Monitor, Zap, Fan, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AppScreen } from '../types';

interface SparePartsProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function SpareParts({ onNavigate }: SparePartsProps) {
  const parts = [
    {
      id: 'P001',
      name: 'Intel Core i9-14900K',
      category: '处理器',
      stock: 12,
      price: '4,599',
      status: '现货',
      specs: '24 Cores / 32 Threads, 6.0GHz Turbo',
      icon: Cpu
    },
    {
      id: 'P002',
      name: 'NVIDIA GeForce RTX 4090',
      category: '显卡',
      stock: 3,
      price: '15,999',
      status: '库存紧张',
      specs: '24GB GDDR6X, DLSS 3.5 Support',
      icon: Zap
    },
    {
      id: 'P003',
      name: 'Samsung 990 Pro 2TB',
      category: '存储',
      stock: 45,
      price: '1,299',
      status: '现货',
      specs: 'NVMe Gen4, 7450MB/s Read',
      icon: HardDrive
    },
    {
      id: 'P004',
      name: 'Corsair Dominator 64GB DDR5',
      category: '内存',
      stock: 28,
      price: '2,499',
      status: '现货',
      specs: '6000MHz, CL30, RGB Lighting',
      icon: Package
    },
    {
      id: 'P005',
      name: 'Noctua NH-D15 chromax.black',
      category: '散热',
      stock: 15,
      price: '899',
      status: '现货',
      specs: 'Dual-Tower, 140mm Premium Fans',
      icon: Fan
    },
    {
      id: 'P006',
      name: 'ASUS ROG Swift PG32UCDM',
      category: '显示器',
      stock: 0,
      price: '10,999',
      status: '缺货',
      specs: '32" 4K OLED, 240Hz, 0.03ms',
      icon: Monitor
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-on-surface">备件商城</h1>
            <p className="text-on-surface-variant mt-1">官方原厂备件，品质保障，专业安装支持</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="搜索硬件、外设、升级包..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant/30 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">在售商品</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">156</span>
            <span className="text-xs text-success font-bold mb-1">款</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">限时特惠</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">12</span>
            <span className="text-xs text-on-surface-variant mb-1">项活动</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">累计销量</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">2,840</span>
            <span className="text-xs text-on-surface-variant mb-1">单</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">我的订单</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">2</span>
            <span className="text-xs text-on-surface-variant mb-1">进行中</span>
          </div>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => (
          <div key={part.id} className="bg-white rounded-3xl border border-outline-variant/10 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  part.status === '缺货' ? "bg-error/5 text-error" : "bg-primary/5 text-primary"
                )}>
                  <part.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  part.status === '现货' ? "bg-success/10 text-success" : 
                  part.status === '库存紧张' ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
                )}>
                  {part.status}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{part.category}</p>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{part.name}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{part.specs}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">售价</p>
                  <p className="text-xl font-bold text-on-surface">¥{part.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">剩余</p>
                  <p className={cn("text-xl font-bold", part.stock === 0 ? "text-error" : "text-on-surface")}>{part.stock}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between">
              <button className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors">
                商品详情 <ArrowRight className="w-3 h-3" />
              </button>
              <button 
                disabled={part.stock === 0}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                  part.stock === 0 
                    ? "bg-surface-container text-on-surface-variant cursor-not-allowed" 
                    : "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md"
                )}
              >
                <ShoppingCart className="w-3 h-3" /> 立即购买
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
