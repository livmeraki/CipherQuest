import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui";
import { JoinForm } from "./JoinForm";

export default function JoinPage() {
  return <PageShell><AppNav /><div className="mx-auto max-w-xl"><JoinForm /></div></PageShell>;
}

