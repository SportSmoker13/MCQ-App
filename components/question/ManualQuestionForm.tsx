"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CheckCircle2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createManualQuestion } from "@/actions/question";
import { toast } from "sonner";

export function ManualQuestionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [documentName, setDocumentName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: "", isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleMarkCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentName.trim()) return toast.error("Collection name is required");
    if (!questionText.trim()) return toast.error("Question text is required");
    if (options.some(o => !o.text.trim())) return toast.error("All options must have text");
    if (!options.some(o => o.isCorrect)) return toast.error("Please mark one option as correct");

    startTransition(async () => {
      const result = await createManualQuestion({
        documentName,
        questionText,
        explanation,
        options,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Question added successfully!");
        setQuestionText("");
        setExplanation("");
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]);
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Add New Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentName" className="text-slate-300">Subject / Collection Name</Label>
            <Input
              id="documentName"
              placeholder="e.g. Biology, Entrance Exam 2024"
              value={documentName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentName(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText" className="text-slate-300">Question Text</Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={questionText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionText(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={options.length >= 6}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Option
              </Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`bg-slate-800/50 border-slate-700 text-white pr-10 ${
                      option.isCorrect ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : ""
                    }`}
                  />
                  {option.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <Button
                  type="button"
                  variant={option.isCorrect ? "default" : "outline"}
                  onClick={() => handleMarkCorrect(index)}
                  className={option.isCorrect ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-700 text-slate-300"}
                >
                  {option.isCorrect ? "Correct" : "Mark Correct"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-slate-300">AI-style Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              placeholder="Why is this answer correct?"
              value={explanation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExplanation(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-xl font-bold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Question
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
