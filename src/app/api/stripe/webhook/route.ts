import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const supabase = createServerClient()
          
          // Find invoice by payment intent ID
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('stripe_payment_intent_id', session.payment_intent)
            .single()

          if (!invoiceError && invoice) {
            // Update invoice status to paid
            await supabase
              .from('invoices')
              .update({ 
                status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', invoice.id)

            console.log(`Invoice ${invoice.invoice_number} marked as paid`)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        const supabase = createServerClient()
        
        // Find invoice by payment intent ID
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (!invoiceError && invoice) {
          // Update invoice status to sent (revert from sent back to sent)
          await supabase
            .from('invoices')
            .update({ 
              status: 'sent',
              updated_at: new Date().toISOString()
            })
            .eq('id', invoice.id)

          console.log(`Invoice ${invoice.invoice_number} payment failed`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
