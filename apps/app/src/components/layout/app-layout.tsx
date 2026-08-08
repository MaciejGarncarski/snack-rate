import { Navbar } from "#/components/layout/navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="relative isolate mx-auto flex min-h-svh max-w-6xl flex-col p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
