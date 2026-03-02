import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Save, ShieldAlert, MessageSquare, MessageCircle, Activity, TrendingUp, User, CheckCircle2, Hash, LayoutDashboard, Settings, Type, Palette, Zap, MousePointerClick, Image, FileText, Users, Server, Bot, Gavel, Music, Star, Coins, Power, Edit3, Shield, Send, Plus, Trash2 } from 'lucide-react';
import { useBotStatus } from '../App';

export const GeneralChat = () => {
  const { messages, addMessage } = useBotStatus();
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage(input, 'user');
    setInput('');
  };

  return (
    <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-gray-900 dark:text-white">الشات العام (محاكاة)</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Feed</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.type === 'system' ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}
          >
            {msg.type === 'system' ? (
              <div className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
                {msg.text}
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-white/5 rounded-2xl px-4 py-2 max-w-[80%]">
                <p className="text-sm text-gray-900 dark:text-white text-right">{msg.text}</p>
                <p className="text-[8px] text-gray-500 mt-1 text-left">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <MessageCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">لا توجد رسائل بعد</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-white/10 flex gap-2">
        <button 
          type="submit"
          className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right"
          dir="rtl"
        />
      </form>
    </div>
  );
};

export const GuildOverview = () => {
  const { guildId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [guildId]);

  if (loading) return <div className="p-6 text-center text-gray-500">جاري تحميل البيانات...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظرة عامة</h2>
        <p className="text-gray-500">إحصائيات السيرفر ونشاط البوت.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'الأعضاء', value: data?.memberCount?.toLocaleString() || '0', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: Activity, label: 'متصلون', value: data?.onlineCount?.toLocaleString() || '0', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: Server, label: 'القنوات', value: data?.channelCount?.toLocaleString() || '0', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { icon: Shield, label: 'الرتب', value: data?.roleCount?.toLocaleString() || '0', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: Zap, label: 'مستوى السيرفر', value: `Level ${data?.boostLevel || 0}`, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { icon: Star, label: 'عدد التعزيزات', value: data?.boostCount?.toLocaleString() || '0', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GeneralChat />
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">أحدث النشاطات</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">انضم عضو جديد</p>
                    <p className="text-[10px] text-gray-500">منذ 5 دقائق</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GeneralSettings = () => {
  const { guildId } = useParams();
  const [saving, setSaving] = useState(false);
  const { botOnline, setBotOnline, addMessage } = useBotStatus();
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (guildId) {
      fetch(`/api/guilds/${guildId}/settings`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data.ai_provider) setAiProvider(data.ai_provider);
          if (data.api_key) setApiKey(data.api_key);
          if (data.bot_enabled !== undefined) setBotOnline(data.bot_enabled === 1);
        })
        .catch(console.error);
    }
  }, [guildId, setBotOnline]);

  const handleSave = () => {
    setSaving(true);
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guilds/${guildId}/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            ai_provider: aiProvider,
            api_key: apiKey,
            bot_enabled: botOnline ? 1 : 0
        })
    })
    .then(res => res.json())
    .then(() => {
        setTimeout(() => setSaving(false), 1000);
    })
    .catch(() => setSaving(false));
  };

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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الإعدادات العامة</h2>
          <p className="text-gray-500">قم بتخصيص إعدادات البوت الأساسية للسيرفر الخاص بك.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">حالة البوت</p>
            <p className="text-xs text-gray-500">{botOnline ? 'البوت يعمل حالياً' : 'البوت متوقف'}</p>
          </div>
          <button 
            onClick={handleToggleBot}
            className={`w-14 h-8 rounded-full transition-all relative ${botOnline ? "bg-emerald-500" : "bg-red-500"}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${botOnline ? "right-1" : "right-7"}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">مزود الذكاء الاصطناعي (AI Provider)</label>
          <select 
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right"
            dir="rtl"
          >
            <option value="gemini">Google Gemini (Default)</option>
            <option value="mistral">Mistral AI</option>
          </select>
          <p className="text-xs text-gray-500 mt-2 text-right">اختر المزود الذي سيستخدمه البوت للرد على المحادثات.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">مفتاح API (API Key)</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="أدخل مفتاح API الخاص بالمزود المختار"
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right"
            dir="ltr"
          />
          <p className="text-xs text-gray-500 mt-2 text-right">اتركه فارغاً لاستخدام المفتاح الافتراضي للنظام (إن وجد).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">بادئة الأوامر (Prefix)</label>
          <input 
            type="text" 
            defaultValue="!"
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">لغة البوت</label>
          <select 
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right"
            dir="rtl"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
};

export const WelcomeSettings = () => {
  const { guildId } = useParams();
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.channels) {
          setChannels(data.channels.filter((c: any) => c.type === 0 || c.type === 5)); // Text or News channels
        }
      });
  }, [guildId]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الترحيب</h2>
          <p className="text-gray-500">قم بإعداد رسائل الترحيب والمغادرة للأعضاء.</p>
        </div>
        <button 
          onClick={() => setEnabled(!enabled)}
          className={`w-14 h-8 rounded-full transition-all relative ${enabled ? "bg-primary" : "bg-gray-300 dark:bg-white/10"}`}
        >
          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${enabled ? "right-1" : "right-7"}`} />
        </button>
      </div>

      {enabled && (
        <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">قناة الترحيب</label>
            <select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl">
              <option value="">اختر القناة...</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>#{channel.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">رسالة الترحيب</label>
            <textarea 
              rows={4}
              defaultValue="مرحباً بك [user] في السيرفر! أنت العضو رقم [membercount]."
              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right resize-none"
              dir="rtl"
            />
            <p className="text-xs text-gray-500 mt-2">المتغيرات المتاحة: [user], [server], [membercount]</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">صورة الترحيب</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">اضغط لرفع صورة أو اسحب الصورة هنا</p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      )}
    </div>
  );
};

