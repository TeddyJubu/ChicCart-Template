import { Button } from "@/components/ui/button";
import heroImage from '@assets/generated_images/Hero_lifestyle_fashion_image_83b2bf3f.png';

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-6 text-5xl font-light tracking-wide text-white md:text-6xl lg:text-7xl">
            MINIMAL
          </h1>
          <p className="mb-8 max-w-2xl text-xl font-light text-white/90 md:text-2xl">
            Timeless essentials crafted for modern living
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
            data-testid="button-login"
          >
            Sign In to Shop
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="grid gap-16 md:grid-cols-3">
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-normal uppercase tracking-wider">Premium Quality</h3>
            <p className="text-sm font-light text-muted-foreground">
              Carefully selected materials and craftsmanship for lasting quality
            </p>
          </div>
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-normal uppercase tracking-wider">Minimal Design</h3>
            <p className="text-sm font-light text-muted-foreground">
              Clean lines and timeless aesthetics that never go out of style
            </p>
          </div>
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-normal uppercase tracking-wider">Sustainable</h3>
            <p className="text-sm font-light text-muted-foreground">
              Ethically sourced and environmentally conscious production
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
