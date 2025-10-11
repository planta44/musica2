import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { createPurchase } from '../lib/api'

const PayPalButton = ({ amount, contentType, contentId, contentTitle, customerEmail, onSuccess }) => {
  const paypalRef = useRef()

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=test&currency=USD`
    script.addEventListener('load', () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: contentTitle,
                amount: {
                  currency_code: 'USD',
                  value: amount.toString()
                }
              }]
            })
          },
          onApprove: async (data, actions) => {
            try {
              const order = await actions.order.capture()
              
              // Create purchase record
              const { data: purchase } = await createPurchase({
                contentType,
                contentId,
                customerEmail,
                amount,
                paymentMethod: 'paypal',
                paymentId: order.id,
                paymentStatus: 'completed'
              })

              toast.success('Payment successful!')
              if (onSuccess) {
                onSuccess(purchase, purchase.accessToken, contentId)
              }
            } catch (error) {
              console.error('Payment error:', error)
              toast.error('Payment processing failed')
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err)
            toast.error('Payment failed. Please try again.')
          }
        }).render(paypalRef.current)
      }
    })
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [amount, contentType, contentId, contentTitle, customerEmail])

  return <div ref={paypalRef} className="w-full"></div>
}

export default PayPalButton
