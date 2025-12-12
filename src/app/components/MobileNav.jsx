"use client";

import Link from "next/link";
import { HomeIcon, UserIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Library", href: "/library", icon: BookOpenIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-300 flex justify-around py-2">
      {menu.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center text-xs ${
              active ? "text-black" : "text-black/50"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
