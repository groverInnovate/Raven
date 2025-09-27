"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button, Badge } from './ui';
import WalletConnect from './web3/WalletConnect';
import { cn } from '../lib/theme';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Marketplace' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/escrow', label: 'Escrow', badge: '2' },
  { href: '/simple-test', label: 'Simple Test' },
  { href: '/get-started', label: 'Get Started' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">GhostPalace</span>
              <span className="text-xs text-gray-500 -mt-1">P2P Marketplace</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="danger" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <WalletConnect />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}>
                      <div className="flex items-center">
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="danger" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <WalletConnect className="w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
