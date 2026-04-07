import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'noreply@shopnest.com'
const STORE_NAME = 'ShopNest'
const STORE_URL = process.env.CLIENT_URL || 'http://localhost:3000'

// ── Base email template ───────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${STORE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111111;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:1px solid #222;">
              <h1 style="margin:0;font-size:28px;color:#ffffff;">
                Shop<span style="color:#f97316;">Nest</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background:#111111;padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111111;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0;color:#555;font-size:13px;">
                © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#444;font-size:12px;">
                <a href="${STORE_URL}" style="color:#f97316;text-decoration:none;">Visit Store</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ── Order items table ─────────────────────────────────────────
const orderItemsTable = (items) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:#1a1a1a;border-radius:12px;padding:20px;">
      ${items.map((item) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="color:#ffffff;font-size:14px;font-weight:500;">${item.productName}</td>
            <td align="right" style="color:#f97316;font-size:14px;font-weight:600;">
              $${Number(item.subtotal).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="color:#666;font-size:13px;">
              ${item.variantName ? item.variantName + ' · ' : ''}Qty: ${item.quantity} × $${Number(item.price).toFixed(2)}
            </td>
          </tr>
        </table>
      `).join('<hr style="border:none;border-top:1px solid #222;margin:12px 0;">')}
    </td>
  </tr>
</table>
`

// ── Order totals ──────────────────────────────────────────────
const orderTotals = (order) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="color:#888;font-size:14px;padding:4px 0;">Subtotal</td>
    <td align="right" style="color:#fff;font-size:14px;">$${Number(order.subtotal).toFixed(2)}</td>
  </tr>
  ${Number(order.discount) > 0 ? `
  <tr>
    <td style="color:#4ade80;font-size:14px;padding:4px 0;">Discount</td>
    <td align="right" style="color:#4ade80;font-size:14px;">-$${Number(order.discount).toFixed(2)}</td>
  </tr>` : ''}
  <tr>
    <td style="color:#888;font-size:14px;padding:4px 0;">Shipping</td>
    <td align="right" style="color:#fff;font-size:14px;">${Number(order.shippingFee) === 0 ? 'Free' : `$${Number(order.shippingFee).toFixed(2)}`}</td>
  </tr>
  <tr>
    <td style="color:#888;font-size:14px;padding:4px 0;">Tax</td>
    <td align="right" style="color:#fff;font-size:14px;">$${Number(order.tax).toFixed(2)}</td>
  </tr>
  <tr>
    <td style="border-top:1px solid #333;padding-top:12px;margin-top:8px;color:#fff;font-size:16px;font-weight:600;">Total</td>
    <td align="right" style="border-top:1px solid #333;padding-top:12px;color:#f97316;font-size:18px;font-weight:700;">$${Number(order.total).toFixed(2)}</td>
  </tr>
</table>
`

// ── Button ────────────────────────────────────────────────────
const button = (text, url) => `
<div style="text-align:center;margin:32px 0;">
  <a href="${url}" style="background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;display:inline-block;">
    ${text}
  </a>
</div>
`

// ── Send email helper ─────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      from: `${STORE_NAME} <${FROM}>`,
      to,
      subject,
      html,
    })
    console.log(`✉️  Email sent to ${to}: ${subject}`)
    return result
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message)
    // Don't throw — email failure shouldn't break the app
  }
}

// Welcome email ─────────────────────────────────────────
export const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;">Welcome to ${STORE_NAME}! 🎉</h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${user.firstName}, your account has been created successfully. 
      Start exploring thousands of products across every category.
    </p>
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:24px 0;">
      <p style="color:#f97316;font-size:14px;font-weight:600;margin:0 0 8px;">🎁 First order discount</p>
      <p style="color:#fff;font-size:20px;font-weight:700;margin:0;letter-spacing:2px;">WELCOME20</p>
      <p style="color:#666;font-size:13px;margin:8px 0 0;">Use this code for 20% off your first order</p>
    </div>
    ${button('Start Shopping', STORE_URL)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Welcome to ${STORE_NAME}! 🎉`,
    html,
  })
}

// ── 2. Order confirmation ─────────────────────────────────────
export const sendOrderConfirmationEmail = async (order, user) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Order Confirmed! ✅</h2>
    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
      Hi ${user.firstName}, we've received your order and it's being processed.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;">Order Number</td>
          <td align="right" style="color:#f97316;font-size:14px;font-weight:600;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Date</td>
          <td align="right" style="color:#fff;font-size:14px;padding-top:8px;">${new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Status</td>
          <td align="right" style="padding-top:8px;">
            <span style="background:#fef08a22;color:#fbbf24;padding:2px 10px;border-radius:20px;font-size:12px;">PENDING</span>
          </td>
        </tr>
      </table>
    </div>

    <h3 style="color:#fff;font-size:16px;margin:0 0 4px;">Items Ordered</h3>
    ${orderItemsTable(order.items)}
    ${orderTotals(order)}

    ${order.address ? `
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:24px 0 0;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Delivery Address</p>
      <p style="color:#fff;font-size:14px;margin:0;">${order.address.fullName}</p>
      <p style="color:#aaa;font-size:13px;margin:4px 0 0;">${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}</p>
    </div>` : ''}

    ${button('Track Your Order', `${STORE_URL}/orders/${order.id}`)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
  })
}

