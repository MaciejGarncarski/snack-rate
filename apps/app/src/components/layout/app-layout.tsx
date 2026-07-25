import { Navbar } from "#/components/layout/navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="relative isolate mx-auto flex min-h-svh max-w-5xl flex-col p-8">
        {children}
      </div>
    </div>
  );
}
