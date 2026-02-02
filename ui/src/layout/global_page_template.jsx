import React, { useState, useMemo } from 'react';
import { Search, Filter, Bell, User, ChevronDown, LayoutGrid, List, Plus, Activity, Shield, TrendingUp, Settings } from 'lucide-react';
import { usePhoenixFilter } from '../cubes/shared/contexts/PhoenixFilterContext.jsx';

/**
 * TikTrack Global Page Template (v1.2.6)
 * ---------------------------------------
 * [STANDARD: LOD 400] [THEME: 50 Shades / Digital Twin]
 * [CORE 15 COMPONENTS: TtHeader, TtGlobalFilter, TtSection, TtSectionRow]
 */

const GlobalStyles = () => (
  <style>{`
    /* Contextual Color Mapping (Entity Context) */
    /* Note: All CSS Variables are now in phoenix-base.css (SSOT) */
    .context-trading { --context-primary: var(--color-brand); }
    .context-portfolio { --context-primary: #1a4d80; }
    .context-admin { --context-primary: #475569; }

    body { 
      font-family: var(--font-main); 
      background-color: var(--color-5); 
      color: var(--color-50); 
      margin: 0; 
      overflow-x: hidden;
    }
  `}</style>
);

// --- רכיבי ליבה אטומיים (Core 15) ---

const TtHeader = ({ user }) => (
  <header className="bg-[var(--color-1)] border-b border-[var(--color-20)] h-[64px] sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
    <div className="flex items-center gap-10">
      <img src="./images/logo.svg" alt="TikTrack" className="h-8" />
      <nav className="flex gap-8">
        <a href="#" className="text-[var(--context-primary)] border-b-2 border-[var(--context-primary)] px-2 py-1 text-sm font-bold">ראשי</a>
        <a href="#" className="text-[var(--color-40)] hover:text-[var(--context-primary)] text-sm font-bold px-2 py-1 transition-colors">פורטפוליו</a>
        <a href="#" className="text-[var(--color-40)] hover:text-[var(--context-primary)] text-sm font-bold px-2 py-1 transition-colors">ניתוח שוק</a>
      </nav>
    </div>
    <div className="flex items-center gap-4">
      <Bell size={18} className="text-[var(--color-30)] cursor-pointer" />
      <div className="flex items-center gap-3 border-r border-[var(--color-20)] pr-6">
        <div className="text-left">
          <p className="text-xs font-bold leading-tight">{user.name}</p>
          <p className="text-[10px] text-[var(--color-30)] uppercase">{user.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[var(--color-10)] border border-[var(--color-20)] flex items-center justify-center">
          <User size={20} className="text-[var(--color-30)]" />
        </div>
      </div>
    </div>
  </header>
);

/**
 * TtGlobalFilter - שורת הסינון המערכתית
 * 
 * @description שורת פילטרים גלובליים המחוברת ל-PhoenixFilterContext
 * @standard JS Standards Protocol ✅ | Audit Trail System ✅
 */
const TtGlobalFilter = () => {
  const { filters, setFilter, clearFilters } = usePhoenixFilter();

  /**
   * handleSearchChange - עדכון פילטר חיפוש
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilter('search', value);
  };

  /**
   * handleClearFilters - איפוס כל הפילטרים
   */
  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="bg-[var(--color-1)] border-b border-[var(--color-20)] px-6 py-3.5 flex items-center justify-between sticky top-[64px] z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-30)] group-focus-within:text-[var(--context-primary)] transition-colors" />
          <input 
            type="text" 
            placeholder="סינון גלובלי..." 
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="bg-[var(--color-5)] border border-[var(--color-20)] pr-10 pl-4 py-2 text-sm rounded-[4px] outline-none focus:border-[var(--context-primary)] w-72 transition-all js-global-search-input" 
          />
        </div>
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[var(--color-40)] hover:bg-[var(--color-10)] rounded-[4px] transition-all js-filter-options-button"
          onClick={handleClearFilters}
        >
          <Filter size={16} className="text-[var(--context-primary)]" /> אפשרויות סינון
        </button>
      </div>
      <button className="bg-[var(--context-primary)] text-white px-5 py-2 rounded-[4px] text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm js-quick-action-button">
        <Plus size={16} /> פעולה מהירה
      </button>
    </div>
  );
};

