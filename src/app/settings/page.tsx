'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CompanySettings } from '@/types'
import { Save, Building2, DollarSign, FileText } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    company_name: '',
    company_logo: '',
    default_hourly_rate: 100,
    invoice_footer: ''
  })

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
        setFormData({
          company_name: data.company_name || '',
          company_logo: data.company_logo || '',
          default_hourly_rate: data.default_hourly_rate || 100,
          invoice_footer: data.invoice_footer || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('company_settings')
          .update({
            company_name: formData.company_name,
            company_logo: formData.company_logo,
            default_hourly_rate: formData.default_hourly_rate,
            invoice_footer: formData.invoice_footer,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            company_name: formData.company_name,
            company_logo: formData.company_logo,
            default_hourly_rate: formData.default_hourly_rate,
            invoice_footer: formData.invoice_footer
          })
          .select()
          .single()

        if (error) throw error
        setSettings(data)
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
              <CardDescription>
                Configure your company details for invoices and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <Input
                  value={formData.company_logo}
                  onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL to your company logo (optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Set default rates and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.default_hourly_rate}
                  onChange={(e) => setFormData({ ...formData, default_hourly_rate: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used as the default rate for new invoice items
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Customize your invoice appearance and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Footer Text
                </label>
                <textarea
                  value={formData.invoice_footer}
                  onChange={(e) => setFormData({ ...formData, invoice_footer: e.target.value })}
                  placeholder="Thank you for your business! Contact us at support@yourcompany.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text will appear at the bottom of your invoices
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
