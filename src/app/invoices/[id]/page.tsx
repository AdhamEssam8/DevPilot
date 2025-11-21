'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Invoice, InvoiceItem } from '@/types'
import { Download, Send, CreditCard, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function InvoiceDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (user && invoiceId) {
      fetchInvoice()
    }
  }, [user, invoiceId])

  const fetchInvoice = async () => {
    try {
      // Fetch invoice with client and project data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          project:projects(*)
        `)
        .eq('id', invoiceId)
        .eq('user_id', user?.id)
        .single()

      if (invoiceError) throw invoiceError

      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at')

      if (itemsError) throw itemsError

      setInvoice(invoiceData)
      setItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePdf = async () => {
    if (!invoice) return

    setGeneratingPdf(true)
    try {
      const response = await fetch('/api/invoices/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update invoice with PDF path
      await supabase
        .from('invoices')
        .update({ pdf_path: `${invoice.invoice_number}.pdf` })
        .eq('id', invoice.id)

      // Refresh invoice data
      fetchInvoice()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const createPaymentLink = async () => {
    if (!invoice) return

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment link')
      }

      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error creating payment link:', error)
      alert('Failed to create payment link')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h1>
          <Button asChild>
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={generatePdf} disabled={generatingPdf}>
              <Download className="h-4 w-4 mr-2" />
              {generatingPdf ? 'Generating...' : 'PDF'}
            </Button>
            {invoice.status !== 'paid' && (
              <Button onClick={createPaymentLink}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">From</h3>
                    <p className="text-sm text-gray-600">DevPilot</p>
                    <p className="text-sm text-gray-600">AI Developer Command Center</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">To</h3>
                    <p className="text-sm text-gray-600">{invoice.client?.name}</p>
                    {invoice.client?.email && (
                      <p className="text-sm text-gray-600">{invoice.client.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-900">Description</th>
                        <th className="text-right py-2 font-medium text-gray-900">Qty</th>
                        <th className="text-right py-2 font-medium text-gray-900">Rate</th>
                        <th className="text-right py-2 font-medium text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="py-3 text-sm text-gray-600 text-right">{item.qty}</td>
                          <td className="py-3 text-sm text-gray-600 text-right">${item.rate.toFixed(2)}</td>
                          <td className="py-3 text-sm text-gray-900 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium">${invoice.tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium">-${invoice.discount.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-gray-900">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">Invoice Number:</span>
                  <p className="text-sm text-gray-600">{invoice.invoice_number}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-900">Issue Date:</span>
                  <p className="text-sm text-gray-600">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
                </div>
                
                {invoice.due_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Due Date:</span>
                    <p className="text-sm text-gray-600">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-900">Status:</span>
                  <p className="text-sm text-gray-600 capitalize">{invoice.status}</p>
                </div>
                
                {invoice.project && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Project:</span>
                    <p className="text-sm text-gray-600">{invoice.project.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
