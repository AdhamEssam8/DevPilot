import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Invoice, InvoiceItem, Client } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch invoice with client and items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        project:projects(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at')

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch invoice items' },
        { status: 500 }
      )
    }

    // Generate PDF using react-pdf (client-side approach)
    // For server-side PDF generation, you would use pdfkit or puppeteer
    const pdfData = generateInvoicePDF(invoice, items || [])

    const uint8 = new Uint8Array(pdfData)
    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateInvoicePDF(invoice: Invoice, items: InvoiceItem[]): Buffer {
  // This is a simplified PDF generation
  // In a real implementation, you would use a proper PDF library like pdfkit
  
  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 1000
>>
stream
BT
/F1 12 Tf
100 700 Td
(Invoice: ${invoice.invoice_number}) Tj
0 -20 Td
(From: DevPilot) Tj
0 -20 Td
(To: ${invoice.client?.name || 'N/A'}) Tj
0 -40 Td
(Items:) Tj
${items.map((item, index) => `
0 -20 Td
(${item.description} - Qty: ${item.qty} - Rate: $${item.rate} - Amount: $${item.amount}) Tj
`).join('')}
0 -40 Td
(Subtotal: $${invoice.subtotal}) Tj
0 -20 Td
(Tax: $${invoice.tax}) Tj
0 -20 Td
(Discount: $${invoice.discount}) Tj
0 -20 Td
(Total: $${invoice.total}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000001295 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1394
%%EOF
`

  return Buffer.from(pdfContent, 'utf-8')
}
