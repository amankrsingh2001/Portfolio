"use client"

import Landing from "@/components/Landing";
import CommandModal from "@/components/modal/CommandModal";
import Navbar from "@/components/Navbar";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const {theme, setTheme} = useTheme()

  return (
        <div className="w-screen h-screen">
          <Navbar/>
          <Landing/>
          
        </div>
      );
}
