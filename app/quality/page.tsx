import Link from "next/link";

import { QualityScorecard } from "@/features/quality/quality-scorecard";

export const metadata = {
  title: "Quality scorecard | WanderMind",
  description: "Submission quality rubric for code, security, testing, and accessibility.",
};

export default function QualityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-white/90 underline-offset-4 hover:underline"
        >
          ← Back to WanderMind
        </Link>
        <QualityScorecard />
      </div>
    </div>
  );
}
