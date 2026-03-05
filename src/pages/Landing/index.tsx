import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  FileText,
  Image,
  Workflow,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: "Content Agents",
      description:
        "Generate scripts, emails, social posts, and landing pages with AI-powered precision.",
    },
    {
      icon: Image,
      title: "AI Visual Studio",
      description:
        "Create stunning product visuals in studio, lifestyle, luxury, or minimal styles.",
    },
    {
      icon: Workflow,
      title: "Automation Engine",
      description:
        "Build complete marketing flows from welcome sequences to abandoned cart recovery.",
    },
  ];

  const useCases = [
    "Early-stage startups launching MVPs",
    "E-commerce brands releasing new products",
    "Personal brands building online presence",
    "SMBs entering new markets",
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Launch Project",
      description: "Define your product, audience, and brand voice in minutes.",
    },
    {
      number: "02",
      title: "Generate Your Assets",
      description:
        "AI creates content, visuals, and automations tailored to your launch.",
    },
    {
      number: "03",
      title: "Deploy & Scale",
      description: "Export everything you need and launch with confidence.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm">
              <Sparkles className="w-4 h-4 text-[var(--color-ai-purple)]" />
              <span>Launch Intelligence System</span>
            </div>

            <h1 className="text-gradient">
              Build. Launch. Scale.
              <br />
              With Intelligence.
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              The complete AI-powered platform that structures your product
              launch, generates premium content, creates stunning visuals, and
              automates your marketing machine.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/register">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--color-gray-dark)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="mb-6">The Problem</h2>
            <p className="text-xl text-gray-300">
              Most product launches fail because companies lack structure,
              cohesive assets, premium visuals, and automated systems. They're
              launching blind.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              "No Strategic Structure",
              "Inconsistent Assets",
              "Amateur Visuals",
              "Manual Processes",
            ].map((problem, index) => (
              <Card key={index}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✕</span>
                  </div>
                  <p className="text-sm font-medium">{problem}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="mb-6">Your Launch OS</h2>
            <p className="text-xl text-gray-300">
              Three powerful modules that transform how you launch products
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover gradient>
                <feature.icon className="w-12 h-12 text-[var(--color-ai-purple)] mb-6" />
                <h3 className="text-2xl mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--color-gray-dark)]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="mb-6">How It Works</h2>
            <p className="text-xl text-gray-300">
              Launch in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card>
                  <div className="text-6xl font-bold text-[var(--color-ai-purple)] opacity-20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-[var(--color-ai-purple)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="mb-6">Built For Launchers</h2>
            <p className="text-xl text-gray-300">
              Perfect for teams ready to launch with impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} hover>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[var(--color-ai-purple)]/10">
                    <Check className="w-6 h-6 text-[var(--color-ai-purple)]" />
                  </div>
                  <p className="text-lg flex-1">{useCase}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--color-gray-dark)]">
        <div className="max-w-4xl mx-auto text-center">
          <Card gradient>
            <Zap className="w-16 h-16 text-[var(--color-ai-purple)] mx-auto mb-6" />
            <h2 className="mb-6">Ready to Launch?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of companies using AtelIA to launch smarter, faster,
              and better.
            </p>
            <Link to="/register">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
