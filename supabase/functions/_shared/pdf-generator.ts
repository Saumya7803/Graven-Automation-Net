import jsPDF from 'https://esm.sh/jspdf@2.5.1';
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.2';

interface QuotationData {
  id: string;
  created_at: string;
  expires_at: string | null;
  status: string;
  customer_name: string;
  customer_email: string;
  company_name: string | null;
  customer_phone: string | null;
  customer_gst: string | null;
  billing_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  final_amount: number | null;
  discount_amount: number | null;
  discount_percentage: number | null;
  quote_notes: string | null;
}

interface QuotationItem {
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  discount_percentage: number | null;
  final_price: number;
}

// Base64 encoded company logo (set to empty to use URL fallback strategy)
const LOGO_BASE64 = '';

export async function generateQuotationPDF(
  quotation: QuotationData,
  items: QuotationItem[]
): Promise<Uint8Array> {
  const doc = new jsPDF({
    compress: true,
    precision: 2
  });

  // Green header background bar at top
  doc.setFillColor(22, 163, 74); // Green color
  doc.rect(0, 0, 210, 12, 'F'); // Full width green bar

  // Company name in white text on green background
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('SCHNEIDERVFD.COM', 195, 8, { align: 'right' });

  // Reset text color to black for rest of document
  doc.setTextColor(0, 0, 0);

  // Load company logo with dual strategy: Base64 first (most reliable), then URL fallback
  const logoUrl = 'https://4cd2defb-be6f-4f0c-8a9d-fd488f263d38.lovableproject.com/company-logo.png';
  
  let logoData: string | null = null;

  // Strategy 1: Use embedded base64 (most reliable for edge functions)
  if (LOGO_BASE64) {
    logoData = LOGO_BASE64;
    console.log('✅ Using embedded base64 logo');
  } else {
    // Strategy 2: Try public URL as fallback
    try {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const blob = await response.blob();
        
        // Verify it's a valid image
        if (blob.type.startsWith('image/')) {
          logoData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          console.log('✅ Logo loaded successfully from public URL');
        }
      } else {
        console.warn('⚠️ Logo URL returned status:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load logo from URL:', error);
    }
  }

  // Add logo if we have it (from either strategy)
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 15, 18, 50, 50);
      console.log('✅ Logo added to PDF successfully');
    } catch (error) {
      console.error('❌ Failed to add logo to PDF:', error);
    }
  } else {
    console.warn('⚠️ No logo data available, continuing without logo');
  }

  // Company Header - Horizontal layout next to logo (moved down)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAVEN AUTOMATION PRIVATE LIMITED', 75, 30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('7/25, Tower F, 2nd Floor Kirti Nagar Industrial Area Delhi - India - 110015', 75, 38);

  // Email and Website on same line with separator
  doc.text('Email : sales@gravenautomation.com  ||  Website: www.powerflowautomation.com', 75, 46);

  // GST, PAN, IEC on same line with spacing
  doc.text('GST: 07AAKCG1025G1ZX (Company)        PAN: AAKCG1025G        IEC: AAKCG1025G', 75, 54);

  // Quotation Details - Plain text layout (no box)
  const quotationNumber = `QR-${quotation.id.slice(0, 8).toUpperCase()}`;
  const createdDate = new Date(quotation.created_at).toLocaleDateString('en-GB');
  const expiryDate = quotation.expires_at 
    ? new Date(quotation.expires_at).toLocaleDateString('en-GB')
    : 'N/A';

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left side
  doc.text(`Quotation #: ${quotationNumber}`, 20, 78);
  doc.text(`Valid Until: ${expiryDate}`, 20, 85);

  // Right side
  doc.text(`Date: ${createdDate}`, 195, 78, { align: 'right' });
  doc.text(`Status: ${quotation.status.toUpperCase()}`, 195, 85, { align: 'right' });

  // BILL TO Section with green border
  const billToX = 20;
  const billToY = 96;
  const boxWidth = 85;
  const boxHeight = 50;

  // Green bordered box for BILL TO
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.rect(billToX, billToY, boxWidth, boxHeight);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', billToX + 3, billToY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let billTextY = billToY + 15;

  doc.text(`Name: ${quotation.customer_name}`, billToX + 3, billTextY);
  billTextY += 5;

  if (quotation.company_name) {
    doc.text(`Company: ${quotation.company_name}`, billToX + 3, billTextY);
    billTextY += 5;
  }

  if (quotation.billing_address) {
    const addressLine1 = `Address: ${quotation.billing_address.street || ''}`;
    const addressLine2 = `${quotation.billing_address.city || ''} ${quotation.billing_address.state || ''} ${quotation.billing_address.zip || ''}.`;
    
    doc.text(addressLine1, billToX + 3, billTextY);
    billTextY += 5;
    doc.text(addressLine2, billToX + 3, billTextY);
    billTextY += 5;
  }

  doc.text(`Email: ${quotation.customer_email}`, billToX + 3, billTextY);
  billTextY += 5;

  if (quotation.customer_phone) {
    const phoneFormatted = quotation.customer_phone.startsWith('+') 
      ? quotation.customer_phone 
      : `+91 ${quotation.customer_phone}`;
    doc.text(`Phone: ${phoneFormatted}`, billToX + 3, billTextY);
    billTextY += 5;
  }

  // SHIP TO Section with green border
  const shipToX = 110;
  const shipToY = 96;

  // Green bordered box for SHIP TO
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.rect(shipToX, shipToY, boxWidth, boxHeight);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO:', shipToX + 3, shipToY + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let shipTextY = shipToY + 15;

  doc.text(`Name: ${quotation.customer_name}`, shipToX + 3, shipTextY);
  shipTextY += 5;

  if (quotation.company_name) {
    doc.text(`Company: ${quotation.company_name}`, shipToX + 3, shipTextY);
    shipTextY += 5;
  }

  if (quotation.shipping_address) {
    const addressLine1 = `Address: ${quotation.shipping_address.street || ''}`;
    const addressLine2 = `${quotation.shipping_address.city || ''} ${quotation.shipping_address.state || ''} ${quotation.shipping_address.zip || ''}.`;
    
    doc.text(addressLine1, shipToX + 3, shipTextY);
    shipTextY += 5;
    doc.text(addressLine2, shipToX + 3, shipTextY);
    shipTextY += 5;
  }

  doc.text(`Email: ${quotation.customer_email}`, shipToX + 3, shipTextY);
  shipTextY += 5;

  if (quotation.customer_phone) {
    const phoneFormatted = quotation.customer_phone.startsWith('+') 
      ? quotation.customer_phone 
      : `+91 ${quotation.customer_phone}`;
    doc.text(`Phone: ${phoneFormatted}`, shipToX + 3, shipTextY);
    shipTextY += 5;
  }

  // Product Table - Show only SKU codes
  const tableStartY = 153;

  // Helper function to format numbers in Indian format with null safety
const formatIndianCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'INR 0.00';
  }
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `INR ${formatted}`;
};

  // Calculate totals first
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.unit_price || 0;
    const itemTotal = item.final_price || (item.quantity * unitPrice);
    return sum + itemTotal;
  }, 0);

  const GST_RATE = 0.18;
  const gstAmount = subtotal * GST_RATE;
  const grandTotal = subtotal + gstAmount;

  // Build table data with items AND totals in same array
  const tableData = [
    // Item rows
    ...items.map((item, index) => {
      const unitPrice = item.unit_price || 0;
      const totalAmount = item.final_price || (item.quantity * unitPrice);
      
      console.log(`📦 Item ${index + 1}: SKU=${item.product_sku}, Qty=${item.quantity}, UnitPrice=${unitPrice}, Total=${totalAmount}`);
      
      return [
        index + 1,
        item.product_sku || item.product_name,
        item.quantity,
        formatIndianCurrency(unitPrice),
        formatIndianCurrency(totalAmount)
      ];
    })
  ];

  autoTable(doc, {
    startY: tableStartY,
    head: [['SL No.', 'ITEM', 'Quantity', 'Unit Price', 'Total Amount']],
    body: tableData,
    foot: [
      ['', '', '', 'SUB TOTAL', formatIndianCurrency(subtotal)],
      ['', '', '', 'GST (18%)', formatIndianCurrency(gstAmount)],
      ['', '', '', 'TOTAL', formatIndianCurrency(grandTotal)]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 9.5,
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9.5,
      halign: 'right',
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 75, halign: 'left' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });

  // Get the final Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 50;

  // Quote Notes Section
  if (quotation.quote_notes && quotation.quote_notes.trim()) {
    const notesY = (doc as any).lastAutoTable?.finalY + 10 || finalY + 60;
    
    // Notes header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, notesY);
    
    // Notes content in a box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, notesY + 3, 170, 20);
    
    // Split long notes into multiple lines
    const splitNotes = doc.splitTextToSize(quotation.quote_notes, 165);
    doc.text(splitNotes, 22, notesY + 9);
  }

  // Footer - Only "Thank You!"
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank You!', 105, pageHeight - 30, { align: 'center' });

  // Return PDF as Uint8Array
  const pdfOutput = doc.output('arraybuffer');
  return new Uint8Array(pdfOutput);
}
