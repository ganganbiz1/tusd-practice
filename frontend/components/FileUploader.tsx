"use client";

import React, { useRef, useState } from "react";
import * as tus from "tus-js-client";
import ProgressBar from "./ProgressBar";

interface FileUploaderProps {
  onUploadComplete?: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<
    Array<{
      id: string;
      file: File;
      progress: number;
      uploading: boolean;
      speed: string;
    }>
  >([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = Date.now().toString() + Math.random().toString(36);

      const newUpload = {
        id: uploadId,
        file,
        progress: 0,
        uploading: true,
        speed: "0 MB/s",
      };

      setUploads((prev) => [...prev, newUpload]);

      uploadFile(file, uploadId);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = (file: File, uploadId: string) => {
    const upload = new tus.Upload(file, {
      endpoint: "http://localhost:1080/files/",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        name: file.name,
        type: file.type,
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, uploading: false } : u
          )
        );
      },
      onProgress: (bytesSent, bytesTotal) => {
        const percentage = Math.floor((bytesSent / bytesTotal) * 100);
        const speedMBs = ((bytesSent / (1024 * 1024)) / 5).toFixed(2);

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  progress: percentage,
                  speed: `${speedMBs} MB/s`,
                }
              : u
          )
        );
      },
      onSuccess: () => {
        console.log("Upload complete:", upload.url);
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, uploading: false } : u
          )
        );

        setTimeout(() => {
          if (onUploadComplete) {
            onUploadComplete();
          }
        }, 500);
      },
    });

    upload.start();
  };

  const removeUpload = (uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="flex items-center justify-center w-full px-4 py-12 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 bg-blue-50 hover:bg-blue-100 transition"
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-blue-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-gray-700 font-semibold">
              クリックまたはドラッグしてファイルをアップロード
            </p>
            <p className="text-gray-500 text-sm mt-1">
              複数のファイルを選択できます
            </p>
          </div>
        </label>
      </div>

      {uploads.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-gray-700">アップロード中:</h3>
          {uploads.map((upload) => (
            <div key={upload.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{upload.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(upload.file.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                    {upload.speed}
                  </p>
                </div>
                {!upload.uploading && (
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <ProgressBar progress={upload.progress} />
              {upload.uploading && (
                <p className="text-xs text-blue-600 mt-1">アップロード中...</p>
              )}
              {!upload.uploading && upload.progress === 100 && (
                <p className="text-xs text-green-600 mt-1">✓ 完了</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
