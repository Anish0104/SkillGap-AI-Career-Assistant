import mammoth from 'mammoth'

// Try multiple import paths for pdfjs-dist compatibility across bundlers
async function getPdfJs() {
    const importPaths = [
        'pdfjs-dist/legacy/build/pdf.mjs',
        'pdfjs-dist/build/pdf.mjs',
        'pdfjs-dist/legacy/build/pdf.js',
        'pdfjs-dist',
    ]

    for (const path of importPaths) {
        try {
            const pdfjsLib = await import(/* webpackIgnore: true */ path)
            // Disable worker for server-side use
            if (pdfjsLib.GlobalWorkerOptions) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = ''
            }
            return pdfjsLib
        } catch {
            continue
        }
    }
    throw new Error('Could not load pdfjs-dist. Please ensure it is installed: npm install pdfjs-dist')
}

interface TextItem {
    str: string
    transform: number[]
    hasEOL: boolean
    width: number
    height: number
    fontName: string
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const pdfjsLib = await getPdfJs()

        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            useSystemFonts: true,
        })
        const pdf = await loadingTask.promise

        let fullText = ''

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()

            // Reconstruct text with proper spacing
            let pageText = ''
            let lastY: number | null = null

            for (const item of textContent.items as unknown as TextItem[]) {
                if (item.str !== undefined) {
                    // Add newline when Y position changes significantly (new line in PDF)
                    if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                        pageText += '\n'
                    }
                    pageText += item.str
                    // Add space if the item doesn't end with a space and next item doesn't start with one
                    if (item.str && !item.str.endsWith(' ') && item.hasEOL === false) {
                        pageText += ' '
                    }
                    lastY = item.transform[5]
                }
            }

            fullText += pageText + '\n\n'
        }

        const cleanedText = fullText
            .replace(/[ \t]+/g, ' ')      // collapse horizontal whitespace
            .replace(/\n{3,}/g, '\n\n')    // max 2 consecutive newlines
            .trim()

        if (!cleanedText || cleanedText.length < 10) {
            throw new Error("PDF appears to be empty or contains only images. Please ensure your resume has selectable text.")
        }

        console.log(`[PDF Parser] ✅ Extracted ${cleanedText.length} chars from ${pdf.numPages} pages`)
        return cleanedText

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown PDF error'
        console.error("[PDF Parser] ❌ Error:", errorMessage)
        throw new Error(`Failed to parse PDF: ${errorMessage}`)
    }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer })

        if (!result.value || result.value.trim().length === 0) {
            throw new Error("DOCX appears to be empty")
        }

        console.log(`[DOCX Parser] ✅ Extracted ${result.value.length} characters`)
        return result.value
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown DOCX error'
        console.error("[DOCX Parser] ❌ Error:", errorMessage)
        throw new Error(`Failed to parse DOCX: ${errorMessage}`)
    }
}

export async function parseResume(buffer: Buffer, mimeType: string) {
    console.log(`[Resume Parser] Parsing type: ${mimeType}, size: ${buffer.length} bytes`)

    if (mimeType === 'application/pdf') {
        return extractTextFromPdf(buffer)
    } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType.includes('officedocument.wordprocessingml.document')
    ) {
        return extractTextFromDocx(buffer)
    }

    throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`)
}

