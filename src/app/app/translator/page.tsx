"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ArrowRight, Loader2, Languages, Copy, Check } from "lucide-react";
import { TranslateSupportedLang } from '@/features/translation/types';
import { useTranslation } from '@/features/translation/hooks/useTranslation';
import { useTranslationSettings } from '@/features/translation/context/TranslationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';


const LANGUAGE_OPTIONS: Array<{
  value: TranslateSupportedLang;
  label: string;
  description: string;
}> = [
  {
    value: "en",
    label: "English",
    description: "Fast • Single model",
  },
  {
    value: "ru",
    label: "Russian",
    description: "Fast • Two models",
  },
  {
    value: "ru_large",
    label: "Russian (Large)",
    description: "Better quality • Slower",
  },
];

export default function TranslatorPage() {
  const searchParams = useSearchParams();
  const initialSentence = searchParams.get("sentence") || "";

  const [sourceText, setSourceText] = useState(initialSentence);
  const [translatedText, setTranslatedText] = useState("");
  const [copied, setCopied] = useState(false);

  const { translate, loading: translating } = useTranslation();
  const { settings, updateSettings, loading: modelsLoading } =
    useTranslationSettings();

  useEffect(() => {
    if (initialSentence) {
      setSourceText(initialSentence);
    }
  }, [initialSentence]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    const result = await translate(sourceText);
    setTranslatedText(result);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (language: TranslateSupportedLang) => {
    updateSettings({ language });
  };

  const handleToggleTranslation = () => {
    updateSettings({ on: !settings.on });
  };

  const isReady = settings.on && !modelsLoading;
  const isProcessing = translating || modelsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Japanese Translator
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg ml-[60px]">
            AI-powered Japanese to English/Russian translation
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Toggle Translation */}
              <Button
                onClick={handleToggleTranslation}
                variant={settings.on ? "default" : "outline"}
                size="lg"
                className={
                  settings.on
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"
                    : ""
                }
              >
                {settings.on ? "Models Active" : "Activate Models"}
              </Button>

              {/* Language Selector */}
              {settings.on && (
                <>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex gap-2">
                    {LANGUAGE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => handleLanguageChange(option.value)}
                        disabled={modelsLoading}
                        variant={
                          settings.language === option.value
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        className="flex-col items-start h-auto py-2"
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs opacity-70 font-normal">
                          {option.description}
                        </div>
                      </Button>
                    ))}
                  </div>
                </>
              )}

              {/* Status indicator */}
              {modelsLoading && (
                <>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <Badge variant="secondary" className="gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading models...
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Translation Interface */}
        <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6">
          {/* Source Text */}
          <Card>
            <CardHeader>
              <CardTitle>Japanese Input</CardTitle>
              <CardDescription>Enter text to translate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter Japanese text..."
                className="min-h-[400px] text-base resize-none"
              />
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {sourceText.length} characters
              </div>
            </CardContent>
          </Card>

          {/* Arrow Button */}
          <div className="flex items-center justify-center md:pt-[88px]">
            <Button
              onClick={handleTranslate}
              disabled={!isReady || !sourceText.trim() || isProcessing}
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              {translating ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>

          {/* Translated Text */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Translation</CardTitle>
                  <CardDescription>Translated result</CardDescription>
                </div>
                {translatedText && (
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base">
                {translatedText ? (
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-600">
                    Translation will appear here...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        {!settings.on && (
          <Card className="mt-6 border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/20">
            <CardHeader>
              <CardTitle className="text-base">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Click {`"Activate Models"`} to initialize the translation system
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  First load may take 30-60 seconds to download models
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Models run locally in your browser for privacy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Choose your preferred target language after activation
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}