import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import {
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Code2,
  Layers,
  Globe,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Auth-aware Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
          <div className="absolute top-40 left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Built with Next.js 15 + shadcn/ui
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Build faster with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
                modern tools
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A production-ready starter showcasing the power of Next.js, TypeScript, and shadcn/ui.
              Beautiful, accessible, and blazing fast.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="gap-2 px-8 h-12 text-base">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
                <Globe className="h-4 w-4" />
                View Demo
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t">
              {[
                { value: "10K+", label: "Developers" },
                { value: "99.9%", label: "Uptime" },
                { value: "<50ms", label: "Response Time" },
                { value: "4.9★", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete toolkit for building modern web applications with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Server-side rendering with edge runtime for sub-50ms responses worldwide.",
                color: "blue",
              },
              {
                icon: Sparkles,
                title: "Beautiful Design",
                description: "Accessible, customizable shadcn/ui components with dark mode built-in.",
                color: "purple",
              },
              {
                icon: Shield,
                title: "Type Safe",
                description: "Full TypeScript coverage with strict mode for catching errors at compile time.",
                color: "green",
              },
              {
                icon: Layers,
                title: "App Router",
                description: "Next.js 15 App Router with layouts, loading states, and error boundaries.",
                color: "orange",
              },
              {
                icon: Code2,
                title: "Developer Experience",
                description: "Hot reload, ESLint, Prettier, and comprehensive tooling out of the box.",
                color: "cyan",
              },
              {
                icon: Globe,
                title: "Production Ready",
                description: "Optimized builds, image optimization, and SEO best practices included.",
                color: "pink",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-border"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by developers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Alex Chen",
                role: "Frontend Engineer",
                initials: "AC",
                text: "The best Next.js starter I've used. Clean code, great design, and everything just works out of the box.",
              },
              {
                name: "Sarah Kim",
                role: "Full-Stack Developer",
                initials: "SK",
                text: "Saved me weeks of setup time. The shadcn/ui integration is seamless and the TypeScript support is excellent.",
              },
              {
                name: "Marcus Wright",
                role: "Tech Lead",
                initials: "MW",
                text: "We use this as the foundation for all our client projects. Reliable, maintainable, and beautiful.",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">Get Started</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build something amazing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sign up for free and start building your next project today.
            </p>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Free Starter</CardTitle>
                <CardDescription>Everything you need to get started</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {[
                    "Unlimited projects",
                    "Full component library",
                    "TypeScript support",
                    "Dark mode",
                    "Community support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth">
                  <Button className="w-full" size="lg">
                    Create Free Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Code2 className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">NextDemo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using Next.js and shadcn/ui
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="https://github.com/devmahdi/next-shadcn-demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
