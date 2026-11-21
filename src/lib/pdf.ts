/** Una línea de texto del documento. */
export interface PdfLine {
  text: string
  size?: number
  bold?: boolean
  /** Espacio extra antes de la línea, en puntos. */
  gap?: number
}

/** Convierte a Latin-1 (WinAnsi) y escapa lo que el formato PDF reserva. */
const enc = (s: string) =>
  s
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\xFF]/g, '')
    .replace(/[\\()]/g, (c) => '\\' + c)

/**
 * PDF de una página, solo texto (Helvetica). Sin dependencias: suficiente para constancias y comprobantes.
 * Los números de byte del índice se calculan sobre texto Latin-1, un byte por carácter.
 */
export function buildPdf(lines: PdfLine[]): Blob {
  let y = 790
  let content = ''
  for (const l of lines) {
    const size = l.size ?? 11
    y -= (l.gap ?? 0) + size * 1.5
    content += `BT /${l.bold ? 'F2' : 'F1'} ${size} Tf 56 ${y.toFixed(1)} Td (${enc(l.text)}) Tj ET\n`
  }
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const o of offsets) pdf += `${String(o).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`

  const bytes = new Uint8Array(pdf.length)
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: 'application/pdf' })
}

export function downloadPdf(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
