import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const PayPalButton = ({ amount, contentType, contentId, contentTitle, onSuccess, customerEmail }) => {
  const [sdkReady, setSdkReady] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPalScript = () => {
      if (window.paypal) {
        setSdkReady(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=AZxLhMfNQzplIZYxOh8vdgBhvq4jDqDxOe0iYMlH0zJ3gWXY0qUxU6FQ5bN6JZqQgLqHY5TnKqVXH8bJ&currency=USD`
      script.async = true
      script.onload = () => setSdkReady(true)
      script.onerror = () => {
        toast.error('Failed to load PayPal SDK')
      }
      document.body.appendChild(script)
    }

    loadPayPalScript()
  }, [])

  useEffect(() => {
    if (sdkReady && window.paypal && !processing) {
      // Clear any existing buttons
      const container = document.getElementById(`paypal-button-container-${contentId}`)
      if (container) {
        container.innerHTML = ''
      }

      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                description: `${contentType === 'music' ? 'Music' : 'Video'}: ${contentTitle}`,
                amount: {
                  value: amount.toFixed(2)
                },
                payee: {
                  email_address: 'ruachkol@gmail.com'
                }
              }]
            })
          },
          onApprove: async (data, actions) => {
            setProcessing(true)
            try {
              const order = await actions.order.capture()
              
              // Create purchase record in our database
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contentType,
                  contentId,
                  customerEmail: customerEmail || order.payer.email_address,
                  customerName: `${order.payer.name.given_name} ${order.payer.name.surname}`,
                  amount: parseFloat(amount),
                  paymentId: order.id,
                  paymentMethod: 'paypal'
                })
              })

              const result = await response.json()

              if (result.success) {
                toast.success('Purchase successful! You now have access to this content.')
                if (onSuccess) {
                  onSuccess(result.purchase, result.accessToken)
                }
              } else {
                toast.error('Payment was successful but failed to grant access. Please contact support.')
              }
            } catch (error) {
              console.error('Payment processing error:', error)
              toast.error('Failed to process payment. Please contact support.')
            } finally {
              setProcessing(false)
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err)
            toast.error('Payment failed. Please try again.')
            setProcessing(false)
          },
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }
        }).render(`#paypal-button-container-${contentId}`)
      } catch (error) {
        console.error('PayPal button render error:', error)
      }
    }
  }, [sdkReady, amount, contentType, contentId, contentTitle, onSuccess, customerEmail, processing])

  if (!sdkReady) {
    return (
      <div className="text-center py-4">
        <div className="loader mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading payment options...</p>
      </div>
    )
  }

  return (
    <div>
      <div id={`paypal-button-container-${contentId}`} className="mt-4"></div>
      {processing && (
        <div className="text-center mt-4">
          <div className="loader mx-auto"></div>
          <p className="text-gray-400 mt-2">Processing payment...</p>
        </div>
      )}
    </div>
  )
}

export default PayPalButton
