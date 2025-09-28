import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Database,
  Image,
  Lock,
  Zap,
  Download,
  Search,
  Globe,
  Code,
  Settings,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ROUTES } from "@/shared/routes";

const HomePage = () => {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Dictionary Integration",
      description:
        "Import JMdict dictionaries with deep search functionality for instant word lookups.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Text Reader",
      description:
        "Paste any Japanese text for instant analysis with clickable dictionary definitions.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Advanced OCR",
      description:
        "Extract Japanese text from images with AI models running client-side or via backend.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Complete Privacy",
      description:
        "Everything runs in your browser. No data sent to servers, your materials stay private.",
      color: "from-red-500 to-orange-500",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Setup Dictionary",
      description: "Import your JMdict dictionary",
      action: "Go to Dictionary",
      route: ROUTES.dict,
      color: "from-blue-600 to-blue-700",
    },
    {
      step: "2",
      title: "Try Text Analysis",
      description: "Paste Japanese text and explore word-by-word breakdown",
      action: "Open Simple Reader",
      route: ROUTES.simpleReader("日本語の文章をここに貼り付けてください"),
      color: "from-purple-600 to-purple-700",
    },
    {
      step: "3",
      title: "Configure OCR (Optional)",
      description: "Choose client-side AI models or setup backend endpoint",
      action: "OCR Settings",
      route: ROUTES.settings,
      color: "from-green-600 to-green-700",
    },
    {
      step: "4",
      title: "Create Image Album",
      description:
        "Upload images from books, manga, or any Japanese text source",
      action: "Manage Albums",
      route: ROUTES.albums,
      color: "from-orange-600 to-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              100% Client-Side • Privacy First • Open Source
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Master Japanese with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Yomikomi
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Dictionary lookup, text analysis, and OCR recognition.
              <span className="font-semibold text-gray-800">
                {" "}
                Everything runs in your browser
              </span>{" "}
              - complete privacy guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/dict"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Get Started
              </Link>
              <a
                href="https://github.com/sieugene/yomikomi/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <Code className="w-5 h-5 mr-2" />
                View Source
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Started in 4 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow this workflow to unlock all Yomikomi features
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <div key={index} className="group">
              <div className="h-full relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${step.color} text-white text-lg font-bold rounded-full`}
                  >
                    {step.step}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <Link
                      href={step.route as string}
                      className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${step.color} text-white font-medium rounded-lg hover:shadow-md transition-all duration-200 text-sm`}
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OCR Setup Note */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Settings className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">
                OCR Backend Setup
              </h4>
              <p className="text-yellow-700 text-sm mb-3">
                For backend OCR, {"you'll"} need to deploy the backend
                application. Instructions are in development - check the GitHub
                repository for current setup details.
              </p>
              <a
                href="https://github.com/sieugene/yomikomi/tree/main/server"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-800 hover:text-yellow-900 font-medium text-sm"
              >
                View Repository
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools for serious Japanese learners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="h-full relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Technical Benefits */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Built for Privacy & Performance
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Advanced technology meets user privacy in a seamless learning
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-blue-600/20 rounded-full mb-4">
                <Lock className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold mb-3">
                Zero Data Collection
              </h3>
              <p className="text-blue-200 text-sm">
                No servers, no tracking. Your learning materials never leave
                your device.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-full mb-4">
                <Download className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Client-Side AI</h3>
              <p className="text-blue-200 text-sm">
                OCR models run entirely in your browser using WebAssembly.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-green-600/20 rounded-full mb-4">
                <Globe className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Open Source</h3>
              <p className="text-blue-200 text-sm">
                Community-driven development. Contribute or customize freely.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://github.com/sieugene/yomikomi/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Code className="w-4 h-4 mr-2" />
              Contribute on GitHub
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Begin with dictionary setup and explore Japanese text analysis in
            minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dict"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Database className="w-5 h-5 mr-2" />
              Setup Dictionary
            </Link>
            <Link
              href="/simple-reader"
              className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Try Text Reader
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
