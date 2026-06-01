import { Settings, User, Bell, Shield, Globe, Monitor, HelpCircle, ChevronRight, LogOut, Camera, Mail, Phone, Lock, ArrowLeft } from 'lucide-react';
import type { AppScreen } from '../types';

interface SettingsProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsProps) {
  const settingsGroups = [
    {
      title: '个人账户',
      items: [
        { label: '个人资料', icon: User, desc: '修改头像、姓名及基本信息' },
        { label: '账号安全', icon: Shield, desc: '密码修改、双重身份验证 (2FA)' },
        { label: '通知设置', icon: Bell, desc: '邮件、短信及系统推送偏好' },
      ]
    },
    {
      title: '系统偏好',
      items: [
        { label: '语言与地区', icon: Globe, desc: '设置界面语言及本地化格式' },
        { label: '显示设置', icon: Monitor, desc: '深色模式、字体大小及界面布局' },
        { label: '隐私设置', icon: Lock, desc: '管理数据采集授权与隐私偏好' },
      ]
    },
    {
      title: '关于与支持',
      items: [
        { label: '帮助中心', icon: HelpCircle, desc: '常见问题、用户手册及在线支持' },
        { label: '关于智维云诊', icon: Settings, desc: '版本信息、服务协议及隐私政策' },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-on-surface">系统设置</h1>
          <p className="text-on-surface-variant mt-1">管理您的个人账户、系统偏好及安全选项</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <img 
                className="w-24 h-24 rounded-full object-cover border-4 border-surface-container shadow-lg" 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" 
                alt="User Avatar"
                referrerPolicy="no-referrer"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-on-surface">陈工</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">高级系统架构师</p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-xl">
                <Mail className="w-4 h-4" />
                <span>chen.gong@nexus.ai</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-xl">
                <Phone className="w-4 h-4" />
                <span>+86 138 **** 8888</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">存储空间</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-on-surface">已用 4.2 GB</span>
                <span className="text-on-surface-variant">总计 10 GB</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[42%] rounded-full"></div>
              </div>
              <button className="w-full py-3 bg-white rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all">
                升级存储空间
              </button>
            </div>
          </div>
        </aside>

        {/* Settings List */}
        <div className="lg:col-span-8 space-y-12">
          {settingsGroups.map((group, gIdx) => (
            <section key={gIdx}>
              <h2 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-6 px-4">{group.title}</h2>
              <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={iIdx} 
                    className={`w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-all group ${iIdx !== group.items.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.label}</h3>
                        <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          ))}

          <button className="w-full flex items-center justify-center gap-3 p-6 bg-orange-50 text-orange-700 rounded-3xl font-bold hover:bg-orange-100 transition-all shadow-sm border border-orange-100">
            <LogOut className="w-5 h-5" />
            退出当前账号
          </button>
        </div>
      </div>
    </div>
  );
}
