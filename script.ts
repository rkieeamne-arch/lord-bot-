import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { \n  LineChart, ",
  "import {\n  GuildOverview,\n  GeneralSettings,\n  WelcomeSettings,\n  AutoResponderSettings,\n  ProtectionSettings,\n  LogsSettings,\n  LevelingSettings,\n  AutoRolesSettings,\n  ReactionRolesSettings,\n  ColorsSettings,\n  EmbedBuilderSettings\n} from './pages/DashboardPages';\nimport { \n  LineChart, "
);

// Add new lucide icons
code = code.replace(
  "  MessageCircle\n} from 'lucide-react';",
  "  MessageCircle,\n  Palette,\n  Type,\n  Zap,\n  MousePointerClick,\n  Image,\n  FileText\n} from 'lucide-react';"
);

// Replace Sidebar items
const oldSidebarItems = `  const items = [
    { icon: LayoutDashboard, label: 'الرئيسية', path: \`/guild/\${guildId}\` },
    { icon: Shield, label: 'إدارة الوحدات', path: \`/guild/\${guildId}/modules\` },
    { icon: Gavel, label: 'الإشراف والأوامر', path: \`/guild/\${guildId}/moderation\` },
    { icon: MessageSquare, label: 'نظام الترحيب', path: \`/guild/\${guildId}/welcome\` },
    { icon: TrendingUp, label: 'نظام المستويات', path: \`/guild/\${guildId}/leveling\` },
    { icon: MessageCircle, label: 'الرد التلقائي', path: \`/guild/\${guildId}/auto-response\` },
    { icon: ShieldAlert, label: 'الأمان والحماية', path: \`/guild/\${guildId}/security\` },
    { icon: Activity, label: 'سجل النشاط', path: \`/guild/\${guildId}/activity\` },
    { icon: Lock, label: 'الصلاحيات', path: \`/guild/\${guildId}/permissions\` },
    { icon: Settings, label: 'الإعدادات العامة', path: \`/guild/\${guildId}/settings\` },
  ];`;

const newSidebarItems = `  const items = [
    { icon: LayoutDashboard, label: 'نظرة عامة', path: \`/guild/\${guildId}\` },
    { icon: Settings, label: 'إعدادات عامة', path: \`/guild/\${guildId}/settings\` },
    { icon: MessageSquare, label: 'الترحيب', path: \`/guild/\${guildId}/welcome\` },
    { icon: MessageCircle, label: 'الردود التلقائية', path: \`/guild/\${guildId}/auto-responder\` },
    { icon: ShieldAlert, label: 'نظام الحماية', path: \`/guild/\${guildId}/protection\` },
    { icon: Activity, label: 'سجل الأحداث', path: \`/guild/\${guildId}/logs\` },
    { icon: TrendingUp, label: 'نظام المستويات', path: \`/guild/\${guildId}/leveling\` },
    { icon: User, label: 'الرتب التلقائية', path: \`/guild/\${guildId}/auto-roles\` },
    { icon: CheckCircle2, label: 'رتب التفاعل', path: \`/guild/\${guildId}/reaction-roles\` },
    { icon: Palette, label: 'الألوان', path: \`/guild/\${guildId}/colors\` },
    { icon: Type, label: 'الرسائل المضمنة', path: \`/guild/\${guildId}/embed-builder\` },
  ];`;

code = code.replace(oldSidebarItems, newSidebarItems);

// Replace Routes
const oldRoutes = `                      <Routes>
                        <Route path="/" element={<GuildOverview />} />
                        <Route path="/modules" element={<ModulesSettings />} />
                        <Route path="/moderation" element={<ModerationSettings />} />
                        <Route path="/welcome" element={<WelcomeSettings />} />
                        <Route path="/leveling" element={<LevelingSettings />} />
                        <Route path="/auto-response" element={<AutoResponseSettings />} />
                        <Route path="/security" element={<SecuritySettings />} />
                        <Route path="/settings" element={<GeneralSettings />} />
                        <Route path="/activity" element={<ActivityLog />} />
                        <Route path="/permissions" element={<PermissionMatrix />} />
                      </Routes>`;

const newRoutes = `                      <Routes>
                        <Route path="/" element={<GuildOverview />} />
                        <Route path="/settings" element={<GeneralSettings />} />
                        <Route path="/welcome" element={<WelcomeSettings />} />
                        <Route path="/auto-responder" element={<AutoResponderSettings />} />
                        <Route path="/protection" element={<ProtectionSettings />} />
                        <Route path="/logs" element={<LogsSettings />} />
                        <Route path="/leveling" element={<LevelingSettings />} />
                        <Route path="/auto-roles" element={<AutoRolesSettings />} />
                        <Route path="/reaction-roles" element={<ReactionRolesSettings />} />
                        <Route path="/colors" element={<ColorsSettings />} />
                        <Route path="/embed-builder" element={<EmbedBuilderSettings />} />
                      </Routes>`;

code = code.replace(oldRoutes, newRoutes);

// Remove old components
const startString = "const WelcomeSettings = () => {";
const endString = "function SidebarWrapper";

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  const footerStart = code.indexOf("const Footer = () => {");
  const footerEnd = code.indexOf("};", code.indexOf("© 2024 لورد بوت. جميع الحقوق محفوظة.</p>")) + 2;
  
  const footerCode = code.substring(footerStart, footerEnd);
  
  code = code.substring(0, startIndex) + footerCode + "\n\n" + code.substring(endIndex);
}

fs.writeFileSync('src/App.tsx', code);
