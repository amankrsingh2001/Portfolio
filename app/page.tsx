

import Landing from "@/components/Landing";
import CommandModal from "@/components/modal/CommandModal";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  return (
        <div className="w-screen h-screen">
          <Landing/>
        </div>
      );
}
