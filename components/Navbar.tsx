"use client"

import { navbarData } from "@/utils/CmdModal"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"


export default function Navbar(){
    const router = useRouter()
    const pathname = usePathname()

    const {theme, setTheme} = useTheme()

    return (
        <div className="fixed  top-6 right-1/2 translate-x-1/2 px-2 py-5 h-[38px] flex items-center rounded-4xl bg-[#161614]/80 backdrop-blur-2xl border border-white/20 shadow-2xl space-x-3">
          {navbarData.map((data, index) => (
            <button
              key={index}
              onClick={() => router.push(data.link)}
              className={`px-3.5 py-1.5 text-sm cursor-pointer text-[#E0E0C7] rounded-4xl font-outfit capitalize transition-colors duration-300 ${
                pathname === data.link ? "bg-gradient-to-br from-[#515150] to-[#31312F] " : "hover:bg-[#2a2a28]"
              }`}
            >
              {data.title}
            </button>
          ))}
          <button className="px-3.5 py-1.5 text-sm rounded-3xl text-[#E0E0C7] bg-gradient-to-br from-[#323230]  to-[#515150] cursor-pointer capitalize transition-colors duration-300 whitespace-nowrap">Click me</button>
        </div>
      );
      
}