/**
 * TtSectionRow - ניהול גריד ופריסה (שימוש חובה במקום div רגיל)
 */
const TtSectionRow = ({ children, className = "" }) => (
  <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>{children}</div>
);

/**
 * TtSection - בלוק תוכן לוגי
 */
const TtSection = ({ title, children, className = "", icon: Icon, action }) => (
  <div className={`bg-[var(--color-1)] border border-[var(--color-20)] rounded-[2px] mb-6 flex flex-col shadow-sm ${className}`}>
    {title && (
      <div className="bg-[var(--color-5)] border-b border-[var(--color-20)] px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[var(--context-primary)]" />}
          <h3 className="text-[11px] font-bold text-[var(--color-40)] uppercase tracking-wider">{title}</h3>
        </div>
        {action && <button className="text-[var(--context-primary)] hover:underline text-xs font-bold">{action}</button>}
      </div>
    )}
    <div className="p-5 flex-1">{children}</div>
  </div>
);

// --- התבנית המרכזית ---

const App = ({ 
  entityContext = 'trading', 
  pageTitle = 'לוח בקרה מרכזי', 
  entityIcon = Shield 
}) => {
  const [user] = useState({ name: 'ישראל ישראלי', role: 'מנהל חשבון' });

  return (
    <div className={`min-h-screen flex flex-col context-${entityContext}`} dir="rtl">
      <GlobalStyles />
      
      {/* סדר רינדור אטומי (The Blueprint) */}
      <TtHeader user={user} />
      <TtGlobalFilter />

      <main className="max-w-[1400px] mx-auto w-full p-8 flex-1">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-50)] mb-1">{pageTitle}</h1>
          <p className="text-sm text-[var(--color-30)] font-bold uppercase tracking-widest">מערכת TikTrack | סביבת Phoenix</p>
        </div>

        {/* אכיפת שימוש ב-TtSection ו-TtSectionRow בלבד לעימוד */}
        <TtSection title="סטטוס ישות" icon={entityIcon} action="צפה בפרטים">
          <TtSectionRow>
            <div className="flex-1 h-32 bg-[var(--color-10)] border border-dashed border-[var(--color-20)] rounded flex items-center justify-center text-[var(--color-30)] text-xs uppercase font-bold tracking-widest">
              אזור תוכן מרכזי
            </div>
            <div className="w-full lg:w-64 h-32 bg-[var(--color-5)] border border-[var(--color-20)] rounded p-4 text-xs">
              <span className="font-bold block mb-2">סיכום מהיר:</span>
              <p className="text-[var(--color-40)]">כאן יופיעו נתונים תלויי קונטקסט.</p>
            </div>
          </TtSectionRow>
        </TtSection>

        <TtSectionRow>
          <TtSection title="פעילות אחרונה" className="flex-1">
             <div className="text-sm text-[var(--color-40)] italic text-center py-10">
               אין פעילות חדשה להצגה.
             </div>
          </TtSection>
          <TtSection title="קיצורי דרך" className="w-full lg:w-80">
             <div className="flex flex-col gap-2">
               <button className="text-right text-xs font-bold text-[var(--context-primary)] hover:underline flex items-center gap-2">
                 <Settings size={14} /> הגדרות ישות
               </button>
             </div>
          </TtSection>
        </TtSectionRow>
      </main>

      <footer className="py-6 px-10 border-t border-[var(--color-20)] bg-[var(--color-1)] flex justify-between items-center text-[10px] text-[var(--color-40)] font-bold uppercase tracking-widest">
        <div className="flex gap-8 items-center">
          <img src="./images/logo.svg" alt="" className="h-4 grayscale opacity-50" />
          <span>TikTrack System v4.2.0</span>
          <span>Build: PX-NODE-S10.13</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--context-primary)] animate-pulse"></div> מערכת מוגנת</span>
        </div>
      </footer>
    </div>
  );
};

export default App;