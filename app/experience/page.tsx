import type { Metadata } from "next";
import { Experience } from "../components/experience";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return <Experience />;
}
