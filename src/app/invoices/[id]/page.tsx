'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Invoice, InvoiceItem, CompanySettings } from '@/types'
import { Download, Send, CreditCard, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function InvoiceDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (user && invoiceId) {
      fetchInvoice()
      fetchCompanySettings()
    }
  }, [user, invoiceId])

  const fetchInvoice = async () => {
    try {
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

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setCompanySettings(data)
    } catch (error) {
      console.error('Error fetching company settings:', error)
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

      await supabase
        .from('invoices')
        .update({ pdf_path: `${invoice.invoice_number}.pdf` })
        .eq('id', invoice.id)

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

  // Combine all items into a single description
  const description = items.map(item => item.description).join(' — ')

  // Get billing address
  const billingAddress = invoice.client?.billing_address
  const addressLines = billingAddress
    ? [
        billingAddress.street,
        billingAddress.city,
        billingAddress.state,
        billingAddress.zip,
        billingAddress.country,
      ].filter(Boolean)
    : []

  const companyName = companySettings?.company_name || 'Your Name'

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

        {/* Invoice Display - Matching the Design */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice</h2>
                <p className="text-sm text-gray-700">Invoice Number: {invoice.invoice_number}</p>
              </div>

              {/* Billed To */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Billed To:</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">{invoice.client?.name || 'N/A'}</p>
                  {addressLines.map((line, index) => (
                    <p key={index} className="text-sm text-gray-900">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Description:</h3>
                <p className="text-sm text-gray-900">{description || 'No description provided'}</p>
              </div>

              {/* Amount */}
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="bg-gray-50 px-4 py-3 border-r border-gray-300">
                    <p className="text-sm font-bold text-gray-900">Amount</p>
                  </div>
                  <div className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {invoice.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} {invoice.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              {(companySettings?.bank_name || companySettings?.account_number) && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Banking Details for Payment</h3>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-300">
                      <div className="px-4 py-2 border-r border-gray-300">
                        <p className="text-xs font-bold text-gray-900">Label</p>
                      </div>
                      <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-900">Value</p>
                      </div>
                    </div>
                    {companySettings.bank_name && (
                      <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 bg-white">
                          <p className="text-xs text-gray-900">Bank Name</p>
                        </div>
                        <div className="px-4 py-2 bg-white">
                          <p className="text-xs text-gray-900">{companySettings.bank_name}</p>
                        </div>
                      </div>
                    )}
                    {companySettings.account_number && (
                      <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 bg-white">
                          <p className="text-xs text-gray-900">Account Number</p>
                        </div>
                        <div className="px-4 py-2 bg-white">
                          <p className="text-xs text-gray-900">{companySettings.account_number}</p>
                        </div>
                      </div>
                    )}
                    {companySettings.account_holder && (
                      <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 bg-white">
                          <p className="text-xs text-gray-900">Account Holder</p>
                        </div>
                        <div className="px-4 py-2 bg-white">
                          <p className="text-xs text-gray-900">{companySettings.account_holder}</p>
                        </div>
                      </div>
                    )}
                    {companySettings.account_type && (
                      <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300 bg-white">
                          <p className="text-xs text-gray-900">Account Type</p>
                        </div>
                        <div className="px-4 py-2 bg-white">
                          <p className="text-xs text-gray-900">{companySettings.account_type}</p>
                        </div>
                      </div>
                    )}
                    {companySettings.iban && (
                      <div className="grid grid-cols-2">
                        <div className="px-4 py-2 border-r border-gray-300 bg-white">
                          <p className="text-xs text-gray-900">IBAN</p>
                        </div>
                        <div className="px-4 py-2 bg-white">
                          <p className="text-xs text-gray-900">{companySettings.iban}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-900 italic">Thank you for your business!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
