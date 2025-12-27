"use client";
import React from 'react';
import WorkshopRoom from '@/components/WorkshopRoom'; // Adjust path if needed

export default function WorkshopPage() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
        🔴 Live Workshop
      </h1>
      
      {/* Mount the Workshop Logic */}
      <div className="border border-gray-700 rounded-xl p-4">
        <WorkshopRoom />
      </div>
    </div>
  );
}