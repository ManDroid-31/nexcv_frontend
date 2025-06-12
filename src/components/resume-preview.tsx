"use client"

interface ResumePreviewProps {
  data: any
  template: string
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <iframe
        src={`/templates/${template}?data=${encodeURIComponent(JSON.stringify(data))}`}
        className="w-full h-[800px] border-0"
        title="Resume Preview"
      />
    </div>
  )
} 