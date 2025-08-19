import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col h-full bg-background overflow-auto">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
