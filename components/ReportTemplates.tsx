'use client';
import React from 'react';
import PDFViewer from './PDFViewer';

export interface Template {
  id: string;
  name: string;
  description: string;
  pdfUrl: string;
}

const templates: Template[] = [
  {
    id: 'detailed',
    name: 'Detailed Report',
    description: 'A comprehensive report with full meeting analytics and participant details',
    pdfUrl: '/templates/template1.pdf'
  },
  {
    id: 'summary',
    name: 'Executive Summary',
    description: 'A concise overview with key meeting highlights and outcomes',
    pdfUrl: '/templates/template2.pdf'
  }
];

interface ReportTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="grid grid-cols-1 gap-8 p-4 md:grid-cols-2">
      {templates.map((template) => (
        <div 
          key={template.id}
          className="flex flex-col space-y-4 rounded-lg border p-6 transition-all hover:border-blue-500"
        >
          <h3 className="text-xl font-semibold">{template.name}</h3>
          <p className="text-gray-600">{template.description}</p>
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-50">
            <PDFViewer pdfUrl={template.pdfUrl} width={400} />
          </div>
          <button
            onClick={() => onSelectTemplate(template.id)}
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Use this template
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReportTemplates;
