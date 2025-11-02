"use client";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
