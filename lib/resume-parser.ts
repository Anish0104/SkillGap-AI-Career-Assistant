import mammoth from 'mammoth'
import PDFParser from 'pdf2json'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true)

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("[PDF Parser] ❌ Error:", errData.parserError)
            reject(new Error(`Failed to parse PDF: ${errData.parserError}`))
        })

        pdfParser.on("pdfParser_dataReady", () => {
            const rawText = (pdfParser as any).getRawTextContent()
            const cleanedText = rawText
                .replace(/[ \t]+/g, ' ')      // collapse horizontal whitespace
                .replace(/\r\n/g, '\n')       // normalize newlines
                .replace(/\n{3,}/g, '\n\n')    // max 2 consecutive newlines
                .trim()

            if (!cleanedText || cleanedText.length < 10) {
                reject(new Error("PDF appears to be empty or contains only images. Please ensure your resume has selectable text."))
                return
            }

            console.log(`[PDF Parser] ✅ Extracted ${cleanedText.length} chars`)
            resolve(cleanedText)
        })

        pdfParser.parseBuffer(buffer)
    })
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

