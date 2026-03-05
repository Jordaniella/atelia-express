import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
// import { Button } from @/components/ui/Button';
import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for testing the waters",
      features: [
        "1 Launch Project",
        "20 AI Generations/month",
        "Content Agents",
        "Basic Visual Studio",
        "Email Support",
      ],
      limitations: ["Limited visual styles", "Basic automation templates"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Pro",
      price: 99,
      description: "For serious launchers",
      features: [
        "5 Launch Projects",
        "100 AI Generations/month",
        "Full Content Agents",
        "Complete Visual Studio",
        "All Automation Templates",
        "Priority Support",
        "Export capabilities",
      ],
      limitations: [],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Scale",
      price: 299,
      description: "For launch machines",
      features: [
        "Unlimited Projects",
        "Unlimited Generations",
        "Everything in Pro",
        "Custom Automation Flows",
        "Dedicated Success Manager",
        "API Access",
        "White-label Options",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I change plans later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What counts as a generation?",
      answer:
        "Each AI-generated content piece, visual, or automation template counts as one generation.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 14-day money-back guarantee on all plans. No questions asked.",
    },
    {
      question: "Can I export my generated content?",
      answer:
        "Yes, all generated content and visuals can be downloaded and used anywhere.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--color-ai-purple)]" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="mb-6">
              Launch Intelligence
              <br />
              For Every Scale
            </h1>
            <p className="text-xl text-gray-300">
              Start free. Scale as you grow. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                gradient={plan.popular}
                hover
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full gradient-purple text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>

                  <Link to="/register" className="block">
                    {/* <Button
                      variant={plan.popular ? 'primary' : 'secondary'}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button> */}
                  </Link>

                  <div className="space-y-3 pt-6 border-t border-white/10">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[var(--color-ai-purple)] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      {plan.limitations.map((limitation, lIndex) => (
                        <div key={lIndex} className="flex items-start gap-3">
                          <span className="text-gray-500 text-sm">
                            • {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--color-gray-dark)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <h3 className="text-xl mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
