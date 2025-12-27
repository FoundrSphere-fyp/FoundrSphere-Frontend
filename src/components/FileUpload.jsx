'use client';

import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setUploadedUrl('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('asset', file);

      const response = await fetch('http://localhost:5000/api/posts/upload-asset', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      const data = await response.json();

      if (data.success) {
        setUploadedUrl(data.data.url);
        console.log('Upload successful:', data.data);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Photo/Video</h2>
      
      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose File
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            {file?.type.startsWith('image/') ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full h-auto rounded-md max-h-64 object-contain"
              />
            ) : (
              <video 
                src={preview} 
                controls 
                className="max-w-full h-auto rounded-md max-h-64"
              />
            )}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message with URL */}
        {uploadedUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600 font-medium mb-2">
              Upload Successful!
            </p>
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">URL:</p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
            {file?.type.startsWith('image/') ? (
              <img 
                src={uploadedUrl} 
                alt="Uploaded" 
                className="mt-3 max-w-full h-auto rounded-md max-h-64 object-contain"
              />
            ) : (
              <video 
                src={uploadedUrl} 
                controls 
                className="mt-3 max-w-full h-auto rounded-md max-h-64"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
