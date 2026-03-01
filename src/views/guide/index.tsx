import React from "react";
import {
  BookOpen,
  Upload,
  Camera,
  Search,
  Star,
  Languages,
  Smartphone,
  FolderOpen,
  Zap,
  Download,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { dictionary } from "./dictionary";
import { APP_LANG } from "@/shared/types";
import { Routes } from "@/shared/routes";
import { LanguageToggle } from "@/features/language-toggle/ui";

export const GuidePage = ({ lang }: { lang: APP_LANG }) => {
  const t = dictionary[lang] || dictionary.en;
  const { routes } = new Routes(lang);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={routes.albums}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToOcr}
          </Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto pt-8 pr-10">
        <div className="flex justify-end">
          <LanguageToggle lang={lang} />
        </div>
      </div>
      <div className="pb-16 pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-widest uppercase mb-4">
              <Zap className="w-3 h-3" />
              {t.badgeText}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          <div className="space-y-6 mb-14">
            {t.steps.map((step, i: number) => (
              <div
                key={i}
                className="group flex gap-5 p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    {getStepIcon(i)}
                  </div>
                  <span className="text-xs font-bold text-gray-300">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">
                    {step.description}
                  </p>
                  <div className="inline-flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <span className="font-semibold flex-shrink-0 mt-px">
                      💡
                    </span>
                    <span>{step.tip}</span>
                  </div>
                </div>

                <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors self-center" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-6">
              {t.extraFeaturesTitle}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {t.extras.map((extra, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-xs">
                    {getExtraIcon(i)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 mb-0.5">
                      {extra.title}
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {extra.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm mb-4">{t.ctaText}</p>
            <Link
              href={routes.albums}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
            >
              {t.ctaButton}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function getStepIcon(index: number) {
  const icons = [
    <BookOpen className="w-5 h-5" key="book" />,
    <Upload className="w-5 h-5" key="upload" />,
    <Camera className="w-5 h-5" key="camera" />,
    <Search className="w-5 h-5" key="search" />,
    <Star className="w-5 h-5" key="star" />,
    <Languages className="w-5 h-5" key="languages" />,
  ];
  return icons[index] || null;
}

function getExtraIcon(index: number) {
  const icons = [
    <Smartphone className="w-5 h-5" key="smartphone" />,
    <FolderOpen className="w-5 h-5" key="folder" />,
    <Zap className="w-5 h-5" key="zap" />,
    <Download className="w-5 h-5" key="download" />,
  ];
  return icons[index] || null;
}
