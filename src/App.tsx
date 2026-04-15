import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench, 
  BookOpen, 
  ShieldAlert, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Bell,
  UserCircle,
  Search,
  Headset,
  Package,
  CalendarCheck
} from 'lucide-react';
import { cn } from './lib/utils';
import type { AppScreen } from './types';

// Screens
import Dashboard from './components/Dashboard';
import NewTicket from './components/NewTicket';
import QueueStatus from './components/QueueStatus';
import Session from './components/Session';
import Feedback from './components/Feedback';
import Dispute from './components/Dispute';
import KnowledgeBase from './components/KnowledgeBase';
import RiskControl from './components/RiskControl';
import SettingsScreen from './components/Settings';
import MaintenanceManual from './components/MaintenanceManual';
import SpareParts from './components/SpareParts';
import VoiceSchedule from './components/VoiceSchedule';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'new-ticket', label: '工单管理', icon: ClipboardList },
    { id: 'manual', label: '维修手册', icon: BookOpen },
    { id: 'spare-parts', label: '备件商城', icon: Package },
    { id: 'knowledge', label: '知识库', icon: BookOpen },
    { id: 'risk', label: '风险管控', icon: ShieldAlert },
    { id: 'voice-schedule', label: '语音日程', icon: CalendarCheck },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard onStartDiagnosis={() => setScreen('new-ticket')} onNavigate={setScreen} />;
      case 'new-ticket': return <NewTicket onNext={() => setScreen('queue')} onBack={() => setScreen('dashboard')} />;
      case 'queue': return <QueueStatus onNext={() => setScreen('session')} onNavigate={setScreen} />;
      case 'session': return <Session onNext={() => setScreen('feedback')} />;
      case 'feedback': return <Feedback onNext={() => setScreen('dispute')} onNavigate={setScreen} />;
      case 'dispute': return <Dispute onBack={() => setScreen('dashboard')} onNavigate={setScreen} />;
      case 'knowledge': return <KnowledgeBase onNavigate={setScreen} />;
      case 'risk': return <RiskControl onNavigate={setScreen} />;
      case 'settings': return <SettingsScreen onNavigate={setScreen} />;
      case 'manual': return <MaintenanceManual onNavigate={setScreen} />;
      case 'spare-parts': return <SpareParts onNavigate={setScreen} />;
      case 'voice-schedule': return <VoiceSchedule onNavigate={() => setScreen('dashboard')} />;
      default: return <Dashboard onStartDiagnosis={() => setScreen('new-ticket')} onNavigate={setScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-outline-variant/20 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-primary tracking-tight">智维云诊</span>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setScreen('dashboard')}
              className={cn(
                "text-sm font-medium transition-colors pb-1 border-b-2",
                screen === 'dashboard' ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              核心诊断
            </button>
            <button 
              onClick={() => setScreen('manual')}
              className={cn(
                "text-sm font-medium transition-colors pb-1 border-b-2",
                screen === 'manual' ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              维修手册
            </button>
            <button 
              onClick={() => setScreen('spare-parts')}
              className={cn(
                "text-sm font-medium transition-colors pb-1 border-b-2",
                screen === 'spare-parts' ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              备件商城
            </button>
            <button 
              onClick={() => setScreen('voice-schedule')}
              className={cn(
                "text-sm font-medium transition-colors pb-1 border-b-2",
                screen === 'voice-schedule' ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
              )}
            >
              语音日程
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="搜索常见问题..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 ml-2"
            />
          </div>
          <button 
            onClick={() => setScreen('settings')}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setScreen('settings')}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          >
            <UserCircle className="w-5 h-5" />
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
            <Headset className="w-4 h-4" />
            联系客服
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 bottom-0 bg-surface-dim border-r border-outline-variant/20 transition-all duration-300 z-40 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <Wrench className="w-6 h-6" />
              </div>
              {isSidebarOpen && (
                <div>
                  <h2 className="text-sm font-black text-primary">智维云诊</h2>
                  <p className="text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase">高级诊断专家系统</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id as AppScreen)}
                className={cn(
                  "w-full flex items-center px-4 py-3 rounded-lg transition-all group",
                  screen === item.id 
                    ? "bg-primary/10 text-primary border-r-4 border-primary" 
                    : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5", isSidebarOpen && "mr-3")} />
                {isSidebarOpen && <span className="text-xs font-semibold tracking-wider uppercase">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto space-y-4">
            <button 
              onClick={() => setScreen('new-ticket')}
              className={cn(
                "w-full bg-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95",
                !isSidebarOpen && "px-0"
              )}
            >
              <Plus className="w-4 h-4" />
              {isSidebarOpen && "新建工单"}
            </button>
            
            {isSidebarOpen && (
              <div className="space-y-1">
                <button 
                  onClick={() => setScreen('knowledge')}
                  className="w-full flex items-center px-4 py-2 text-on-surface-variant hover:text-primary transition-all"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  <span className="text-xs font-semibold tracking-wider">帮助文档</span>
                </button>
                <button 
                  onClick={() => setScreen('dashboard')}
                  className="w-full flex items-center px-4 py-2 text-on-surface-variant hover:text-primary transition-all"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="text-xs font-semibold tracking-wider">注销</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
