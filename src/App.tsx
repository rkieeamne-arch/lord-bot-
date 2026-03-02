import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  LogOut, 
  ChevronRight,
  Bot,
  Server,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Gavel,
  Plus,
  Trash2,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Bell,
  Activity,
  BarChart3,
  Lock,
  Eye,
  Hash,
  Users,
  MessageCircle,
  Palette,
  Type,
  Zap,
  MousePointerClick,
  Image,
  FileText,
  Star,
  Music,
  Coins,
  Power
} from 'lucide-react';
import {
  GuildOverview,
  GeneralSettings,
  WelcomeSettings,
  AutoResponderSettings,
  ProtectionSettings,
  LogsSettings,
  LevelingSettings,
  AutoRolesSettings,
  ReactionRolesSettings,
  ColorsSettings,
  EmbedBuilderSettings,
  ModerationSettings,
  EconomySettings,
  StarboardSettings,
  MusicSettings,
  SocialSettings
} from './pages/DashboardPages';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Theme Context ---
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

const useTheme = () => useContext(ThemeContext);

// --- Bot Status Context ---
export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'system' | 'user';
}

export const BotStatusContext = createContext({
  botOnline: false,
  setBotOnline: (online: boolean) => {},
  messages: [] as Message[],
  addMessage: (text: string, type?: 'system' | 'user') => {},
});

export const useBotStatus = () => useContext(BotStatusContext);

// --- Components ---

const Navbar = ({ user, onLogout, onToggleMobileMenu }: { user: any; onLogout: () => void; onToggleMobileMenu?: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const { botOnline, setBotOnline, addMessage } = useBotStatus();
  const { guildId } = useParams();
  const [guild, setGuild] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBotOnline(data.status === 'ok'))
      .catch(() => setBotOnline(false));
    
    if (guildId) {
      const token = localStorage.getItem('discord_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch('/api/guilds', { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const g = data.find((g: any) => g.id === guildId);
            if (g) setGuild(g);
          }
        })
        .catch(() => {});
    }
  }, [guildId]);

  const handleToggleBot = () => {
    const newState = !botOnline;
    setBotOnline(newState);
    if (newState) {
      addMessage('من عمق الظلام الرقمي، ينبثق النور. لقد استيقظ الكيان ليعيد توازن القوى. أهلاً بكم في حضرة النظام.', 'system');
    } else {
      addMessage('تتلاشى الأضواء، ويعود الصمت ليحكي قصص الفراغ. يغفو الكيان الآن، بانتظار نداء آخر من المجهول.', 'system');
    }
  };

  return (
    <nav className="h-16 border-b border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobileMenu}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg md:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {guild ? (
            <div className="flex items-center gap-3">
              {guild.icon ? (
                <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} className="w-8 h-8 rounded-lg" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">{guild.name[0]}</div>
              )}
              <span className="text-sm font-bold text-gray-900 dark:text-white hidden sm:block">{guild.name}</span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">لورد بوت</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", botOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{botOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button 
            onClick={handleToggleBot}
            className={cn(
              "p-1 rounded-md transition-all",
              botOnline ? "text-red-400 hover:bg-red-400/10" : "text-emerald-400 hover:bg-emerald-400/10"
            )}
            title={botOnline ? "إيقاف البوت" : "تشغيل البوت"}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-bg" />
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user.username}</p>
              <p className="text-[10px] text-gray-500 font-mono">#{user.discriminator !== '0' ? user.discriminator : 'global'}</p>
            </div>
            <img 
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
              alt="" 
              className="w-9 h-9 rounded-full border-2 border-primary/30"
            />
          </div>
        )}
      </div>
    </nav>
  );
};

const Sidebar = ({ guildId, mobile, onClose }: { guildId?: string; mobile?: boolean; onClose?: () => void }) => {
  const location = useLocation();
  
  const items = [
    { icon: TrendingUp, label: 'نظرة عامة', path: `/guild/${guildId}` },
    { icon: User, label: 'الملف الشخصي (Social)', path: `/guild/${guildId}/social` },
    { icon: Settings, label: 'إعدادات عامة', path: `/guild/${guildId}/settings` },
    { icon: ShieldAlert, label: 'الإشراف (Moderation)', path: `/guild/${guildId}/moderation` },
    { icon: MessageSquare, label: 'الترحيب', path: `/guild/${guildId}/welcome` },
    { icon: MessageCircle, label: 'الردود التلقائية', path: `/guild/${guildId}/auto-responder` },
    { icon: ShieldAlert, label: 'نظام الحماية', path: `/guild/${guildId}/protection` },
    { icon: Activity, label: 'سجل الأحداث', path: `/guild/${guildId}/logs` },
    { icon: TrendingUp, label: 'نظام المستويات', path: `/guild/${guildId}/leveling` },
    { icon: Zap, label: 'نظام الاقتصاد', path: `/guild/${guildId}/economy` },
    { icon: User, label: 'الرتب التلقائية', path: `/guild/${guildId}/auto-roles` },
    { icon: CheckCircle2, label: 'رتب التفاعل', path: `/guild/${guildId}/reaction-roles` },
    { icon: Palette, label: 'الألوان', path: `/guild/${guildId}/colors` },
    { icon: Type, label: 'الرسائل المضمنة', path: `/guild/${guildId}/embed-builder` },
    { icon: Star, label: 'ستار بورد (Starboard)', path: `/guild/${guildId}/starboard` },
    { icon: Music, label: 'الموسيقى', path: `/guild/${guildId}/music` },
  ];

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-primary rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">لورد بوت</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Dashboard v2.0</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
              <span className="font-bold text-sm">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => {
            document.cookie = 'token=; Max-Age=0; path=/';
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-dark-bg border-l border-white/10 z-[60] shadow-2xl md:hidden"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <aside className="w-64 border-l border-white/10 bg-white/50 dark:bg-black/20 h-screen hidden md:block sticky top-0">
      {content}
    </aside>
  );
};

