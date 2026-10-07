import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ApplyProvider } from "@/components/site/ApplyProvider";
import { FloatingActions } from "@/components/site/Chatbot";
import { getActiveJobs } from "@/lib/queries";
import { getCandidateSession } from "@/lib/candidate-auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [jobs, session] = await Promise.all([getActiveJobs().catch(() => []), getCandidateSession()]);
  return (
    <ApplyProvider>
      <div className="grain">
        <Nav signedIn={!!session} />
        <main>{children}</main>
        <Footer />
        <FloatingActions jobs={jobs} />
      </div>
    </ApplyProvider>
  );
}
