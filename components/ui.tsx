import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | false | undefined | null>) {
  return twMerge(clsx(classes));
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen quest-grid px-4 py-6 sm:px-8">{children}</main>;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-ink/10 bg-white/92 p-5 shadow-soft", className)}>{children}</section>;
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-teal text-white hover:bg-teal/90",
        variant === "secondary" && "border border-ink/15 bg-white text-ink hover:bg-mint/50",
        variant === "danger" && "bg-coral text-white hover:bg-coral/90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-11 w-full rounded-md border border-ink/15 bg-white px-3 py-2 outline-none ring-teal/20 focus:ring-4"
      {...props}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 w-full rounded-md border border-ink/15 bg-white px-3 py-2 outline-none ring-teal/20 focus:ring-4"
      {...props}
    />
  );
}

