'use client';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  width?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, width = 600 }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="flex flex-col items-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="border rounded-lg shadow-lg"
      >
        <Page 
          pageNumber={pageNumber} 
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="mt-4 flex items-center gap-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(prev => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          disabled={pageNumber >= (numPages || 0)}
          onClick={() => setPageNumber(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
