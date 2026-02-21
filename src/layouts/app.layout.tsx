import { Header } from "@/shared/ui/Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)]">{children}</div>
    </>
  );
};
