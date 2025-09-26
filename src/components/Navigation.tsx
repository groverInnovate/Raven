import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`ghost-nav ${className}`}>
      <div className="ghost-container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              👻 GhostPalace
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className={isActive('/') ? 
                "bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium" :
                "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              }
            >
              Home
            </Link>
            <Link
              href="/listings"
              className={isActive('/listings') ? 
                "bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium" :
                "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              }
            >
              Browse Listings
            </Link>
            <Link
              href="/dashboard"
              className={isActive('/dashboard') ? 
                "bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium" :
                "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/onboarding"
              className="ghost-button-primary px-4 py-2 text-sm rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