// --- Pages ---

const LandingPage = ({ user, onLoginSuccess }: { user: any; onLoginSuccess: (token?: string) => void }) => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (user) {
      navigate('/guilds');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      const popup = window.open(url, 'discord_auth', 'width=600,height=800');
      
      if (!popup) {
        alert('الرجاء السماح بالنوافذ المنبثقة (Popups) لتسجيل الدخول.');
        setIsLoggingIn(false);
        return;
      }

      const messageListener = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          onLoginSuccess(event.data.token);
          window.removeEventListener('message', messageListener);
          setIsLoggingIn(false);
          navigate('/guilds');
        }
      };
      window.addEventListener('message', messageListener);

      // Cleanup listener if popup is closed without success
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageListener);
          setIsLoggingIn(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          موثوق به من قبل أكثر من 1,000 سيرفر
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
          أدر سيرفر ديسكورد <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">بكل احترافية.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          البوت الشامل لإدارة السيرفر، رسائل الترحيب، ونظام مستويات متطور. كل ذلك يُدار من خلال لوحة تحكم عصرية.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            {isLoggingIn ? 'جاري التحميل...' : (user ? 'الذهاب للوحة التحكم' : 'ابدأ الآن')}
          </button>
          <a 
            href="#" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all border border-white/10"
          >
            المميزات
          </a>
        </div>
      </motion.div>
    </div>
  );
};

const GuildSelector = () => {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/guilds', { headers })
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setGuilds(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white text-center">جاري تحميل السيرفرات...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-right">اختر سيرفر</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" dir="rtl">
        {guilds.map((guild) => (
          <motion.div
            key={guild.id}
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all text-right"
          >
            <div className="flex items-center gap-4 mb-6">
              {guild.icon ? (
                <img 
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                  className="w-16 h-16 rounded-2xl"
                  alt={guild.name}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                  {guild.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{guild.name}</h3>
                <p className="text-sm text-gray-400">مسؤول</p>
              </div>
            </div>
            
            {guild.botInGuild ? (
              <Link 
                to={`/guild/${guild.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
              >
                إدارة
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            ) : (
              <a 
                href={`https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
              >
                دعوة البوت
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  const [botOnline, setBotOnline] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBotOnline(data.status === 'ok'))
      .catch(() => setBotOnline(false));
  }, []);

  return (
    <footer className="py-6 px-8 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", botOnline ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{botOnline ? 'Connected' : 'Disconnected'}</span>
          </div>
          <span className="text-gray-300 dark:text-white/10">|</span>
          <span className="text-xs font-bold text-gray-400">الإصدار 2.0.4</span>
        </div>
        <p className="text-xs text-gray-500 font-medium">© 2024 لورد بوت. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

function SidebarWrapper({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { guildId } = useParams();
  return <Sidebar guildId={guildId} mobile={mobile} onClose={onClose} />;
}



const DashboardLayout = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300 flex flex-col">
      <Navbar user={user} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <SidebarWrapper />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-[#141414] z-50 md:hidden shadow-2xl"
              >
                <SidebarWrapper mobile onClose={() => setMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a] p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<GuildOverview />} />
              <Route path="/social" element={<SocialSettings />} />
              <Route path="/settings" element={<GeneralSettings />} />
              <Route path="/moderation" element={<ModerationSettings />} />
              <Route path="/welcome" element={<WelcomeSettings />} />
              <Route path="/auto-responder" element={<AutoResponderSettings />} />
              <Route path="/protection" element={<ProtectionSettings />} />
              <Route path="/logs" element={<LogsSettings />} />
              <Route path="/leveling" element={<LevelingSettings />} />
              <Route path="/economy" element={<EconomySettings />} />
              <Route path="/auto-roles" element={<AutoRolesSettings />} />
              <Route path="/reaction-roles" element={<ReactionRolesSettings />} />
              <Route path="/colors" element={<ColorsSettings />} />
              <Route path="/embed-builder" element={<EmbedBuilderSettings />} />
              <Route path="/starboard" element={<StarboardSettings />} />
              <Route path="/music" element={<MusicSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [botOnline, setBotOnline] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (text: string, type: 'system' | 'user' = 'user') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 50));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/auth/me', { headers });
      if (!res.ok) throw new Error('Not logged in');
      const data = await res.json();
      if (data.id) setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('discord_token');
    document.cookie = 'token=; Max-Age=0; path=/';
    setUser(null);
  };

  const handleLoginSuccess = (token?: string) => {
    if (token) {
      localStorage.setItem('discord_token', token);
    }
    fetchUser();
  };

  if (loadingUser) {
    return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-white">جاري التحميل...</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BotStatusContext.Provider value={{ botOnline, setBotOnline, messages, addMessage }}>
        <Router>
          <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 flex flex-col">
            <Routes>
              <Route path="/" element={
                <>
                  <Navbar user={user} onLogout={handleLogout} />
                  <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />
                  <Footer />
                </>
              } />
              <Route path="/guilds" element={
                user ? (
                  <>
                    <Navbar user={user} onLogout={handleLogout} />
                    <GuildSelector />
                    <Footer />
                  </>
                ) : (
                  <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />
                )
              } />
              <Route path="/guild/:guildId/*" element={
                user ? (
                  <DashboardLayout user={user} onLogout={handleLogout} />
                ) : (
                  <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />
                )
              } />
            </Routes>
          </div>
        </Router>
      </BotStatusContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
