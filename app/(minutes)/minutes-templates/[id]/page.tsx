'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
const pyApiUrl="https://127.0.0.1:443/"

const templates = [
  {
    id: 1,
    name: 'Professional Template',
    description: 'A clean, professional layout suitable for formal meetings',
    pdfUrl: '/templates/template1.pdf'
  },
  {
    id: 2,
    name: 'Modern Template',
    description: 'A modern design with enhanced readability and structure',
    pdfUrl: '/templates/template2.pdf'
  }
];

const PDFPreview = ({ url }: { url: string }) => {
  return (
    <div className="group relative size-full">
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-transparent to-black/5 transition-opacity group-hover:opacity-0" />
      <object
        data={url}
        type="application/pdf"
        className="size-full rounded-lg"
        style={{ 
          overflow: 'auto',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex h-full items-center justify-center text-gray-500">
          <p>Unable to display PDF. Please ensure you have a PDF viewer installed.</p>
        </div>
      </object>
    </div>
  );
};

interface FormData {
  logo: File | null;
  organizationName: string;
  title: string;
  meetingType: string;
}

const MinutesTemplatePage = ({ params }: { params: { id: string } }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isLoaded } = useUser();
  const [showFormOverlay, setShowFormOverlay] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    logo: null,
    organizationName: '',
    title: '',
    meetingType: ''
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTemplate) return;

    setIsGenerating(true);
    const formDataToSend = new FormData();
    formDataToSend.append('userId', user.id);
    formDataToSend.append('meetingId', params.id);
    formDataToSend.append('templateId', selectedTemplate.toString());
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }
    formDataToSend.append('organizationName', formData.organizationName);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('meetingType', formData.meetingType);

    try {
      const response = await fetch(pyApiUrl + 'generate-minutes', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to generate minutes');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-minutes-${params.id}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Minutes generated and downloaded successfully!');
      setShowFormOverlay(false);
    } catch (error) {
      console.error('Error generating minutes:', error);
      toast.error('Failed to generate minutes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMinutes = () => {
    setShowFormOverlay(true);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Choose Your Minutes Template
          </h1>
          <p className="text-gray-600">
            Select a template that best suits your meeting style
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`group relative cursor-pointer overflow-visible rounded-xl bg-white/70 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                selectedTemplate === template.id
                  ? 'shadow-blue-500/20 ring-2 ring-blue-500'
                  : 'shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="relative mb-4 h-[400px] overflow-auto rounded-lg bg-gray-50">
                <PDFPreview url={template.pdfUrl} />
                {selectedTemplate === template.id && (
                  <div className="absolute right-3 top-3 rounded-full bg-blue-500 p-2">
                    <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="fixed inset-x-0 bottom-0 border-t bg-white/80 p-4 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTemplate ? 'Template selected' : 'Please select a template'}
            </div>
            <button
              className={`rounded-lg px-8 py-3 font-medium transition-all duration-300 ${
                selectedTemplate && !isGenerating
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
              disabled={!selectedTemplate || isGenerating}
              onClick={handleGenerateMinutes}
            >
              {isGenerating ? 'Generating...' : 'Generate Minutes'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Overlay */}
      {showFormOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">Meeting Details</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({
                    ...formData,
                    logo: e.target.files?.[0] || null
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData({
                    ...formData,
                    organizationName: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
                <input
                  type="text"
                  required
                  value={formData.meetingType}
                  onChange={(e) => setFormData({
                    ...formData,
                    meetingType: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormOverlay(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Minutes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinutesTemplatePage;
