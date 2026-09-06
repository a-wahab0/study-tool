import Link from "next/link";
import { ArrowLeft, ShieldCheck, ServerCog } from "lucide-react";

export default function ToolHeader({
  title,
  description,
  clientSideOnly,
}: {
  title: string;
  description: string;
  clientSideOnly: boolean;
}) {
  return (
    <div className="border-b border-ink-200 bg-white px-4 py-5 sm:px-6">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 focus-ring rounded-md"
      >
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>
      <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
      <div
        className={
          "mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium " +
          (clientSideOnly ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")
        }
      >
        {clientSideOnly ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            Your files are processed in your browser and are not uploaded.
          </>
        ) : (
          <>
            <ServerCog className="h-3.5 w-3.5" />
            This tool requires server-side processing. See details below.
          </>
        )}
      </div>
    </div>
  );
}
