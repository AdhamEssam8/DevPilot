import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Invoice, InvoiceItem, CompanySettings } from '@/types'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

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

    // Fetch company settings
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', invoice.user_id)
      .single()

    // Generate PDF - import component dynamically
    const { InvoicePDFServer } = await import('@/components/invoices/InvoicePDFServer')
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDFServer, {
        invoice,
        items: items || [],
        companySettings,
      }) as any
    )

    return new NextResponse(pdfBuffer as any, {
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
