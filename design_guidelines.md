# Design Guidelines: Minimal Modern Clothing E-commerce

## Design Approach
**Reference-Based:** Inspired by COS and Everlane's photography-forward aesthetic - prioritizing large, high-quality product imagery with generous whitespace and minimal UI elements.

## Typography System
- **Primary Font:** Inter (Google Fonts)
- **Fallback:** Helvetica Neue, system-ui
- **Hierarchy:**
  - Hero/Headlines: 3xl-4xl (48-60px), font-light
  - Product Names: xl-2xl (24-30px), font-normal
  - Section Titles: 2xl (30px), font-medium
  - Body/Descriptions: base-lg (16-18px), font-light
  - UI Elements/Labels: sm-base (14-16px), font-normal, uppercase tracking-wider
  - Price/Meta: base (16px), font-medium

## Layout System
**Tailwind Spacing Primitives:** Use 4, 6, 8, 12, 16, 20, 24, 32 for consistency
- Container: max-w-7xl with px-6 (mobile) to px-12 (desktop)
- Section Spacing: py-16 (mobile) to py-24 (desktop)
- Component Spacing: gap-8 to gap-12 between major elements
- Grid Gaps: gap-4 (mobile) to gap-6 (desktop)

## Core Components

### Navigation
- Minimal header with logo (left), primary navigation (center), cart/account icons (right)
- Fixed on scroll with subtle border-bottom in #E5E5E5
- Height: h-16 to h-20
- Links: Subtle hover underline, no background changes

### Product Grid
- Grid: grid-cols-2 (mobile) to grid-cols-3 lg:grid-cols-4 (desktop)
- Each card: Minimal border on hover only
- Product image: aspect-[3/4], object-cover, grayscale on initial load, full color on hover
- Product info below image: Name, price, available colors (small dots)
- Quick add button: Appears on hover, blurred background overlay

### Product Detail Page
- Two-column layout: Product gallery (60%) | Product info (40%)
- Gallery: Large main image with thumbnail strip below
- Info panel: Product name, price, description, variant selectors (size/color), add to cart CTA
- Size selector: Grid of buttons, border highlight on selection
- Color selector: Color swatches with border on selection
- Availability: Small text indicator per size/color combo

### Shopping Cart
- Slide-in panel from right (w-full max-w-md)
- Line items: Product thumbnail (left), name/variant/price (center), quantity controls + remove (right)
- Sticky footer with subtotal and checkout CTA

### Checkout Flow
- Single-page layout with left content area (order summary) and right form area
- Form: Clean inputs with bottom border only, generous spacing (space-y-6)
- Progress indicator at top (subtle dots)

### Admin Panel
- Simple sidebar navigation (left) with main content area
- Tables: Minimal styling with row hover states
- Forms: Same clean input style as frontend
- Action buttons: Primary (black) and secondary (outlined) variants

## Animations
**Minimal approach - use sparingly:**
- Product grid hover: transition-all duration-300 (image color, add button fade-in)
- Cart slide-in: transform transition
- Page transitions: Simple fade

## Images
### Hero Section
Large, full-width hero image showcasing lifestyle/editorial photography:
- Height: h-[70vh] to h-[80vh]
- Overlay: Subtle dark gradient (bottom) for text readability
- Content: Centered or left-aligned headline + subtitle with blurred-background CTA button
- Image style: High-quality lifestyle shot, muted tones, spacious composition

### Product Images
- Aspect ratio: 3:4 portrait orientation
- Style: Clean white or minimal background, consistent lighting
- Multiple views: Front, back, detail shots, lifestyle context
- Hover state: Swap to alternate view

### Additional Imagery
- Category pages: Editorial-style banner images
- About page: Team/studio photography with generous whitespace
- No images in cart, checkout, or admin sections

## Color Application
- Backgrounds: #FFFFFF (main), #F8F8F8 (alternating sections)
- Text: #333333 (primary), #000000 (headlines/emphasis)
- Borders/Dividers: #E5E5E5
- CTAs: #000000 background with #FFFFFF text, hover: slightly transparent
- Success states: #22C55E (order confirmation, stock availability)
- Out of stock: #333333 with strikethrough

## Key Principles
1. **Photography First:** Let product images dominate, UI recedes
2. **Generous Whitespace:** Don't crowd elements, embrace breathing room
3. **Subtle Hierarchy:** Use size and weight variations, not color
4. **Purposeful Interactions:** Hover states reveal functionality without distraction
5. **Mobile Elegance:** Stack gracefully, maintain spacious feel even on small screens