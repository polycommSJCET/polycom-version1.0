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

const MinutesTemplatePage = ({ params }: { params: { id: string } }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isLoaded } = useUser();

  const handleGenerateMinutes = async () => {
    if (!user || !selectedTemplate) return;

    setIsGenerating(true);
    try {
      const response = await fetch(pyApiUrl + 'generate-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          meetingId: params.id,
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate minutes');
      }

      console.log(response);

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-minutes-${params.id}.docx`; // Set the file name
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Minutes generated and downloaded successfully!');

    } catch (error) {
      console.error('Error generating minutes:', error);
      toast.error('Failed to generate minutes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    </div>
  );
};

export default MinutesTemplatePage;