// ── 3. Payment confirmed ──────────────────────────────────────
export const sendPaymentConfirmedEmail = async (order, user) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Payment Received! 💳</h2>
    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
      Hi ${user.firstName}, your payment of <strong style="color:#f97316;">$${Number(order.total).toFixed(2)}</strong> has been confirmed.
      Your order is now being prepared.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;">Order Number</td>
          <td align="right" style="color:#f97316;font-size:14px;font-weight:600;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Amount Paid</td>
          <td align="right" style="color:#4ade80;font-size:16px;font-weight:700;padding-top:8px;">$${Number(order.total).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Status</td>
          <td align="right" style="padding-top:8px;">
            <span style="background:#4ade8022;color:#4ade80;padding:2px 10px;border-radius:20px;font-size:12px;">PAID</span>
          </td>
        </tr>
      </table>
    </div>

    ${button('View Order', `${STORE_URL}/orders/${order.id}`)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Payment Confirmed — ${order.orderNumber} ✅`,
    html,
  })
}

// ── 4. Order shipped ──────────────────────────────────────────
export const sendOrderShippedEmail = async (order, user, shipment) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Your Order is On Its Way! 🚚</h2>
    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
      Hi ${user.firstName}, great news! Your order <strong style="color:#f97316;">${order.orderNumber}</strong> has been shipped.
    </p>

    ${shipment?.trackingNumber ? `
    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Tracking Information</p>
      <p style="color:#fff;font-size:14px;margin:0;">Carrier: <strong>${shipment.carrier}</strong></p>
      <p style="color:#f97316;font-size:16px;font-weight:700;margin:8px 0 0;letter-spacing:1px;">${shipment.trackingNumber}</p>
      ${shipment.trackingUrl ? `
      <a href="${shipment.trackingUrl}" style="color:#f97316;font-size:13px;display:inline-block;margin-top:8px;">
        Track Package →
      </a>` : ''}
      ${shipment.estimatedAt ? `
      <p style="color:#888;font-size:13px;margin:12px 0 0;">
        Estimated Delivery: <strong style="color:#fff;">${new Date(shipment.estimatedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>
      </p>` : ''}
    </div>` : ''}

    <h3 style="color:#fff;font-size:16px;margin:0 0 4px;">Items Shipped</h3>
    ${orderItemsTable(order.items)}

    ${button('Track Your Order', `${STORE_URL}/orders/${order.id}`)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Your Order Has Shipped! 🚚 — ${order.orderNumber}`,
    html,
  })
}

// ── 5. Order delivered ────────────────────────────────────────
export const sendOrderDeliveredEmail = async (order, user) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Order Delivered! 📦</h2>
    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
      Hi ${user.firstName}, your order <strong style="color:#f97316;">${order.orderNumber}</strong> has been delivered. 
      We hope you love your purchase!
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center;">
      <p style="color:#888;font-size:14px;margin:0 0 12px;">How was your experience?</p>
      <p style="color:#fff;font-size:15px;margin:0 0 20px;">Leave a review and help other shoppers</p>
      <a href="${STORE_URL}/orders/${order.id}" style="background:#f97316;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block;">
        Write a Review ⭐
      </a>
    </div>

    ${button('Shop Again', STORE_URL)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Order Delivered! How was it? — ${order.orderNumber}`,
    html,
  })
}

// ── 6. Order cancelled ────────────────────────────────────────
export const sendOrderCancelledEmail = async (order, user) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Order Cancelled</h2>
    <p style="color:#aaa;font-size:15px;margin:0 0 24px;">
      Hi ${user.firstName}, your order <strong style="color:#f97316;">${order.orderNumber}</strong> has been cancelled.
      ${Number(order.total) > 0 ? 'A refund will be processed within 5-7 business days.' : ''}
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;">Order Number</td>
          <td align="right" style="color:#f97316;font-size:14px;font-weight:600;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Amount</td>
          <td align="right" style="color:#fff;font-size:14px;padding-top:8px;">$${Number(order.total).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <p style="color:#aaa;font-size:14px;">
      Have questions? Contact our support team.
    </p>

    ${button('Continue Shopping', STORE_URL)}
  `)

  await sendEmail({
    to: user.email,
    subject: `Order Cancelled — ${order.orderNumber}`,
    html,
  })
}

// ── 7. Password reset ─────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = baseTemplate(`
    <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">Reset Your Password 🔐</h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${user.firstName}, we received a request to reset your password. 
      Click the button below to create a new password.
    </p>

    <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="color:#888;font-size:13px;margin:0 0 16px;">This link expires in <strong style="color:#f97316;">1 hour</strong></p>
      <a href="${resetUrl}" style="background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;display:inline-block;">
        Reset Password
      </a>
    </div>

    <p style="color:#555;font-size:13px;margin:0;">
      If you didn't request this, you can safely ignore this email. Your password won't change.
    </p>
  `)

  await sendEmail({
    to: user.email,
    subject: `Reset Your ${STORE_NAME} Password`,
    html,
  })
}