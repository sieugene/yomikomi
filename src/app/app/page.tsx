import Link from "next/link";
import {
  BookOpen,
  Image,
  BookMarked,
  Languages,
  Settings,
  FileInput,
  Heart,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ROUTES } from '@/shared/routes';


const appSections = [
  {
    title: "Albums",
    description: "Browse and manage your albums",
    icon: BookOpen,
    href: ROUTES.albums,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Reader",
    description: "Simple text reading interface",
    icon: BookMarked,
    href: ROUTES.simpleReaderRoot,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Translator",
    description: "AI-powered Japanese translation",
    icon: ArrowRightLeft,
    href: ROUTES.translator,
    color: "from-violet-500 to-cyan-500",
  },
  {
    title: "Dictionary",
    description: "Search and translate words",
    icon: Languages,
    href: ROUTES.dict,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "OCR Capture",
    description: "Extract text from images",
    icon: Image,
    href: ROUTES.ocrCapture,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Favorites",
    description: "Saved words and phrases",
    icon: Heart,
    href: ROUTES.favorites,
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "Anki Import",
    description: "Import decks from Anki",
    icon: FileInput,
    href: ROUTES.ankiImport,
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Settings",
    description: "Configure your application",
    icon: Settings,
    href: ROUTES.settings,
    color: "from-gray-500 to-slate-500",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Yomikomi
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Choose a section to get started
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-slate-200 dark:border-slate-700">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <CardHeader className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-300">
                      {section.title}
                    </CardTitle>

                    {/* Description */}
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>

                  {/* Arrow indicator */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      className="w-5 h-5 text-slate-400 dark:text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}