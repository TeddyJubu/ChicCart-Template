import { Button } from "@/components/ui/button";

interface HeroProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function Hero({ imageSrc, title, subtitle, ctaText = "Shop Now", onCtaClick }: HeroProps) {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt="Hero"
          className="h-full w-full object-cover"
        />
        {/* Dark wash gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-12">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-light tracking-wide text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg font-light text-white/90 md:text-xl">
              {subtitle}
            </p>
          )}
          <div>
            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
              data-testid="button-hero-cta"
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
