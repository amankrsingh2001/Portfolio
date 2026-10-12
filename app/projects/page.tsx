import type { Metadata } from "next";
import { Architecture } from "../components/architecture";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <Architecture />;
}
