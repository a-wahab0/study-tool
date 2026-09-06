import { Download } from "lucide-react";

export default function DownloadButton({
  onClick,
  label = "Download",
  disabled,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn-primary">
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
