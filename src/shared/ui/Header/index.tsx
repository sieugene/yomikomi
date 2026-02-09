"use client";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/shared/routes";
import { Button } from "@/shared/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  BookOpen,
  Camera,
  Home,
  Import,
  Menu,
  Scan,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: ROUTES.home,
    icon: Home,
    isActive: (pathname) => pathname === ROUTES.home,
  },
  {
    label: "Anki Import",
    href: ROUTES.ankiImport,
    icon: Import,
    isActive: (pathname) => pathname === ROUTES.ankiImport,
  },
  {
    label: "Albums",
    href: ROUTES.albums,
    icon: Scan,
    isActive: (pathname) => pathname === ROUTES.albums,
  },
  {
    label: "Dictionary",
    href: ROUTES.dict,
    icon: BookOpen,
    isActive: (pathname) => pathname === ROUTES.dict,
  },
  {
    label: "OCR Capture",
    href: ROUTES.ocrCapture,
    icon: Camera,
    isActive: (pathname) => pathname === ROUTES.ocrCapture,
  },
  {
    label: "Reader",
    href: ROUTES.simpleReaderRoot,
    icon: Settings,
    isActive: (pathname) => pathname.includes(ROUTES.simpleReaderRoot),
  },
  {
    label: "Favorites",
    href: ROUTES.favorites,
    icon: Settings,
    isActive: (pathname) => pathname.includes(ROUTES.favorites),
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
    isActive: (pathname) => pathname === ROUTES.settings,
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={ROUTES.home} className="mr-6 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Yomikomi
            </span>
          </Link>
        </div>

        <div className="mr-4 hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.isActive?.(pathname) || pathname === item.href;
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                        isActive && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Link href={item.href} className="flex">
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex md:hidden">
          <Link href={ROUTES.home} className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Yomikomi
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Placeholder for search or other components */}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Scan className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    OCR Reader
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.isActive?.(pathname) || pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          "w-fit flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
