import { FileText, HelpCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  documentCount: number;
  questionCount: number;
  testCount: number;
}

const stats = (props: Props) => [
  {
    label: "Documents",
    value: props.documentCount,
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    description: "Exam images uploaded",
  },
  {
    label: "Questions",
    value: props.questionCount,
    icon: HelpCircle,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    description: "MCQs in your bank",
  },
  {
    label: "Tests Taken",
    value: props.testCount,
    icon: ClipboardList,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    description: "Mock tests completed",
  },
];

export function StatsCards(props: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats(props).map((stat) => (
        <Card
          key={stat.label}
          className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/70 transition-all duration-200"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bg}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-slate-300">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
