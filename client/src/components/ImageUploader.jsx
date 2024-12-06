import React, { useState } from "react";
import { UploadCloud, Check, Trash, Loader } from "lucide-react";
import axios from "axios";

const ImageUploader = ({ label, path, onUploadSuccess, initialImageUrl }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!imageFile) return alert("Please select an image first!");
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "ml_default");
    formData.append("folder", "Amrutam");

    try {
      setUploading(true);
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dlj2flmvh/image/upload",
        formData
      );
      const secureUrl = response.data.secure_url;
      setUploaded(true);
      onUploadSuccess(path, secureUrl);
    } catch (error) {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setUploaded(false);
    onUploadSuccess(path, null);
  };

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col items-center space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id={`file-input-${path}`}
      />
      <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover w-full h-full"
          />
        ) : (
          <label
            htmlFor={`file-input-${path}`}
            className="flex flex-col items-center justify-center h-full text-gray-500 cursor-pointer"
          >
            <UploadCloud className="w-8 h-8" />
            <span>Upload</span>
          </label>
        )}
        {previewUrl && (
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>
      {previewUrl && !uploaded && (
        <button
          onClick={handleUpload}
          className={`bg-blue-500 text-white py-1 px-4 rounded-lg shadow-md flex items-center space-x-2 ${
            uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={uploading}
        >
          {uploading ? (
            <Loader className="animate-spin w-4 h-4" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          <span>{uploading ? "Uploading..." : "Upload"}</span>
        </button>
      )}
      {uploaded && (
        <p className="text-green-600 flex items-center space-x-1">
          <Check className="w-4 h-4" />
          <span>Uploaded</span>
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
