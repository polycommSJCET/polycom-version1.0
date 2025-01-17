import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full border-b border-slate-300/50 bg-slate-200/95 px-6 py-4 shadow-sm backdrop-blur-lg">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative overflow-hidden rounded-xl p-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-300">
          <Image
            src="/icons/logo.svg"
            width={24}
            height={24}
            alt="logo"
            className="max-sm:size-6 relative z-10 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent max-sm:hidden hover:from-indigo-500 hover:to-blue-500 transition-all duration-300">
          POLYCOMM
        </p>
      </Link>
      <div className="flex-between gap-6">
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "size-9 hover:scale-105 transition-transform duration-300",
                userButtonPopoverCard: "bg-slate-100 shadow-lg",
                userButtonPopoverText: "!text-black font-medium",
                userButtonPopoverActionButton: "!text-black hover:!text-black hover:bg-slate-200",
                userButtonPopoverActionButtonText: "!text-black",
                userPreviewMainIdentifier: "!text-black font-semibold",
                userPreviewSecondaryIdentifier: "!text-slate-700",
                userButtonPopoverFooter: "border-slate-200",
                // Add darker colors for icons
                userButtonPopoverActionButtonIcon: "!text-slate-900 opacity-90",
                userButtonPopoverIcon: "!text-slate-900",
                userButtonPopoverActionButtonIconBox: "!text-slate-900 bg-slate-200/80"
              }
            }}
          />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
