'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Invoice, InvoiceItem } from '@/types'
import { format } from 'date-fns'

// Register fonts
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  companySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  invoiceInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  clientInfo: {
    marginBottom: 40,
  },
  clientLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemsTable: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 11,
    color: '#374151',
  },
  tableCellRight: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'right',
  },
  descriptionColumn: {
    width: '40%',
  },
  qtyColumn: {
    width: '15%',
  },
  rateColumn: {
    width: '20%',
  },
  amountColumn: {
    width: '25%',
  },
  summary: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 12,
    color: '#374151',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
  },
})

interface InvoicePDFProps {
  invoice: Invoice
  items: InvoiceItem[]
}

export function InvoicePDF({ invoice, items }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>DevPilot</Text>
            <Text style={styles.companySubtitle}>AI Developer Command Center</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceDate}>
              {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientLabel}>Bill To:</Text>
          <Text style={styles.clientName}>{invoice.client?.name || 'N/A'}</Text>
          {invoice.client?.email && (
            <Text style={styles.clientEmail}>{invoice.client.email}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.rateColumn]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.amountColumn]}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionColumn]}>{item.description}</Text>
              <Text style={[styles.tableCellRight, styles.qtyColumn]}>{item.qty}</Text>
              <Text style={[styles.tableCellRight, styles.rateColumn]}>${item.rate.toFixed(2)}</Text>
              <Text style={[styles.tableCellRight, styles.amountColumn]}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>${invoice.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>-${invoice.discount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! • Generated by DevPilot
        </Text>
      </Page>
    </Document>
  )
}
