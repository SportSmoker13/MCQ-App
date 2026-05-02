"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { createSection, deleteSection } from "@/actions/sections";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Section {
  id: string;
  name: string;
  _count?: { questions: number };
}

interface Props {
  initialSections: Section[];
}

export function SectionManager({ initialSections }: Props) {
  const [sections, setSections] = useState(initialSections);
  const [newName, setNewName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsPending(true);
    try {
      const section = await createSection(newName.trim());
      setSections(prev => [...prev, section].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      toast.success("Section created!");
    } catch (err) {
      toast.error("Failed to create section");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will un-tag all questions in this section.")) return;

    try {
      await deleteSection(id);
      setSections(prev => prev.filter(s => s.id !== id));
      toast.success("Section deleted");
    } catch (err) {
      toast.error("Failed to delete section");
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="New section name (e.g. Physics)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={isPending}
          className="bg-slate-950 border-slate-700 text-white rounded-xl"
        />
        <Button 
          type="submit" 
          disabled={isPending || !newName.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add Section
        </Button>
      </form>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search sections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800/40 border-slate-700/50 text-slate-300 rounded-xl"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-2">
        {filteredSections.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            No sections found.
          </div>
        ) : (
          filteredSections.map((section) => (
            <div 
              key={section.id}
              className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-colors group"
            >
              <div>
                <h3 className="text-white font-medium">{section.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {section._count?.questions ?? 0} questions
                </p>
              </div>
              <button
                onClick={() => handleDelete(section.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
