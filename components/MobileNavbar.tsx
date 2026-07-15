"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { BsMagic, BsFileMusic } from "react-icons/bs";
import { twMerge } from "tailwind-merge";

const MobileNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      icon: HiHome,
      label: "Home",
      active: pathname === "/",
      onClick: () => router.push("/"),
    },
    {
      icon: BiSearch,
      label: "Search",
      active: pathname === "/search",
      onClick: () => router.push("/search"),
    },
    {
      icon: BsMagic,
      label: "AI DJ",
      active: pathname === "/ai",
      onClick: () => router.push("/ai"),
    },
    {
      icon: BsFileMusic,
      label: "Composer",
      active: pathname === "/composer",
      onClick: () => router.push("/composer"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-800/80 px-6 py-2 pb-5 flex justify-between items-center shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center flex-1 py-1 text-neutral-400 active:scale-95 transition"
          >
            <Icon
              size={22}
              className={twMerge(
                "transition duration-200",
                item.active ? "text-white scale-110" : "text-neutral-400"
              )}
            />
            <span
              className={twMerge(
                "text-[10px] mt-1 tracking-wider font-medium transition duration-200",
                item.active ? "text-white font-bold" : "text-neutral-500"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNavbar;
