"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, Check, Loader2 } from "lucide-react";
import { getSections, createSection } from "@/actions/sections";
import { toast } from "sonner";

interface Section {
  id: string;
  name: string;
}

interface Props {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SectionSelect({ value, onChange, placeholder = "Select a section..." }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    setIsLoading(true);
    try {
      const data = await getSections();
      setSections(data);
    } catch (err) {
      toast.error("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newSectionName.trim()) return;
    setIsCreating(true);
    try {
      const section = await createSection(newSectionName.trim());
      setSections(prev => [...prev, section].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(section.id);
      setNewSectionName("");
      setIsOpen(false);
      toast.success("Section created");
    } catch (err) {
      toast.error("Failed to create section");
    } finally {
      setIsCreating(false);
    }
  }

  const selectedSection = sections.find(s => s.id === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className={selectedSection ? "text-white" : "text-slate-500"}>
          {selectedSection ? selectedSection.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <>
                {sections.length === 0 && (
                  <p className="text-xs text-slate-500 p-3 text-center">No sections created yet.</p>
                )}
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      onChange(section.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group"
                  >
                    {section.name}
                    {value === section.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="border-t border-slate-700 p-2 bg-slate-800/30">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New section..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating || !newSectionName.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
