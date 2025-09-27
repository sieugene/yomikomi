import React from "react";
import {
  BookOpen,
  Database,
  Image,
  Lock,
  Zap,
  Download,
  Search,
  Eye,
  Globe,
  Code,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Anki Integration",
      description:
        "Import and browse your Anki decks with full search capabilities. All data stored locally for instant access without re-importing.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "JMdict Dictionary Support",
      description: "Import JMdict dictionaries with deep search functionality.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Advanced OCR",
      description:
        "Extract Japanese text from images with support for both vertical and horizontal text. Powered by compressed AI models running entirely client-side.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Complete Privacy",
      description:
        "Everything runs in your browser. No data sent to servers, no third-party access. Your learning materials stay completely private.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Offline Ready",
      description:
        "Works with weak internet connections. Content is cached locally with planned PWA support for full offline functionality.",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Text Reader",
      description:
        "Paste any Japanese text for instant analysis. Double-click recognized text blocks to access dictionary definitions seamlessly.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const useCases = [
    {
      step: "1",
      title: "Import Dictionary",
      description:
        "Load your preferred JMdict dictionary (English/Russian supported)",
    },
    {
      step: "2",
      title: "Create Album",
      description:
        "Upload images from books, manga, or any Japanese text source",
    },
    {
      step: "3",
      title: "OCR Analysis",
      description:
        "Let AI extract and recognize all Japanese text with precise positioning",
    },
    {
      step: "4",
      title: "Interactive Reading",
      description:
        "Click any text block to instantly look up words and meanings",
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
              100% Client-Side • Privacy First • Offline Ready
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Improve your Japanese
              <br />
              studying with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Yomikomi
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              A comprehensive Japanese learning tool with OCR, dictionary
              lookup, and Anki integration.
              <span className="font-semibold text-gray-800">
                {" "}
                Everything runs in your browser
              </span>{" "}
              - no servers, complete privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                <Eye className="w-5 h-5 mr-2" />
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Learn Japanese
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools designed for serious Japanese learners, all running
            securely in your browser
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="h-full relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with this simple workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-full mb-6">
                  {useCase.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Technical Benefits */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Built for Privacy & Performance
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Advanced technology meets user privacy in a seamless learning
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-blue-600/20 rounded-full mb-6">
                <Lock className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Zero Data Collection
              </h3>
              <p className="text-blue-200">
                No servers, no tracking, no data transmission. Your learning
                materials never leave your device.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-full mb-6">
                <Download className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Client-Side AI</h3>
              <p className="text-blue-200">
                Advanced OCR models run entirely in your browser using
                WebAssembly for maximum privacy.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex p-4 bg-green-600/20 rounded-full mb-6">
                <Globe className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Offline Capable</h3>
              <p className="text-blue-200">
                Works with poor internet. Content cached locally with planned
                PWA support for full offline use.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Plans */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Roadmap & Future Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔄 Anki-Dictionary Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Seamlessly integrate your personal Anki cards and mnemonics into
                dictionary lookups for personalized learning.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📱 Full PWA Support
              </h3>
              <p className="text-gray-600 text-sm">
                Complete offline functionality with Progressive Web App features
                for mobile-first learning.
              </p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Open Source & Community Driven
            </h3>
            <p className="text-blue-100 mb-6 max-w-3xl mx-auto">
              Built for personal use and shared with the community. Not
              commercial - just passionate about making Japanese learning
              accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                <Code className="w-4 h-4 mr-2" />
                View on GitHub
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                💡 Suggest Features
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Accelerate Your Japanese Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Start using the most privacy-focused Japanese learning tool
            available. No registration required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Import Your First Deck
            </button>
            <button className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              <Image className="w-5 h-5 mr-2" />
              Try OCR Recognition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
