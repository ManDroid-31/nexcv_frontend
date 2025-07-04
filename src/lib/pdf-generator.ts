import jsPDF from 'jspdf'
import { ResumeData } from '@/types/resume'

interface PDFOptions {
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'letter'
  margin?: number
  fontSize?: number
  lineHeight?: number
}

export class PDFGenerator {
  private pdf: jsPDF
  private options: PDFOptions
  private currentY: number
  private pageHeight: number
  private margin: number
  private fontSize: number
  private lineHeight: number

  constructor(options: PDFOptions = {}) {
    this.options = {
      orientation: 'portrait',
      format: 'a4',
      margin: 20,
      fontSize: 12,
      lineHeight: 1.5,
      ...options
    }

    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.format
    })

    this.currentY = this.options.margin!
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.margin = this.options.margin!
    this.fontSize = this.options.fontSize!
    this.lineHeight = this.options.lineHeight!
  }

  private addText(text: string, x: number, y: number, options: { fontSize?: number; fontStyle?: string; color?: string } = {}) {
    const { fontSize = this.fontSize, fontStyle = 'normal', color = '#000000' } = options
    
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont('helvetica', fontStyle)
    this.pdf.setTextColor(color)
    this.pdf.text(text, x, y)
    
    return fontSize * this.lineHeight
  }

  private addHeading(text: string, x: number, y: number) {
    return this.addText(text, x, y, { fontSize: 16, fontStyle: 'bold' })
  }

  private addSubheading(text: string, x: number, y: number) {
    return this.addText(text, x, y, { fontSize: 14, fontStyle: 'bold' })
  }

  private addBodyText(text: string, x: number, y: number) {
    return this.addText(text, x, y, { fontSize: this.fontSize })
  }

  private addSmallText(text: string, x: number, y: number) {
    return this.addText(text, x, y, { fontSize: 10, color: '#666666' })
  }

  private checkPageBreak(requiredHeight: number): boolean {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage()
      this.currentY = this.margin
      return true
    }
    return false
  }

  private addSection(title: string, content: string[], x: number = this.margin) {
    // Add section title
    const titleHeight = this.addHeading(title, x, this.currentY)
    this.currentY += titleHeight + 5

    // Check if we need a page break
    this.checkPageBreak(content.length * this.fontSize * this.lineHeight)

    // Add content
    content.forEach(line => {
      // Ensure line is a string before calling trim
      if (typeof line !== 'string') {
        if (line == null) return;
        line = String(line);
      }
      if (line.trim()) {
        const lineHeight = this.addBodyText(line, x + 5, this.currentY)
        this.currentY += lineHeight + 2
      }
    })

    this.currentY += 10
  }

  public generateResumePDF(resumeData: ResumeData): jsPDF {
    const { personalInfo, summary, experience, education, projects, skills } = resumeData

    // Header with name and contact info
    if (personalInfo?.name) {
      this.addHeading(personalInfo.name, this.margin, this.currentY)
      this.currentY += 20
    }

    // Contact information
    const contactInfo: string[] = []
    if (personalInfo?.email) contactInfo.push(`Email: ${personalInfo.email}`)
    if (personalInfo?.phone) contactInfo.push(`Phone: ${personalInfo.phone}`)
    if (personalInfo?.location) contactInfo.push(`Location: ${personalInfo.location}`)
    if (personalInfo?.website) contactInfo.push(`Website: ${personalInfo.website}`)
    if (personalInfo?.linkedin) contactInfo.push(`LinkedIn: ${personalInfo.linkedin}`)
    if (personalInfo?.github) contactInfo.push(`GitHub: ${personalInfo.github}`)

    if (contactInfo.length > 0) {
      contactInfo.forEach(info => {
        this.addSmallText(info, this.margin, this.currentY)
        this.currentY += 5
      })
      this.currentY += 10
    }

    // Summary
    if (summary) {
      this.addSection('Professional Summary', [summary])
    }

    // Experience
    if (experience && experience.length > 0) {
      this.addSubheading('Professional Experience', this.margin, this.currentY)
      this.currentY += 15

      experience.forEach(exp => {
        const expContent: string[] = []
        expContent.push(`${exp.position} at ${exp.company}`)
        if (exp.startDate || exp.endDate) {
          const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ')
          expContent.push(`Duration: ${dates}`)
        }
        if (exp.description) {
          expContent.push('')
          expContent.push(exp.description)
        }
        if (exp.tags && exp.tags.length > 0) {
          expContent.push(`Technologies: ${exp.tags.join(', ')}`)
        }

        this.addSection('', expContent, this.margin + 10)
      })
    }

    // Education
    if (education && education.length > 0) {
      this.addSubheading('Education', this.margin, this.currentY)
      this.currentY += 15

      education.forEach(edu => {
        const eduContent: string[] = []
        eduContent.push(`${edu.degree} from ${edu.school}`)
        if (edu.startDate || edu.endDate) {
          const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
          eduContent.push(`Duration: ${dates}`)
        }
        if (edu.gpa) {
          eduContent.push(`GPA: ${edu.gpa}`)
        }
        if (edu.tags && edu.tags.length > 0) {
          eduContent.push(`Achievements: ${edu.tags.join(', ')}`)
        }

        this.addSection('', eduContent, this.margin + 10)
      })
    }

    // Projects
    if (projects && projects.length > 0) {
      this.addSubheading('Projects', this.margin, this.currentY)
      this.currentY += 15

      projects.forEach(project => {
        const projContent: string[] = []
        projContent.push(project.name)
        if (project.description) {
          projContent.push('')
          projContent.push(project.description)
        }
        if (project.technologies && project.technologies.length > 0) {
          projContent.push(`Technologies: ${project.technologies.join(', ')}`)
        }
        if (project.startDate || project.endDate) {
          const dates = [project.startDate, project.endDate].filter(Boolean).join(' - ')
          projContent.push(`Duration: ${dates}`)
        }
        if (project.liveUrl) {
          projContent.push(`Live URL: ${project.liveUrl}`)
        }
        if (project.githubUrl) {
          projContent.push(`GitHub: ${project.githubUrl}`)
        }

        this.addSection('', projContent, this.margin + 10)
      })
    }

    // Skills
    if (skills && skills.length > 0) {
      this.addSubheading('Skills', this.margin, this.currentY)
      this.currentY += 15

      // Group skills into chunks for better formatting
      const skillChunks = []
      for (let i = 0; i < skills.length; i += 5) {
        skillChunks.push(skills.slice(i, i + 5).join(', '))
      }

      skillChunks.forEach(chunk => {
        this.addBodyText(chunk, this.margin + 10, this.currentY)
        this.currentY += 8
      })
    }

    // Footer
    this.currentY = this.pageHeight - 20
    this.addSmallText('Generated by NexCV - AI Resume Builder', this.margin, this.currentY)

    return this.pdf
  }

  public save(filename: string) {
    this.pdf.save(filename)
  }
}

export function generateResumePDF(resumeData: ResumeData, filename?: string): void {
  const generator = new PDFGenerator()
  generator.generateResumePDF(resumeData)
  
  const defaultFilename = `${resumeData.personalInfo?.name || resumeData.title || 'resume'}-${new Date().toISOString().split('T')[0]}.pdf`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase()
  
  generator.save(filename || defaultFilename)
} 