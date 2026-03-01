import { LanguageToggle } from "@/features/language-toggle/ui";
import { Routes } from "@/shared/routes";
import { APP_LANG } from "@/shared/types";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Code,
  ExternalLink,
  Github,
  Globe,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { dictionary } from "./dictionary";

export const AboutPage = ({ lang = "en" }: { lang?: APP_LANG }) => {
  const { routes: ROUTES } = new Routes(lang);
  const activeLang = lang;
  const t = dictionary[activeLang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex justify-end mb-10">
          <LanguageToggle lang={lang} />
        </div>

        <header className="mb-14">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-widest uppercase mb-6">
            <Zap className="w-3 h-3 mr-1.5" />
            {t.badge}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-gray-900">
            {t.title}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mb-8">
            {t.subtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={ROUTES.app}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <BookOpen className="w-4 h-4" />
              {t.cta.primary}
            </Link>
            <Link
              href={ROUTES.guide}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors text-sm border-2 border-gray-200 hover:border-gray-300"
            >
              {t.howToUse}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/sieugene/yomikomi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 font-semibold rounded-xl transition-colors text-sm border-2 border-gray-200"
            >
              <Github className="w-4 h-4" />
              {t.viewSource}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        <div className="space-y-0">
          {t.sections.map((section, i) => (
            <article key={i}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{section.icon}</span>
                  <span className="text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {section.tag}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="text-gray-600 leading-relaxed text-[15px]"
                    >
                      {p}
                    </p>
                  ))}
                </div>

                {"link" in section && section.link && (
                  <a
                    href={section.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" />
                    {section.link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {i < t.sections.length - 1 && (
                <div className="flex justify-center py-3">
                  <div className="w-px h-6 bg-gray-200" />
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex-shrink-0 p-2.5 bg-amber-100 rounded-xl">
            <Smartphone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-800 mb-1">
              {activeLang === "en"
                ? "Works great on iPhone"
                : "iPhoneでも快適に使えます"}
            </div>
            <div className="text-sm text-amber-700 leading-relaxed">
              {activeLang === "en"
                ? "Safari → Share → Add to Home Screen. Opens fullscreen like a native app — no App Store required."
                : "Safari → 共有 → ホーム画面に追加。App Store不要でネイティブアプリのようにフルスクリーンで起動します。"}
            </div>
          </div>
        </div>

        <section className="mt-6 p-8 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
            {t.techStack.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {t.techStack.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {item.label}
                </span>
                <span className="text-xs text-gray-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 text-center py-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t.cta.title}</h2>
          <p className="text-blue-100 mb-8 text-sm">{t.cta.subtitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={ROUTES.app}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow"
            >
              {t.cta.primary}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
               href={ROUTES.guide}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
            >
              {t.cta.secondary}
            </Link>
          </div>
        </section>

        <footer className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 sieugene · MIT License</span>
          <a
            href="https://github.com/sieugene/yomikomi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <Globe className="w-3 h-3" />
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
};
