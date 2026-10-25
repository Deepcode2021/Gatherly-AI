import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  Lightbulb,
  ArrowRight,
  Shield,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0EB] text-[#1F3E2E] text-xs font-medium border border-[#C5D9CD]">
                <Sparkles className="w-3.5 h-3.5 text-[#2D5A43]" />
                <span>PromptWars Virtual — Challenge 5 Winner Submission</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#182620] leading-[1.12]">
                Every celebration,{' '}
                <span className="text-[#2D5A43] underline decoration-[#C85A32] decoration-wavy decoration-2">
                  thoughtfully
                </span>{' '}
                planned.
              </h1>

              <p className="text-lg sm:text-xl text-[#5C6E64] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Transform scattered event ideas into an actionable, editable workspace.
                Tailored for weddings, milestone birthdays, anniversaries, college fests, and community gatherings across India.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full sm:w-auto text-base shadow-md hover:shadow-lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Plan an Event
                  </Button>
                </Link>

                <Link href="/events/demo-bhopal-30th-birthday" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base border-[#D4C6B6]"
                    leftIcon={<Sparkles className="w-4 h-4 text-[#C85A32]" />}
                  >
                    Explore Demo Plan
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5C6E64]">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#2D5A43]" /> 100% Offline-First (localStorage)
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#2D5A43]" /> Deterministic INR Math
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2D5A43]" /> Structured Data, Not Chatbot Dumps
                </span>
              </div>
            </div>

            {/* Interactive Live Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-1.5 rounded-3xl bg-linear-to-r from-[#2D5A43]/20 via-[#C85A32]/20 to-[#E6AF2E]/20 blur-xl opacity-70" />

                <Card className="relative bg-white/95 border-[#D4C6B6] shadow-xl p-6 space-y-5 backdrop-blur-sm">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="coral" size="sm" className="mb-1.5">
                        Sample Milestone Celebration
                      </Badge>
                      <h2 className="text-lg font-bold text-[#182620]">
                        Aarav&apos;s 30th Rooftop Sunset Birthday
                      </h2>
                      <p className="text-xs text-[#5C6E64] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" /> 24 days away • Bhopal, MP • 60 Guests
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-[10px] text-[#5C6E64] uppercase tracking-wider font-semibold">
                          Readiness
                        </span>
                        <span className="text-xl font-extrabold text-[#2D5A43]">82/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Health Bar */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#182620]">Target Budget: ₹40,000</span>
                      <span className="text-[#2D5A43] font-semibold">₹38,400 allocated (96%)</span>
                    </div>
                    <ProgressBar value={96} color="sage" size="md" />
                    <div className="flex justify-between text-[11px] text-[#5C6E64] pt-0.5">
                      <span>Buffet: ₹16,000 (Live Chaat & Pasta)</span>
                      <span>Buffer: ₹1,600 safe</span>
                    </div>
                  </div>

                  {/* Quick Task & Vendor Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#E8F0EB] border border-[#C5D9CD] flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#2D5A43] shrink-0" />
                      <div>
                        <div className="font-bold text-[#1F3E2E]">3 of 7 Done</div>
                        <div className="text-[11px] text-[#5C6E64]">Checklist tasks</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FDF1EB] border border-[#F2CBB9] flex items-center gap-2.5">
                      <Users className="w-5 h-5 text-[#C85A32] shrink-0" />
                      <div>
                        <div className="font-bold text-[#943916]">2 of 4 Booked</div>
                        <div className="text-[11px] text-[#5C6E64]">Vendors locked</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Idea Snippet */}
                  <div className="p-3 rounded-xl bg-white border border-[#E5DDD3] flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-[#182620] block">Sunset Polaroid Memory Wall</strong>
                      <span className="text-[#5C6E64] line-clamp-1">
                        Guests peg Polaroid photos and handwritten memories on rustic jute twine.
                      </span>
                    </div>
                  </div>

                  <Link href="/events/demo-bhopal-30th-birthday" className="block">
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Open Full Interactive Demo Plan
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-16 bg-white border-y border-[#E5DDD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="sage">Why Gatherly AI?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#182620]">
              More than a chatbot. A real celebration workspace.
            </h2>
            <p className="text-base text-[#5C6E64]">
              Chatbots give you generic text blocks that get lost in scroll history.
              Gatherly AI translates AI recommendations into interactive, editable tables, checklists, and trackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Deterministic Budgeting */}
            <Card className="hover:border-[#2D5A43] transition-colors p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0EB] text-[#2D5A43] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182620]">Deterministic Budgeting</h3>
              <p className="text-xs text-[#5C6E64] leading-relaxed">
                Zero hallucinated calculations. Every user edit recalculates totals, category splits, and overspending warnings immediately in INR.
              </p>
            </Card>

            {/* Pillar 2: Relative Timeline & Checklist */}
            <Card className="hover:border-[#2D5A43] transition-colors p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1EB] text-[#C85A32] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182620]">Timeline & Checklist</h3>
              <p className="text-xs text-[#5C6E64] leading-relaxed">
                AI proposes relative day offsets from your event date. Real dates are computed in TypeScript using date-fns, tracking overdue deadlines.
              </p>
            </Card>

            {/* Pillar 3: Practical Vendor Planner */}
            <Card className="hover:border-[#2D5A43] transition-colors p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182620]">Vendor Pipeline</h3>
              <p className="text-xs text-[#5C6E64] leading-relaxed">
                Track status from initial inquiry to booking. Includes tailored interview questions to ask caterers, venues, and photographers.
              </p>
            </Card>

            {/* Pillar 4: Real Readiness Score */}
            <Card className="hover:border-[#2D5A43] transition-colors p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2ECE4] text-[#182620] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182620]">Event Readiness Score</h3>
              <p className="text-xs text-[#5C6E64] leading-relaxed">
                Transparent 0-100 score derived from checklist completion, vendor contracts, budget health, and outdoor contingency preparedness.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How AI Assists Section */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="coral">Engineered for Indian Events</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#182620] leading-tight">
                Deep cultural nuance, from Jain chaat counters to outdoor monsoon backup.
              </h2>
              <p className="text-[#5C6E64] text-base leading-relaxed">
                Whether planning a Sangeet with loud music curfews, a Bhopal rooftop 30th birthday with sunset golden hour photos, or an engineering college fest with battle-of-the-bands, Gatherly AI delivers realistic category distributions and practical questions.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#182620]">Preserves your edits during regeneration:</strong>
                    <span className="text-[#5C6E64] block text-xs">
                      Regenerate ideas or tasks without overwriting your entered vendor quotes or completed tasks.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#182620]">Print-friendly PDF Export:</strong>
                    <span className="text-[#5C6E64] block text-xs">
                      One-click print view designed for sharing clean physical agendas with family and vendor coordinators.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#182620]">JSON Backup & Recovery:</strong>
                    <span className="text-[#5C6E64] block text-xs">
                      Export your complete plan to JSON anytime and restore it across devices with built-in schema validation.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/create">
                  <Button size="lg" variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Step breakdown */}
            <div className="space-y-4">
              <Card className="p-5 border-l-4 border-l-[#2D5A43] bg-white space-y-1">
                <span className="text-xs font-semibold text-[#2D5A43] uppercase tracking-wider">Step 1</span>
                <h3 className="text-base font-bold text-[#182620]">Enter Event Parameters Once</h3>
                <p className="text-xs text-[#5C6E64]">
                  Specify budget in INR, expected guests, location, venue style (indoor/outdoor/mixed), and dietary priorities.
                </p>
              </Card>

              <Card className="p-5 border-l-4 border-l-[#C85A32] bg-white space-y-1">
                <span className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider">Step 2</span>
                <h3 className="text-base font-bold text-[#182620]">AI Synthesizes Structured Workspace</h3>
                <p className="text-xs text-[#5C6E64]">
                  Google Gemini 2.5 Flash produces typed JSON schemas: itemized budgets, task deadlines, vendor questions, and theme rationale.
                </p>
              </Card>

              <Card className="p-5 border-l-4 border-l-[#E6AF2E] bg-white space-y-1">
                <span className="text-xs font-semibold text-[#92400E] uppercase tracking-wider">Step 3</span>
                <h3 className="text-base font-bold text-[#182620]">Track, Adjust, and Execute</h3>
                <p className="text-xs text-[#5C6E64]">
                  Edit actual costs as real vendor quotes come in. Check off completed items and watch your Readiness Score climb.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-[#2D5A43] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to plan your next milestone?
          </h2>
          <p className="text-base sm:text-lg text-[#E8F0EB] max-w-2xl mx-auto">
            Create an event in under 60 seconds or test drive our bundled Bhopal celebration demo without needing an API key.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/create" className="w-full sm:w-auto">
              <Button size="lg" variant="accent" className="w-full sm:w-auto text-base">
                Create My Event Plan
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
