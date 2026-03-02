import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const dashboardLayout = `
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.id) setUser(data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 flex flex-col">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <LandingPage />
                <Footer />
              </>
            } />
            <Route path="/guilds" element={
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <GuildSelector />
                <Footer />
              </>
            } />
            <Route path="/guild/:guildId/*" element={<DashboardLayout user={user} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
`;

code = code + "\n\n" + dashboardLayout;
fs.writeFileSync('src/App.tsx', code);
