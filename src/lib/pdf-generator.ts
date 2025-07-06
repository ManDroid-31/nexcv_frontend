import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ResumeData } from '@/types/resume'

interface PDFOptions {
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'letter'
  scale?: number
  backgroundColor?: string
}

// CSS to replace modern color functions with compatible ones
const COLOR_FIXES = `
  /* Replace oklch colors with hex equivalents */
  * {
    color: #000000 !important;
    background-color: #ffffff !important;
    border-color: #e5e7eb !important;
  }
  
  /* Specific color overrides for resume elements */
  .text-primary { color: #2563eb !important; }
  .text-gray-600 { color: #4b5563 !important; }
  .text-gray-700 { color: #374151 !important; }
  .text-gray-500 { color: #6b7280 !important; }
  .text-green-600 { color: #059669 !important; }
  .text-red-600 { color: #dc2626 !important; }
  
  .bg-gray-100 { background-color: #f3f4f6 !important; }
  .bg-green-100 { background-color: #d1fae5 !important; }
  .bg-red-100 { background-color: #fee2e2 !important; }
  .bg-blue-100 { background-color: #dbeafe !important; }
  
  .border-gray-200 { border-color: #e5e7eb !important; }
  .border-blue-200 { border-color: #bfdbfe !important; }
  
  /* Ensure all backgrounds are white for PDF */
  .resume-print-page {
    background-color: #ffffff !important;
    color: #000000 !important;
  }
  
  /* Remove any gradients or complex backgrounds */
  * {
    background-image: none !important;
    background: #ffffff !important;
  }
  
  /* Ensure text is readable */
  h1, h2, h3, h4, h5, h6, p, span, div {
    color: #000000 !important;
  }
  
  /* Remove shadows and effects that might cause issues */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
    filter: none !important;
  }
`;

export class PDFGenerator {
  private options: PDFOptions

  constructor(options: PDFOptions = {}) {
    this.options = {
      orientation: 'portrait',
      format: 'a4',
      scale: 2,
      backgroundColor: '#ffffff',
      ...options
    }
  }

  private injectColorFixes(): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = COLOR_FIXES;
    style.id = 'pdf-color-fixes';
    document.head.appendChild(style);
    return style;
  }

  private removeColorFixes(styleElement: HTMLStyleElement): void {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }

  public async generatePDFFromPreview(
    previewElement: HTMLElement,
    filename: string
  ): Promise<void> {
    // Inject color fixes
    const colorFixStyle = this.injectColorFixes();

    try {
      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get all pages from the preview
      const pages = Array.from(previewElement.querySelectorAll('.resume-print-page'));
      
      if (pages.length === 0) {
        throw new Error('No resume pages found');
      }

      // Create PDF with A4 dimensions (794x1123 pixels at 96 DPI)
      const pdf = new jsPDF({
        orientation: this.options.orientation,
        unit: 'px',
        format: [794, 1123]
      });

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Configure html2canvas options
        const canvas = await html2canvas(page, {
          scale: this.options.scale,
          backgroundColor: this.options.backgroundColor,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: true,
          logging: false,
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123
        });

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 1.0);

        // Add page to PDF (except for first page)
        if (i > 0) {
          pdf.addPage([794, 1123], 'portrait');
        }

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);
      }

      // Save the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      // Clean up color fixes
      this.removeColorFixes(colorFixStyle);
    }
  }

  public async generatePDFFromResumeData(
    resumeData: ResumeData,
    filename: string
  ): Promise<void> {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '850px';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    container.style.visibility = 'hidden';
    
    document.body.appendChild(container);

    try {
      // Create React element (this is a simplified approach)
      // In a real implementation, you'd need to render the component properly
      const previewDiv = document.createElement('div');
      previewDiv.className = 'resume-preview-container';
      container.appendChild(previewDiv);

      // For now, we'll use a different approach
      // Create the preview HTML manually based on the resume data
      this.createPreviewHTML(previewDiv, resumeData);

      // Generate PDF from the preview
      await this.generatePDFFromPreview(container, filename);

    } finally {
      // Clean up
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  private createPreviewHTML(container: HTMLElement, resumeData: ResumeData): void {
    // This is a simplified HTML generation
    // In practice, you'd want to use the actual ResumePreview component
    
    // Create a basic preview structure
    container.innerHTML = `
      <div class="resume-print-page" style="width: 794px; height: 1123px; background: white; padding: 40px; box-sizing: border-box;">
        <div style="font-family: Arial, sans-serif; color: black;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${resumeData.personalInfo?.name || 'Resume'}</h1>
          <p style="margin: 5px 0;">${resumeData.personalInfo?.email || ''}</p>
          <p style="margin: 5px 0;">${resumeData.personalInfo?.phone || ''}</p>
          <p style="margin: 5px 0;">${resumeData.personalInfo?.location || ''}</p>
          
          ${resumeData.summary ? `
            <h2 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ccc;">Summary</h2>
            <p style="margin-top: 10px;">${resumeData.summary}</p>
          ` : ''}
          
          ${resumeData.experience && resumeData.experience.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ccc;">Experience</h2>
            ${resumeData.experience.map(exp => `
              <div style="margin-top: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${exp.position}</h3>
                <p style="margin: 5px 0; color: #666;">${exp.company} • ${exp.startDate} - ${exp.endDate || 'Present'}</p>
                <p style="margin-top: 10px;">${exp.description}</p>
              </div>
            `).join('')}
          ` : ''}
          
          ${resumeData.education && resumeData.education.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ccc;">Education</h2>
            ${resumeData.education.map(edu => `
              <div style="margin-top: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${edu.degree}</h3>
                <p style="margin: 5px 0; color: #666;">${edu.school} • ${edu.startDate} - ${edu.endDate || 'Present'}</p>
              </div>
            `).join('')}
          ` : ''}
          
          ${resumeData.skills && resumeData.skills.length > 0 ? `
            <h2 style="font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ccc;">Skills</h2>
            <p style="margin-top: 10px;">${resumeData.skills.join(', ')}</p>
          ` : ''}
        </div>
      </div>
    `;
  }
}

// Convenience function for generating PDF from preview element
export async function generateResumePDFFromPreview(
  previewElement: HTMLElement,
  filename?: string
): Promise<void> {
  const generator = new PDFGenerator();
  const defaultFilename = `resume-${new Date().toISOString().split('T')[0]}.pdf`;
  await generator.generatePDFFromPreview(previewElement, filename || defaultFilename);
}

// Convenience function for generating PDF from resume data
export async function generateResumePDFFromData(
  resumeData: ResumeData,
  filename?: string
): Promise<void> {
  const generator = new PDFGenerator();
  const defaultFilename = `${resumeData.personalInfo?.name || resumeData.title || 'resume'}-${new Date().toISOString().split('T')[0]}.pdf`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase();
  await generator.generatePDFFromResumeData(resumeData, filename || defaultFilename);
}
  
// Legacy function for backward compatibility
export function generateResumePDF(resumeData: ResumeData, filename?: string): void {
  generateResumePDFFromData(resumeData, filename || 'resume.pdf').catch(console.error);
} 