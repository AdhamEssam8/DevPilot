import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Invoice, InvoiceItem, CompanySettings } from '@/types'

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
    marginBottom: 32,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  amountSection: {
    flexDirection: 'row',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  amountLabel: {
    width: '40%',
    padding: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  amountValue: {
    width: '60%',
    padding: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  bankingTable: {
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  bankingTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bankingTableHeaderCell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  bankingTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bankingTableCell: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#111827',
    fontStyle: 'italic',
  },
})

interface InvoicePDFServerProps {
  invoice: Invoice
  items: InvoiceItem[]
  companySettings?: CompanySettings | null
}

export function InvoicePDFServer({ invoice, items, companySettings }: InvoicePDFServerProps) {
  // Combine all items into a single description
  const description = items.map(item => item.description).join(' — ')

  // Get billing address from client
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

  // Get company name or use default
  const companyName = companySettings?.company_name || 'Your Name'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Name and Invoice Label */}
        <View style={styles.header}>
          <Text style={styles.name}>{companyName}</Text>
          <Text style={styles.invoiceLabel}>Invoice</Text>
          <Text style={styles.invoiceNumber}>Invoice Number: {invoice.invoice_number}</Text>
        </View>

        {/* Billed To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Billed To:</Text>
          <Text style={styles.sectionText}>{invoice.client?.name || 'N/A'}</Text>
          {addressLines.map((line, index) => (
            <Text key={index} style={styles.sectionText}>
              {line}
            </Text>
          ))}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description:</Text>
          <Text style={styles.sectionText}>{description || 'No description provided'}</Text>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            {invoice.total.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} {invoice.currency}
          </Text>
        </View>

        {/* Banking Details Section */}
        {(companySettings?.bank_name || companySettings?.account_number) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Banking Details for Payment</Text>
            <View style={styles.bankingTable}>
              <View style={styles.bankingTableHeader}>
                <Text style={styles.bankingTableHeaderCell}>Label</Text>
                <Text style={styles.bankingTableHeaderCell}>Value</Text>
              </View>
              {companySettings.bank_name && (
                <View style={styles.bankingTableRow}>
                  <Text style={styles.bankingTableCell}>Bank Name</Text>
                  <Text style={styles.bankingTableCell}>{companySettings.bank_name}</Text>
                </View>
              )}
              {companySettings.account_number && (
                <View style={styles.bankingTableRow}>
                  <Text style={styles.bankingTableCell}>Account Number</Text>
                  <Text style={styles.bankingTableCell}>{companySettings.account_number}</Text>
                </View>
              )}
              {companySettings.account_holder && (
                <View style={styles.bankingTableRow}>
                  <Text style={styles.bankingTableCell}>Account Holder</Text>
                  <Text style={styles.bankingTableCell}>{companySettings.account_holder}</Text>
                </View>
              )}
              {companySettings.account_type && (
                <View style={styles.bankingTableRow}>
                  <Text style={styles.bankingTableCell}>Account Type</Text>
                  <Text style={styles.bankingTableCell}>{companySettings.account_type}</Text>
                </View>
              )}
              {companySettings.iban && (
                <View style={styles.bankingTableRow}>
                  <Text style={styles.bankingTableCell}>IBAN</Text>
                  <Text style={styles.bankingTableCell}>{companySettings.iban}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  )
}

