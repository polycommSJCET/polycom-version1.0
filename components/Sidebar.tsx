'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between border-r border-slate-300/50 bg-slate-200/95 p-5 pt-28 text-slate-700 backdrop-blur-lg max-sm:hidden lg:w-[250px]">
      <div className="flex flex-1 flex-col gap-2">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-3 rounded-xl justify-start transition-all duration-300 group hover:bg-slate-300/50',
                {
                  'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg': isActive,
                }
              )}
            >
              <div className={cn(
                'relative size-11 rounded-lg flex items-center justify-center bg-slate-400/70 group-hover:bg-slate-400/90 transition-colors shadow-sm',
                { 'bg-white/40': isActive }
              )}>
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={22}
                  height={22}
                  className={cn(
                    'transition-all duration-300 group-hover:scale-110 opacity-100 contrast-125 saturate-150',
                    { 'brightness-0 invert opacity-100': isActive }
                  )}
                />
              </div>
              <p className="text-[15px] font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
