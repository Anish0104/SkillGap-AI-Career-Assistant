
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Upload, FileSearch, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="px-6 lg:px-10 h-16 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity" href="#">
          SkillGap
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#how-it-works">
            How It Works
          </Link>
          <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium hover:text-primary hover:bg-primary/10">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="text-sm font-bold rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-28 relative overflow-hidden">
          {/* Enhanced Background Gradients and Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none animate-pulse duration-[8000ms]" />
          <div className="absolute -bottom-24 -right-24 w-[700px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="container px-4 md:px-6 relative z-10 mx-auto text-center space-y-10">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-primary shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Next-Gen AI Career Assistant</span>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl leading-[1.1] animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
                Bridge the Gap to Your <span className="text-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.15)]">Future Career</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                SkillGap leverages advanced AI to dissect job market requirements and align your professional profile with your most ambitious career goals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300 justify-center">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Propel Your Career <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full glass-card hover:bg-background/80 transition-all">
                  Explore Capabilities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-40" />

          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Powerful AI for Every Job Seeker</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto text-base font-medium leading-relaxed">Our sophisticated engine works behind the scenes to give you an unfair advantage in the competitive job market.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Precision Parsing",
                  desc: "Our neural network accurately extracts structured data from even the most complex resume layouts in seconds.",
                  icon: Upload,
                  color: "blue"
                },
                {
                  title: "Intelligent Gap Analysis",
                  desc: "Identify missing competencies with sub-skill granularity, ensuring you never miss a critical requirement.",
                  icon: FileSearch,
                  color: "indigo"
                },
                {
                  title: "Match Optimization",
                  desc: "Actionable insights to tailor your applications for specific ATS algorithms and recruiter preferences.",
                  icon: TrendingUp,
                  color: "purple"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefit Section (Checks + Visual) */}
        <section id="how-it-works" className="w-full py-24 bg-secondary/30 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">Elevate Your Career with SkillGap</h2>
                <ul className="grid gap-5">
                  {[
                    { text: "Increase interview callback rates by 3x", color: "text-blue-500" },
                    { text: "Save hours tailoring resumes manually", color: "text-indigo-500" },
                    { text: "Discover hidden keywords ATS systems look for", color: "text-purple-500" },
                    { text: "Track all your applications in one place", color: "text-green-500" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 group">
                      <div className="p-1.5 rounded-full bg-background shadow-sm border border-border/50 transition-transform group-hover:scale-110 duration-300">
                        <CheckCircle2 className={`h-5 w-5 ${item.color} flex-shrink-0`} />
                      </div>
                      <span className="text-base text-foreground/80 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block w-fit pt-2">
                  <Button className="h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">Start Your Free Analysis</Button>
                </Link>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-indigo-500 rounded-3xl blur-2xl opacity-5 group-hover:opacity-10 transition-opacity duration-700" />
                <div className="relative rounded-3xl border border-border/50 bg-card shadow-xl p-8 aspect-video flex flex-col gap-6 overflow-hidden backdrop-blur-sm">
                  <div className="flex items-center gap-5 border-b border-border/40 pb-6">
                    <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-muted rounded-full animate-pulse" />
                      <div className="h-3.5 w-28 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-muted rounded-full animate-pulse" />
                    <div className="h-4 w-[94%] bg-muted rounded-full animate-pulse" />
                    <div className="h-4 w-[86%] bg-muted rounded-full animate-pulse" />
                  </div>

                  {/* Floating Match Score Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md shadow-xl border border-border/50 rounded-2xl p-5 flex items-center gap-4 animate-float">
                    <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-green-500/20">94%</div>
                    <div>
                      <div className="text-base font-bold">Match Score</div>
                      <div className="text-xs font-medium text-muted-foreground">Perfect Candidate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 text-center">
          <div className="container px-4 md:px-6 mx-auto max-w-2xl space-y-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to Bridge the Gap?</h2>
            <p className="text-muted-foreground text-base">Join thousands of job seekers who use SkillGap to land their dream roles faster.</p>
            <Link href="/login">
              <Button size="lg" className="h-12 px-10 text-base rounded-full shadow-lg">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-border/40">
        <div className="container px-4 md:px-10 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SkillGap</span>
            <span className="text-muted-foreground/30">|</span>
            <p className="text-sm text-muted-foreground font-medium">© 2024 SkillGap. All rights reserved.</p>
          </div>
          <nav className="flex gap-10">
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