export const AutoResponderSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الردود التلقائية</h2>
        <p className="text-gray-500">قم بإنشاء ردود تلقائية على كلمات أو جمل معينة.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد ردود تلقائية</h3>
        <p className="text-gray-500 mb-6">قم بإضافة رد تلقائي جديد للبدء.</p>
        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
          إضافة رد تلقائي
        </button>
      </div>
    </div>
  );
};

export const ProtectionSettings = () => {
  const [settings, setSettings] = useState([
    { id: 'links', title: 'منع الروابط', desc: 'حذف الروابط المرسلة تلقائياً.', enabled: true },
    { id: 'spam', title: 'منع السبام', desc: 'منع تكرار الرسائل المزعجة.', enabled: true },
    { id: 'invites', title: 'منع الدعوات', desc: 'حذف روابط سيرفرات الديسكورد الأخرى.', enabled: false },
    { id: 'bots', title: 'منع البوتات', desc: 'منع دخول البوتات غير الموثقة.', enabled: false },
    { id: 'badwords', title: 'الكلمات الممنوعة', desc: 'حذف الرسائل التي تحتوي على كلمات مسيئة.', enabled: false },
    { id: 'images', title: 'حماية الصور', desc: 'منع إرسال الصور في قنوات محددة.', enabled: false },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظام الحماية (Anti-Raid)</h2>
        <p className="text-gray-500">إعدادات الحماية التلقائية للسيرفر ضد الهجمات والرسائل المزعجة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((item) => (
          <div key={item.id} className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <button 
                onClick={() => toggleSetting(item.id)}
                className={`w-12 h-6 rounded-full transition-all relative ${item.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.enabled ? 'right-1' : 'right-7'}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LogsSettings = () => {
  const { guildId } = useParams();
  const [channels, setChannels] = useState<any[]>([]);
  const [logTypes, setLogTypes] = useState([
    { label: 'الأعضاء (دخول، خروج، تعديل)', enabled: true },
    { label: 'الرسائل (حذف، تعديل)', enabled: true },
    { label: 'القنوات (إنشاء، حذف، تعديل)', enabled: true },
    { label: 'الرتب (إنشاء، حذف، تعديل)', enabled: true },
    { label: 'الصوت (دخول، خروج، انتقال)', enabled: true }
  ]);
  
  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.channels) {
          setChannels(data.channels.filter((c: any) => c.type === 0 || c.type === 5));
        }
      });
  }, [guildId]);

  const toggleLog = (index: number) => {
    setLogTypes(prev => prev.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">سجل الأحداث</h2>
        <p className="text-gray-500">تتبع كل ما يحدث في السيرفر من تغييرات ورسائل.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">قناة السجل العامة</label>
          <select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl">
            <option value="">اختر القناة...</option>
            {channels.map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
          {logTypes.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <button 
                onClick={() => toggleLog(i)}
                className={`w-12 h-6 rounded-full transition-all relative ${item.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.enabled ? 'right-1' : 'right-7'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LevelingSettings = () => {
  const { guildId } = useParams();
  const [enabled, setEnabled] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [rewards, setRewards] = useState<{level: number, roleId: string}[]>([]);
  const [newRewardLevel, setNewRewardLevel] = useState(5);
  const [newRewardRole, setNewRewardRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.channels) {
          setChannels(data.channels.filter((c: any) => c.type === 0 || c.type === 5));
        }
        if (data.roles) {
          setRoles(data.roles.filter((r: any) => r.name !== '@everyone'));
        }
      })
      .catch(err => console.error("Failed to fetch guild data", err));
  }, [guildId]);

  const addReward = () => {
    if (newRewardLevel > 0 && newRewardRole) {
      if (rewards.some(r => r.level === newRewardLevel)) {
        alert('يوجد مكافأة لهذا المستوى بالفعل');
        return;
      }
      setRewards([...rewards, { level: newRewardLevel, roleId: newRewardRole }].sort((a, b) => a.level - b.level));
      setNewRewardRole('');
      setNewRewardLevel(prev => prev + 5);
    }
  };

  const removeReward = (level: number) => {
    setRewards(rewards.filter(r => r.level !== level));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظام المستويات</h2>
        <p className="text-gray-500">إعدادات نظام الخبرة (XP) والمستويات والجوائز.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">تفعيل نظام المستويات</h3>
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-8 rounded-full transition-all relative ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'right-7'}`} />
          </button>
        </div>

        {enabled && (
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-white/10">
            
            {/* Notification Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">قناة إشعارات المستوى</label>
              <select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl">
                <option value="">اختر القناة...</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>#{channel.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">القناة التي سيتم إرسال رسالة التهنئة فيها عند وصول العضو لمستوى جديد.</p>
            </div>

            {/* Level Up Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">رسالة المستوى الجديد</label>
              <textarea 
                rows={3}
                defaultValue="مبروك [user]! لقد وصلت إلى المستوى [level] 🎉"
                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right resize-none"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 mt-2">المتغيرات المتاحة: [user], [level], [xp]</p>
            </div>

            {/* Role Rewards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-4">جوائز المستويات (رتب تلقائية)</label>
              
              <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-4 space-y-4">
                <div className="flex gap-4 items-end">
                  <button 
                    onClick={addReward}
                    disabled={!newRewardRole}
                    className="p-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">الرتبة</label>
                    <select 
                      value={newRewardRole}
                      onChange={(e) => setNewRewardRole(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" 
                      dir="rtl"
                    >
                      <option value="">اختر الرتبة...</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">المستوى</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newRewardLevel}
                      onChange={(e) => setNewRewardLevel(parseInt(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-center" 
                    />
                  </div>
                </div>

                {rewards.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {rewards.map((reward) => {
                      const role = roles.find(r => r.id === reward.roleId);
                      return (
                        <div key={reward.level} className="flex items-center justify-between bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl">
                          <button 
                            onClick={() => removeReward(reward.level)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg">
                              {role?.name || 'رتبة غير معروفة'}
                            </span>
                            <span className="text-sm text-gray-500">
                              عند الوصول لمستوى <span className="font-bold text-primary">{reward.level}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {rewards.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    لا توجد جوائز مضافة بعد
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export const AutoRolesSettings = () => {
  const { guildId } = useParams();
  const [roles, setRoles] = useState<any[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.roles) {
          setRoles(data.roles.filter((r: any) => r.name !== '@everyone'));
        }
      });
  }, [guildId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الرتب التلقائية</h2>
        <p className="text-gray-500">إعطاء رتب تلقائية للأعضاء عند دخولهم السيرفر.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">الرتبة التلقائية</label>
          <select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl">
            <option value="">اختر الرتبة...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export const ReactionRolesSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">رتب التفاعل</h2>
        <p className="text-gray-500">السماح للأعضاء باختيار رتبهم من خلال التفاعل مع الرسائل.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
        <MousePointerClick className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد رسائل تفاعل</h3>
        <p className="text-gray-500 mb-6">قم بإنشاء رسالة تفاعل جديدة للبدء.</p>
        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
          إنشاء رسالة تفاعل
        </button>
      </div>
    </div>
  );
};

export const ColorsSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الألوان</h2>
        <p className="text-gray-500">إعداد رتب الألوان ليتمكن الأعضاء من تغيير لون أسمائهم.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center">
        <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">قائمة الألوان فارغة</h3>
        <p className="text-gray-500 mb-6">قم بإنشاء رتب ألوان جديدة.</p>
        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
          إنشاء ألوان تلقائياً
        </button>
      </div>
    </div>
  );
};

export const EmbedBuilderSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الرسائل المضمنة</h2>
        <p className="text-gray-500">إنشاء وإرسال رسائل مضمنة (Embeds) مخصصة.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">العنوان</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">الوصف</label>
            <textarea rows={4} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right resize-none" dir="rtl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">اللون</label>
            <input type="color" className="w-full h-12 rounded-xl cursor-pointer" defaultValue="#4f46e5" />
          </div>
          <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
            إرسال الرسالة
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-500 mb-4">معاينة الرسالة</h3>
          <div className="border-l-4 border-primary bg-white dark:bg-[#2b2d31] p-4 rounded-r-xl shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">عنوان الرسالة</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">وصف الرسالة يظهر هنا...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModerationSettings = () => {
  const { guildId } = useParams();
  const [guildData, setGuildData] = useState<any>(null);
  const [commands, setCommands] = useState([
    { id: 'ban', name: 'Ban', alias: 'حظر', enabled: true, roles: [] },
    { id: 'kick', name: 'Kick', alias: 'طرد', enabled: true, roles: [] },
    { id: 'mute', name: 'Mute', alias: 'اسكات', enabled: true, roles: [] },
    { id: 'warn', name: 'Warn', alias: 'تحذير', enabled: true, roles: [] },
    { id: 'clear', name: 'Clear', alias: 'مسح', enabled: true, roles: [] },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(setGuildData);
  }, [guildId]);

  const toggleCommand = (id: string) => {
    setCommands(cmds => cmds.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const updateAlias = (id: string, alias: string) => {
    setCommands(cmds => cmds.map(c => c.id === id ? { ...c, alias } : c));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظام الإشراف (Moderation)</h2>
        <p className="text-gray-500">تحكم في العقوبات، التحذيرات، والرقابة التلقائية.</p>
      </div>

      <div className="space-y-4">
        {commands.map((cmd) => (
          <div key={cmd.id} className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${cmd.enabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{cmd.name}</h3>
                  <p className="text-xs text-gray-500">تعديل اختصار وصلاحيات أمر {cmd.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
                  <Edit3 className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={cmd.alias}
                    onChange={(e) => updateAlias(cmd.id, e.target.value)}
                    placeholder="اختصار الأمر"
                    className="bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white w-24 text-right"
                    dir="rtl"
                  />
                </div>

                <select className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none" dir="rtl">
                  <option value="">الرتب المسموح لها...</option>
                  {guildData?.roles?.map((role: any) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                <button 
                  onClick={() => toggleCommand(cmd.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${cmd.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                >
                  <Power className="w-4 h-4" />
                  {cmd.enabled ? 'مفعل' : 'معطل'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
          <Save className="w-5 h-5" />
          حفظ جميع الإعدادات
        </button>
      </div>
    </div>
  );
};

export const EconomySettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظام الاقتصاد</h2>
        <p className="text-gray-500">إدارة العملات، المتجر، والجوائز اليومية.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">تفعيل الاقتصاد</h3>
              <p className="text-xs text-gray-500">تفعيل الأوامر المالية والجوائز.</p>
            </div>
          </div>
          <button className="w-12 h-6 rounded-full bg-primary relative">
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">اسم العملة</label>
            <input type="text" defaultValue="Credits" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">الجائزة اليومية</label>
            <input type="number" defaultValue="100" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="ltr" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StarboardSettings = () => {
  const { guildId } = useParams();
  const [channels, setChannels] = useState<any[]>([]);
  
  useEffect(() => {
    const token = localStorage.getItem('discord_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/guild/${guildId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.channels) {
          setChannels(data.channels.filter((c: any) => c.type === 0 || c.type === 5));
        }
      });
  }, [guildId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ستار بورد (Starboard)</h2>
        <p className="text-gray-500">نشر الرسائل المميزة تلقائياً في قناة مخصصة.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">قناة الستار بورد</label>
          <select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="rtl">
            <option value="">اختر القناة...</option>
            {channels.map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">عدد التفاعلات المطلوب</label>
          <input type="number" defaultValue="3" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="ltr" />
        </div>
      </div>
    </div>
  );
};

export const SocialSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الملف الشخصي (Social)</h2>
        <p className="text-gray-500">تخصيص ملفك الشخصي، السيرة الذاتية، والخلفية.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">السيرة الذاتية (Bio)</label>
            <textarea 
              rows={3} 
              placeholder="اكتب شيئاً عن نفسك..."
              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right resize-none" 
              dir="rtl" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">رابط الخلفية (Background URL)</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-right" dir="ltr" />
          </div>
          <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
            حفظ الملف الشخصي
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500">معاينة البطاقة (Rank Card)</h3>
          <div className="relative aspect-[3/1] rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
            <div className="relative h-full p-6 flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden">
                <img src="https://picsum.photos/seed/user/200" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-white">
                <h4 className="text-xl font-black">User Name</h4>
                <p className="text-xs text-white/70 mt-1">هذا مثال للسيرة الذاتية الخاصة بك...</p>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[65%]" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-wider">
                  <span>Level 15</span>
                  <span>65% to next level</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MusicSettings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">نظام الموسيقى</h2>
        <p className="text-gray-500">إعدادات تشغيل الموسيقى والتحكم في القنوات الصوتية.</p>
      </div>

      <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center">
        <Music className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">الموسيقى قيد التطوير</h3>
        <p className="text-gray-500 mb-6">قريباً ستتمكن من التحكم في مشغل الموسيقى مباشرة من هنا.</p>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest">Coming Soon</div>
        </div>
      </div>
    </div>
  );
};
