"use client";

import { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import UploadList from "@/components/UploadList";

export default function Home() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/uploads");
      if (response.ok) {
        const data = await response.json();
        setUploads(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadComplete = () => {
    fetchUploads();
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📁 TUSD File Upload Manager
          </h1>
          <p className="text-lg text-gray-600">
            TUS Protocol-based resumable file uploads with S3/Minio backend
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Upload Files
          </h2>
          <FileUploader onUploadComplete={handleUploadComplete} />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Uploaded Files ({uploads.length})
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <UploadList uploads={uploads} onRefresh={fetchUploads} />
          )}
        </div>
      </div>
    </main>
  );
}
