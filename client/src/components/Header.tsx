import { useState } from "react";
import { ShoppingCart, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoginDialog } from "@/components/LoginDialog";

interface HeaderProps {
  onCartClick?: () => void;
  onMenuClick?: () => void;
  cartItemCount?: number;
}

export default function Header({ onCartClick, onMenuClick, cartItemCount = 0 }: HeaderProps) {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Menu (mobile) */}
          <div className="flex items-center gap-4 lg:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Logo and Navigation */}
          <div className="flex flex-1 items-center justify-center lg:justify-start gap-12">
            <a href="/" className="text-xl font-light tracking-wider" data-testid="link-logo">
              MINIMAL
            </a>
            
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href="/shop"
                className="text-sm uppercase tracking-wider text-foreground hover:text-foreground/70 transition-colors"
                data-testid="link-shop"
              >
                Shop
              </a>
              <a
                href="/collections"
                className="text-sm uppercase tracking-wider text-foreground hover:text-foreground/70 transition-colors"
                data-testid="link-collections"
              >
                Collections
              </a>
              <a
                href="/about"
                className="text-sm uppercase tracking-wider text-foreground hover:text-foreground/70 transition-colors"
                data-testid="link-about"
              >
                About
              </a>
            </nav>
          </div>

          {/* Right: Search, Account, Cart */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="hidden md:flex"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLoginDialogOpen(true)}
              data-testid="button-account"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onCartClick}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </header>
  );
}
