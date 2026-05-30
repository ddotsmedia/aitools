"use client";
import * as React from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, Record<string, string>>;

const DICT: Record<Lang, Dict> = {
  en: {
    nav: { "/tools": "Browse", "/changes": "Changes", "/compare": "Compare", "/stack": "Stack Builder", "/saved": "Saved", "/submit": "Submit tool" },
    hero: { pre: "Find the right AI tool for every", sub: "Describe what you need — get a verified, working tool stack. Every listing checked for live status, real pricing, and genuine free tiers." },
    footer: { Discover: "Discover", Build: "Build", Resources: "Resources", Company: "Company" },
    cat: {},
  },
  ar: {
    nav: { "/tools": "تصفّح", "/changes": "التحديثات", "/compare": "قارن", "/stack": "بناء الحزمة", "/saved": "المحفوظة", "/submit": "أضف أداة" },
    hero: { pre: "اعثر على أداة الذكاء الاصطناعي المناسبة لكل", sub: "صف ما تحتاجه — واحصل على حزمة أدوات موثوقة وجاهزة. كل أداة يتم التحقق منها: الحالة المباشرة، الأسعار الحقيقية، والباقات المجانية الفعلية." },
    footer: { Discover: "اكتشف", Build: "ابنِ", Resources: "موارد", Company: "الشركة" },
    cat: {
      writing: "الكتابة", image: "الصور", audio: "الصوت", video: "الفيديو", code: "البرمجة",
      productivity: "الإنتاجية", "data-analytics": "البيانات والتحليلات", "ai-agents": "وكلاء الذكاء الاصطناعي",
      search: "البحث", transcription: "تفريغ الصوت", translation: "الترجمة", chatbots: "روبوتات الدردشة",
      marketing: "التسويق", design: "التصميم", research: "البحث العلمي", "customer-support": "دعم العملاء",
      security: "الأمن", education: "التعليم", healthcare: "الصحة", "developer-tools": "أدوات المطورين",
      "website-builders": "بناء المواقع", "app-builders": "بناء التطبيقات", seo: "تحسين محركات البحث",
      "social-media": "وسائل التواصل", "logo-design": "تصميم الشعارات", "ui-ux-design": "تصميم الواجهات",
      "resume-career": "السيرة والوظائف", "e-commerce": "التجارة الإلكترونية", legal: "القانون",
      cybersecurity: "الأمن السيبراني", "3d-game-dev": "ثلاثي الأبعاد والألعاب", "sales-crm": "المبيعات وإدارة العملاء",
      "hr-recruitment": "الموارد البشرية", "finance-accounting": "المال والمحاسبة", travel: "السفر",
      "ai-assistants": "المساعدون الأذكياء", presentation: "العروض التقديمية", "spreadsheet-data": "الجداول والبيانات",
      "no-code": "بدون برمجة", "arabic-nlp": "معالجة اللغة العربية",
    },
  },
};

const LangCtx = React.createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>("en");
  React.useEffect(() => {
    const s = localStorage.getItem("lang");
    if (s === "ar" || s === "en") setLang(s);
  }, []);
  React.useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return React.useContext(LangCtx);
}

export function t(lang: Lang, ns: string, key: string, fallback?: string): string {
  return DICT[lang]?.[ns]?.[key] ?? fallback ?? key;
}

export function TText({ ns, k, fallback }: { ns: string; k: string; fallback?: string }) {
  const { lang } = useLang();
  return <>{t(lang, ns, k, fallback)}</>;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-lg border border-white/15 text-xs font-medium">
      <button
        onClick={() => setLang("en")}
        className={`rounded-l-lg px-2 py-1 transition-colors ${lang === "en" ? "bg-teal/20 text-teal" : "text-slate-400 hover:text-slate-100"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className={`rounded-r-lg px-2 py-1 font-mono transition-colors ${lang === "ar" ? "bg-teal/20 text-teal" : "text-slate-400 hover:text-slate-100"}`}
      >
        عر
      </button>
    </div>
  );
}
