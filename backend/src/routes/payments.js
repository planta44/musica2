import express from 'express';
import Stripe from 'stripe';
import fetch from 'node-fetch';
import prisma from '../lib/prisma.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Create Stripe Checkout session for music purchase
router.post('/stripe/create-music-session', async (req, res) => {
  try {
    const { musicItemId, customerEmail } = req.body;
    
    const musicItem = await prisma.musicItem.findUnique({
      where: { id: musicItemId }
    });
    
    if (!musicItem || !musicItem.isPurchasable) {
      return res.status(400).json({ error: 'Item not available for purchase' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: musicItem.title,
            description: musicItem.description || '',
            images: musicItem.thumbnailUrl ? [musicItem.thumbnailUrl] : []
          },
          unit_amount: Math.round(musicItem.price * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/music`,
      customer_email: customerEmail,
      metadata: {
        type: 'music',
        musicItemId: musicItem.id
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe Checkout session for live event access
router.post('/stripe/create-live-session', async (req, res) => {
  try {
    const { liveEventId, customerEmail } = req.body;
    
    const event = await prisma.liveEvent.findUnique({
      where: { id: liveEventId }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Live event not found' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Live Event: ${event.title}`,
            description: event.description || 'Access to live streaming event',
            images: event.thumbnailUrl ? [event.thumbnailUrl] : []
          },
          unit_amount: Math.round(event.accessFee * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/live/${liveEventId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/live/${liveEventId}`,
      customer_email: customerEmail,
      metadata: {
        type: 'live_event',
        liveEventId: event.id,
        customerEmail
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe Checkout session for fan club access
router.post('/stripe/create-fanclub-session', async (req, res) => {
  try {
    const { customerEmail, customerName } = req.body;
    
    const settings = await prisma.siteSettings.findFirst();
    const fee = settings?.fanClubAccessFee || 5.0;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Fan Club Live Access',
            description: 'Access to exclusive live streams and content'
          },
          unit_amount: Math.round(fee * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/fan-club/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/fan-club`,
      customer_email: customerEmail,
      metadata: {
        type: 'fan_club',
        customerName
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create donation session
router.post('/stripe/create-donation-session', async (req, res) => {
  try {
    const { amount, customerEmail } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Support & Donation',
            description: 'Thank you for your support!'
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/support/success`,
      cancel_url: `${process.env.FRONTEND_URL}/support`,
      customer_email: customerEmail,
      metadata: {
        type: 'donation'
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          type: session.metadata.type,
          amount: session.amount_total / 100,
          paymentMethod: 'stripe',
          status: 'completed',
          customerId: session.customer,
          metadata: JSON.stringify(session.metadata)
        }
      });
      
      // Handle different payment types
      if (session.metadata.type === 'music') {
        // Grant access to music download
        const musicItemId = session.metadata.musicItemId;
        const crypto = await import('crypto');
        const accessToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await prisma.purchase.create({
          data: {
            musicItemId,
            customerEmail: session.customer_email,
            accessToken,
            expiresAt
          }
        });
      } else if (session.metadata.type === 'fan_club') {
        // Grant fan club access
        const accessExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        
        await prisma.subscriber.upsert({
          where: { email: session.customer_email },
          update: {
            hasAccess: true,
            accessExpiry,
            isFanClub: true
          },
          create: {
            email: session.customer_email,
            name: session.metadata.customerName,
            isFanClub: true,
            hasAccess: true,
            accessExpiry
          }
        });
        
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            subscriber: {
              connect: { email: session.customer_email }
            }
          }
        });
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// PayPal helper to get access token
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`https://api-m.paypal.com/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
};

// PayPal create order for music purchase
router.post('/paypal/create-music-order', async (req, res) => {
  try {
    const { musicItemId, customerEmail } = req.body;
    
    const musicItem = await prisma.musicItem.findUnique({
      where: { id: musicItemId }
    });
    
    if (!musicItem || !musicItem.isPurchasable) {
      return res.status(400).json({ error: 'Item not available for purchase' });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: musicItem.price.toFixed(2)
        },
        description: `${musicItem.title} - ${musicItem.artist}`,
        custom_id: JSON.stringify({
          type: 'music',
          musicItemId: musicItem.id,
          customerEmail
        })
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/purchase/success`,
        cancel_url: `${process.env.FRONTEND_URL}/music`,
        brand_name: 'Musician Store',
        user_action: 'PAY_NOW'
      }
    };
    
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });
    
    const order = await response.json();
    res.json({ orderId: order.id, approvalUrl: order.links.find(link => link.rel === 'approve')?.href });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal create order for live event
router.post('/paypal/create-live-order', async (req, res) => {
  try {
    const { liveEventId, customerEmail } = req.body;
    
    const event = await prisma.liveEvent.findUnique({
      where: { id: liveEventId }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Live event not found' });
    }
    
    const settings = await prisma.siteSettings.findFirst();
    const fee = settings?.liveEventFee || 5.0;
    
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: fee.toFixed(2)
        },
        description: `Live Event Access: ${event.title}`,
        custom_id: JSON.stringify({
          type: 'live_event',
          liveEventId: event.id,
          customerEmail
        })
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/live/${liveEventId}?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/live/${liveEventId}`,
        brand_name: 'Live Events',
        user_action: 'PAY_NOW'
      }
    };
    
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });
    
    const order = await response.json();
    res.json({ orderId: order.id, approvalUrl: order.links.find(link => link.rel === 'approve')?.href });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal create order for merchandise
router.post('/paypal/create-merch-order', async (req, res) => {
  try {
    const { merchItemId, customerEmail, quantity = 1 } = req.body;
    
    const merchItem = await prisma.merchItem.findUnique({
      where: { id: merchItemId }
    });
    
    if (!merchItem) {
      return res.status(404).json({ error: 'Merch item not found' });
    }
    
    const totalAmount = (merchItem.price * quantity).toFixed(2);
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: totalAmount
        },
        description: `${merchItem.name} (x${quantity})`,
        custom_id: JSON.stringify({
          type: 'merchandise',
          merchItemId: merchItem.id,
          customerEmail,
          quantity
        })
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/merch/success`,
        cancel_url: `${process.env.FRONTEND_URL}/merch`,
        brand_name: 'Merch Store',
        user_action: 'PAY_NOW'
      }
    };
    
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });
    
    const order = await response.json();
    res.json({ orderId: order.id, approvalUrl: order.links.find(link => link.rel === 'approve')?.href });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal create order for support/donation
router.post('/paypal/create-support-order', async (req, res) => {
  try {
    const { amount, customerEmail, message } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: parseFloat(amount).toFixed(2)
        },
        description: message || 'Support & Donation',
        custom_id: JSON.stringify({
          type: 'support',
          customerEmail,
          message
        })
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/support/success`,
        cancel_url: `${process.env.FRONTEND_URL}/support`,
        brand_name: 'Artist Support',
        user_action: 'PAY_NOW'
      }
    };
    
    const response = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });
    
    const order = await response.json();
    res.json({ orderId: order.id, approvalUrl: order.links.find(link => link.rel === 'approve')?.href });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PayPal capture order
router.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const captureData = await response.json();
    
    if (captureData.status === 'COMPLETED') {
      const customData = JSON.parse(captureData.purchase_units[0].custom_id);
      const amount = parseFloat(captureData.purchase_units[0].amount.value);
      
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          type: customData.type,
          amount: amount,
          paymentMethod: 'paypal',
          status: 'completed',
          metadata: JSON.stringify({
            orderId: captureData.id,
            ...customData
          })
        }
      });
      
      // Handle different payment types
      if (customData.type === 'music') {
        const crypto = await import('crypto');
        const accessToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year access
        
        const purchase = await prisma.purchase.create({
          data: {
            contentType: 'music',
            musicItemId: customData.musicItemId,
            customerEmail: customData.customerEmail,
            amount: amount,
            paymentMethod: 'paypal',
            paymentId: captureData.id,
            paymentStatus: 'completed',
            accessToken,
            expiresAt
          }
        });
        
        return res.json({
          success: true,
          type: 'music',
          accessToken: purchase.accessToken,
          musicItemId: customData.musicItemId
        });
      } else if (customData.type === 'live_event') {
        const crypto = await import('crypto');
        const accessToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days access
        
        const purchase = await prisma.purchase.create({
          data: {
            contentType: 'live_event',
            customerEmail: customData.customerEmail,
            amount: amount,
            paymentMethod: 'paypal',
            paymentId: captureData.id,
            paymentStatus: 'completed',
            accessToken,
            expiresAt
          }
        });
        
        return res.json({
          success: true,
          type: 'live_event',
          accessToken: purchase.accessToken,
          liveEventId: customData.liveEventId
        });
      } else if (customData.type === 'merchandise') {
        const order = await prisma.order.create({
          data: {
            customerEmail: customData.customerEmail,
            totalAmount: amount,
            status: 'completed',
            paymentType: 'paypal',
            paymentId: captureData.id,
            items: {
              create: [{
                merchId: customData.merchItemId,
                quantity: customData.quantity || 1,
                price: amount / (customData.quantity || 1)
              }]
            }
          }
        });
        
        return res.json({
          success: true,
          type: 'merchandise',
          orderId: order.id
        });
      } else if (customData.type === 'support') {
        return res.json({
          success: true,
          type: 'support',
          message: 'Thank you for your support!'
        });
      }
    }
    
    res.json({ success: true, captureData });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: error.message });
  }
});

