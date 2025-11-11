export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-light tracking-wider">MINIMAL</h3>
            <p className="text-sm font-light text-muted-foreground">
              Timeless essentials for modern living
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="text-sm font-normal uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li>
                <a href="/shop/new" className="hover:text-foreground transition-colors" data-testid="link-new-arrivals">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/shop/clothing" className="hover:text-foreground transition-colors" data-testid="link-clothing">
                  Clothing
                </a>
              </li>
              <li>
                <a href="/shop/accessories" className="hover:text-foreground transition-colors" data-testid="link-accessories">
                  Accessories
                </a>
              </li>
              <li>
                <a href="/shop/sale" className="hover:text-foreground transition-colors" data-testid="link-sale">
                  Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-normal uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li>
                <a href="/help" className="hover:text-foreground transition-colors" data-testid="link-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/shipping" className="hover:text-foreground transition-colors" data-testid="link-shipping">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/returns" className="hover:text-foreground transition-colors" data-testid="link-returns">
                  Returns
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-normal uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-foreground transition-colors" data-testid="link-about-footer">
                  About
                </a>
              </li>
              <li>
                <a href="/sustainability" className="hover:text-foreground transition-colors" data-testid="link-sustainability">
                  Sustainability
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-foreground transition-colors" data-testid="link-careers">
                  Careers
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8 text-center text-sm font-light text-muted-foreground">
          © 2024 Minimal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
