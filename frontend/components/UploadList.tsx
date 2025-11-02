"use client";

import React from "react";
import { formatFileSize } from "@/lib/utils";

interface Upload {
  name: string;
  key?: string;
  size: string;
}

interface UploadListProps {
  uploads: Upload[];
  onRefresh?: () => void;
}

export default function UploadList({ uploads, onRefresh }: UploadListProps) {
  const handleDownload = (upload: Upload) => {
    // Use 'key' if available (for tusd S3 uploads), otherwise use 'name'
    const downloadKey = upload.key || upload.name;
    window.open(`/api/download/${encodeURIComponent(downloadKey)}`, "_blank");
  };

  if (!uploads || uploads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">アップロードされたファイルはまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex items-center flex-1">
            <svg
              className="w-6 h-6 text-gray-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-gray-900 truncate">
                {upload.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(parseInt(upload.size))}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(upload)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            ダウンロード
          </button>
        </div>
      ))}
      {onRefresh && (
        <div className="mt-6 text-center">
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            更新
          </button>
        </div>
      )}
    </div>
  );
}
