"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">MCQ Manager</h1>
          <p className="text-xs text-slate-400">AI-Powered Exam Prep</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
      <p className="text-slate-400 text-sm mb-8">
        Start building your personal question bank
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Alex Johnson"
            required
            className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password{" "}
            <span className="text-slate-500 font-normal">(min. 6 characters)</span>
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          id="register-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
