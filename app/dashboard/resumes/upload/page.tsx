'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, FileText, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadResumePage() {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            if (selected.size > 10 * 1024 * 1024) {
                toast.error('File size must be under 10MB')
                return
            }
            setFile(selected)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped && (dropped.name.endsWith('.pdf') || dropped.name.endsWith('.docx'))) {
            if (dropped.size > 10 * 1024 * 1024) {
                toast.error('File size must be under 10MB')
                return
            }
            setFile(dropped)
        } else {
            toast.error('Please upload a PDF or DOCX file')
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            toast.error('Please select a file first')
            return
        }

        setIsUploading(true)
        const toastId = toast.loading('Uploading and analyzing resume...')

        try {
            const formData = new FormData()
            formData.append('file', file)
            const filePath = `${Date.now()}_${file.name}`
            formData.append('filePath', filePath)

            const response = await fetch('/api/resume/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to parse resume')
            }

            if (result.warning) {
                toast.warning(`Resume uploaded, but AI analysis failed: ${result.warning}`, { id: toastId, duration: 6000 })
            } else {
                toast.success('Resume uploaded and analyzed successfully!', { id: toastId })
            }
            router.push('/dashboard/resumes')
            router.refresh()
        } catch (error: unknown) {
            console.error('Upload error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
            toast.error(errorMessage, { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Resume</CardTitle>
                    <CardDescription>
                        Upload your resume (PDF or DOCX) to get started with AI analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Resume File</Label>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                                    : file
                                        ? 'border-green-400 bg-green-50/30 dark:bg-green-900/20'
                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setFile(null)
                                                if (fileInputRef.current) fileInputRef.current.value = ''
                                            }}
                                            className="text-xs text-slate-500 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3 mr-1" /> Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-8 w-8 text-slate-400" />
                                        <p className="text-sm text-slate-500">
                                            {dragOver ? 'Drop your file here' : 'Click to select or drag & drop'}
                                        </p>
                                        <p className="text-xs text-slate-400">PDF or DOCX, max 10MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={!file || isUploading}
                            className="w-full"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload & Analyze
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

