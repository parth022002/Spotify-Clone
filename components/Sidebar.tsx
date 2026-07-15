"use client";

import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { BsMagic, BsFileMusic } from "react-icons/bs";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

import SidebarItem from "./SidebarItem";
import Box from "./Box";
import Library from "./Library";
import MobileNavbar from "./MobileNavbar";

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
}

const Sidebar = ({ children, songs }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();

  const routes = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      active: pathname === '/',
      href: '/'
    },
    {
      icon: BiSearch,
      label: 'Search',
      href: '/search',
      active: pathname === '/search'
    },
    {
      icon: BsMagic,
      label: 'AI DJ',
      href: '/ai',
      active: pathname === '/ai'
    },
    {
      icon: BsFileMusic,
      label: 'Composer',
      href: '/composer',
      active: pathname === '/composer'
    },
  ], [pathname]);

  return (
    <div
      className={twMerge(`
        flex 
        h-[calc(100%-65px)]
        md:h-full
        w-full
        `,
        player.activeId && 'h-[calc(100%-145px)] md:h-[calc(100%-80px)]'
      )}
    >
      {/* Desktop Sidebar */}
      <div
        className="
          hidden 
          md:flex 
          flex-col 
          gap-y-2 
          bg-black 
          h-full 
          w-[300px] 
          p-2
          shrink-0
        "
      >
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>
        <Box className="overflow-y-auto h-full">
          <Library songs={songs} />
        </Box>
      </div>

      {/* Main Content Area */}
      <main className="h-full flex-1 overflow-y-auto py-2 px-2 md:px-0">
        {children}
      </main>

      {/* Mobile Glassmorphic Bottom Navigation Bar */}
      <MobileNavbar />
    </div>
  );
}

export default Sidebar;
