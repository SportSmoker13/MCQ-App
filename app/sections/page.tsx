import { auth } from "@/lib/auth";
import { getSections } from "@/actions/sections";
import { SectionManager } from "@/components/sections/SectionManager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SectionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sections = await getSections();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
          <Layers className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Sections</h1>
          <p className="text-slate-400 mt-1">
            Create and organize categories for your question bank.
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Your Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionManager initialSections={sections} />
        </CardContent>
      </Card>
    </div>
  );
}
