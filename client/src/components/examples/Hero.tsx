import Hero from '../Hero'
import heroImage from '@assets/generated_images/Hero_lifestyle_fashion_image_83b2bf3f.png'

export default function HeroExample() {
  return (
    <Hero
      imageSrc={heroImage}
      title="Timeless Essentials"
      subtitle="Minimal designs crafted for modern living"
      ctaText="Explore Collection"
      onCtaClick={() => console.log('CTA clicked')}
    />
  )
}
