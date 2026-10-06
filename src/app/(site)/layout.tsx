import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ApplyProvider } from "@/components/site/ApplyProvider";
import { FloatingActions } from "@/components/site/Chatbot";
import { getActiveJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const jobs = await getActiveJobs().catch(() => []);
  return (
    <ApplyProvider>
      <div className="grain">
        <Nav />
        <main>{children}</main>
        <Footer />
        <FloatingActions jobs={jobs} />
      </div>
    </ApplyProvider>
  );
}
