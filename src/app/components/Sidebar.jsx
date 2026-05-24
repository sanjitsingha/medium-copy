"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon as HomeOutline,
  UserIcon as UserOutline,
  BookOpenIcon as BookOutline,
  ChartBarIcon as ChartOutline,
  QueueListIcon as QueueOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
  BookOpenIcon as BookSolid,
  ChartBarIcon as ChartSolid,
  QueueListIcon as QueueSolid,
} from "@heroicons/react/24/solid";

const menu = [
  { name: "Home", href: "/", outline: HomeOutline, solid: HomeSolid },
  { name: "Library", href: "/library", outline: BookOutline, solid: BookSolid },
  { name: "Profile", href: "/profile", outline: UserOutline, solid: UserSolid },
  {
    name: "Stories",
    href: "/stories",
    outline: QueueOutline,
    solid: QueueSolid,
  },
  { name: "Stats", href: "/stats", outline: ChartOutline, solid: ChartSolid },
];
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col sticky top-[64px] w-60 h-[calc(100vh-64px)]  py-8">
      <nav className="flex flex-col gap-2 px-6">
        {menu.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = active ? item.solid : item.outline;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-6 py-2.5 text-[15px] transition-all
        ${active ? "text-black" : "text-black/50 hover:text-black"}
      `}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-black rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {/* <div className=" flex flex-col w-full  h-full">
        <div className="flex-1"></div>
        <div className=" flex gap-4 pl-8">
          <Link target="_blank" href="/privacy-policy" className="text-black/30 border-r pr-4 border-gray-300 text-[11px] font-medium">
            Privacy Policy
          </Link>
          <Link target="_blank" href="/terms-and-conditions" className="text-black/30 text-[11px] font-medium">
            Terms and conditions
          </Link>
        </div>

      </div> */}
    </aside>
  );
}
