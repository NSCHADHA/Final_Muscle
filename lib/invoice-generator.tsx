export interface InvoiceData {
  invoiceNumber: string
  date: string
  gymName: string
  gymAddress: string
  gymPhone: string
  gymEmail: string
  customerName: string
  customerPhone: string
  customerEmail: string
  items: {
    description: string
    quantity: number
    rate: number
    amount: number
  }[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.rate.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">₹${item.amount.toLocaleString()}</td>
    </tr>
  `,
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1f2937;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #e5e7eb;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .company-info h1 {
      margin: 0;
      font-size: 28px;
      color: #1f2937;
    }
    .company-info p {
      margin: 5px 0;
      color: #6b7280;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details h2 {
      margin: 0;
      font-size: 24px;
      color: #3b82f6;
    }
    .invoice-details p {
      margin: 5px 0;
      color: #6b7280;
    }
    .billing-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .section {
      flex: 1;
    }
    .section h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .section p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      text-transform: uppercase;
      color: #6b7280;
    }
    .totals {
      margin-top: 30px;
      text-align: right;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
    }
    .totals-label {
      width: 150px;
      text-align: right;
      padding-right: 20px;
      color: #6b7280;
    }
    .totals-value {
      width: 150px;
      text-align: right;
      font-weight: 600;
    }
    .total-row {
      border-top: 2px solid #e5e7eb;
      margin-top: 10px;
      padding-top: 10px;
    }
    .total-row .totals-label,
    .total-row .totals-value {
      font-size: 18px;
      color: #1f2937;
    }
    .payment-info {
      margin-top: 40px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .payment-info p {
      margin: 5px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>${data.gymName}</h1>
        <p>${data.gymAddress}</p>
        <p>Phone: ${data.gymPhone}</p>
        <p>Email: ${data.gymEmail}</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p><strong>#${data.invoiceNumber}</strong></p>
        <p>Date: ${new Date(data.date).toLocaleDateString()}</p>
        <p>
          <span class="status-badge ${data.paymentStatus === "completed" ? "status-paid" : "status-pending"}">
            ${data.paymentStatus === "completed" ? "PAID" : "PENDING"}
          </span>
        </p>
      </div>
    </div>

    <div class="billing-info">
      <div class="section">
        <h3>Bill To:</h3>
        <p><strong>${data.customerName}</strong></p>
        <p>${data.customerPhone}</p>
        ${data.customerEmail ? `<p>${data.customerEmail}</p>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 100px;">Qty</th>
          <th style="text-align: right; width: 120px;">Rate</th>
          <th style="text-align: right; width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <div class="totals-label">Subtotal:</div>
        <div class="totals-value">₹${data.subtotal.toLocaleString()}</div>
      </div>
      <div class="totals-row">
        <div class="totals-label">Tax (${data.tax > 0 ? "18% GST" : "0%"}):</div>
        <div class="totals-value">₹${data.tax.toLocaleString()}</div>
      </div>
      <div class="totals-row total-row">
        <div class="totals-label">Total:</div>
        <div class="totals-value">₹${data.total.toLocaleString()}</div>
      </div>
    </div>

    <div class="payment-info">
      <p><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</p>
      <p><strong>Payment Status:</strong> ${data.paymentStatus === "completed" ? "Paid in Full" : "Pending Payment"}</p>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>Generated by MuscleDesk - Gym Management Software</p>
    </div>
  </div>
</body>
</html>
  `
}

export function downloadInvoicePDF(html: string, filename: string) {
  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print()

      // Optional: Close window after printing (user can cancel)
      setTimeout(() => {
        if (printWindow.document.hasFocus()) {
          printWindow.close()
        }
      }, 500)
    }
  }
}