// M-Pesa STK Push
router.post('/mpesa/stk-push', async (req, res) => {
  try {
    const { phoneNumber, amount, type, metadata } = req.body;
    
    // This is a placeholder - implement actual M-Pesa Daraja API integration
    const transaction = {
      id: `MPESA_${Date.now()}`,
      phoneNumber,
      amount,
      type,
      metadata,
      status: 'pending'
    };
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// M-Pesa callback
router.post('/mpesa/callback', async (req, res) => {
  try {
    // Handle M-Pesa callback
    console.log('M-Pesa callback:', req.body);
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify music purchase access
router.get('/verify-music-access/:musicItemId', async (req, res) => {
  try {
    const { musicItemId } = req.params;
    const { email, accessToken } = req.query;
    
    if (!email && !accessToken) {
      return res.json({ hasAccess: false, message: 'No credentials provided' });
    }
    
    const purchase = await prisma.purchase.findFirst({
      where: {
        musicItemId,
        ...(accessToken ? { accessToken } : { customerEmail: email }),
        paymentStatus: 'completed',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      }
    });
    
    if (purchase) {
      return res.json({ 
        hasAccess: true, 
        accessToken: purchase.accessToken,
        expiresAt: purchase.expiresAt 
      });
    }
    
    res.json({ hasAccess: false, message: 'No valid purchase found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify live event access
router.get('/verify-live-access/:liveEventId', async (req, res) => {
  try {
    const { liveEventId } = req.params;
    const { email, accessToken } = req.query;
    
    if (!email && !accessToken) {
      return res.json({ hasAccess: false, message: 'No credentials provided' });
    }
    
    const purchase = await prisma.purchase.findFirst({
      where: {
        contentType: 'live_event',
        ...(accessToken ? { accessToken } : { customerEmail: email }),
        paymentStatus: 'completed',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      }
    });
    
    if (purchase) {
      return res.json({ 
        hasAccess: true, 
        accessToken: purchase.accessToken,
        expiresAt: purchase.expiresAt 
      });
    }
    
    res.json({ hasAccess: false, message: 'No valid access found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        subscriber: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify session after checkout
router.get('/stripe/verify-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid') {
      if (session.metadata.type === 'music') {
        // Return access token
        const purchase = await prisma.purchase.findFirst({
          where: {
            customerEmail: session.customer_email,
            musicItemId: session.metadata.musicItemId
          },
          orderBy: { createdAt: 'desc' }
        });
        
        return res.json({
          success: true,
          type: 'music',
          accessToken: purchase?.accessToken,
          musicItemId: session.metadata.musicItemId
        });
      } else if (session.metadata.type === 'fan_club') {
        return res.json({
          success: true,
          type: 'fan_club',
          message: 'You now have fan club access!'
        });
      }
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
