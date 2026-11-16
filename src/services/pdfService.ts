import { jsPDF } from 'jspdf';
import { CanopyConfig, TentFace, TENT_SIZE_OPTIONS } from '../types/configurator';
import { PricingSummary } from '../types/pricing';

export interface GeneratePdfOptions {
  config: CanopyConfig;
  pricing: PricingSummary;
  screenshotDataUrl?: string;
  customerName?: string;
  orderNotes?: string;
}

export function generateSpecSheetPdf({
  config,
  pricing,
  screenshotDataUrl,
  customerName = 'Valued Customer',
  orderNotes = '',
}: GeneratePdfOptions): jsPDF {
  // Create A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // --- HEADER SECTION ---
  // Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(2, 132, 199); // brand-500 cyan accent bar
  doc.rect(0, 27, pageWidth, 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${config.size} COMMERCIAL CANOPY TENT`, margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('FACTORY PRODUCTION SPECIFICATION SHEET & BILL OF MATERIALS', margin, 18);

  // Reference & Date Badge (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(`CONFIG ID: ${config.id}`, pageWidth - margin, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin, 17, { align: 'right' });
  doc.text(`Customer: ${customerName}`, pageWidth - margin, 22, { align: 'right' });

  let currentY = 36;

  // --- 3D RENDERING SNAPSHOT & KEY METRICS ---
  const snapshotWidth = 92;
  const snapshotHeight = 65;

  if (screenshotDataUrl) {
    try {
      // Add subtle border container for snapshot
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, snapshotWidth, snapshotHeight, 2, 2, 'FD');

      doc.addImage(screenshotDataUrl, 'PNG', margin + 1, currentY + 1, snapshotWidth - 2, snapshotHeight - 2);
    } catch {
      // Fallback placeholder
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, snapshotWidth, snapshotHeight, 2, 2, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('[3D View Preview Attached]', margin + snapshotWidth / 2, currentY + snapshotHeight / 2, { align: 'center' });
    }
  } else {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, snapshotWidth, snapshotHeight, 2, 2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text('[3D Render Unavailable]', margin + snapshotWidth / 2, currentY + snapshotHeight / 2, { align: 'center' });
  }

  // Right Side: Technical Specs Card
  const specCardX = margin + snapshotWidth + 6;
  const specCardWidth = pageWidth - margin - specCardX;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(specCardX, currentY, specCardWidth, snapshotHeight, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ENGINEERING & FABRIC SPECS', specCardX + 4, currentY + 7);

  doc.setDrawColor(2, 132, 199);
  doc.line(specCardX + 4, currentY + 9, specCardX + 38, currentY + 9);

  const specs = [
    ['Footprint Size:', TENT_SIZE_OPTIONS[config.size]?.dimensions || `${config.size} Footprint`],
    ['Peak Height:', '10ft 8in (3.25m)'],
    ['Eaves Clearance:', '6ft 8in (2.05m)'],
    ['Canopy Fabric:', '600D PU Polyester (UV50+)'],
    ['Fire Compliance:', 'CPAI-84 Section 6 / NFPA 701'],
    ['Frame Hardware:', config.frame.type.replace('-', ' ').toUpperCase()],
    ['Frame Finish:', config.frame.finish.toUpperCase()],
    ['Primary Hex Color:', config.baseColor],
  ];

  doc.setFontSize(7.5);
  specs.forEach(([label, val], idx) => {
    const itemY = currentY + 15 + idx * 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label, specCardX + 4, itemY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(val, specCardX + 34, itemY);
  });

  currentY += snapshotHeight + 8;

  // --- ARTWORK & GRAPHICS SCHEDULE TABLE ---
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PRINT & ARTWORK SCHEDULE BY TENT LOCATION', margin + 3, currentY + 4.2);

  currentY += 6;

  const tableCols = [
    { title: 'Location', x: margin + 2, w: 28 },
    { title: 'Part Type', x: margin + 30, w: 26 },
    { title: 'Base Color', x: margin + 56, w: 26 },
    { title: 'Printed Copy / Text', x: margin + 82, w: 60 },
    { title: 'Artwork / Logo File', x: margin + 142, w: 40 },
  ];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - margin * 2, 5, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  tableCols.forEach(col => doc.text(col.title, col.x, currentY + 3.5));

  currentY += 5;

  const scheduleRows: { loc: string; type: string; color: string; text: string; logo: string }[] = [];
  const faces: TentFace[] = ['front', 'back', 'left', 'right'];

  faces.forEach(f => {
    const peak = config.peaks[f];
    scheduleRows.push({
      loc: `${f.toUpperCase()} FACE`,
      type: 'Roof Peak',
      color: peak.color || config.baseColor,
      text: peak.text || '(None)',
      logo: peak.logoUrl ? 'Vector Logo Attached' : '(None)',
    });

    const valance = config.valances[f];
    scheduleRows.push({
      loc: `${f.toUpperCase()} VALANCE`,
      type: 'Valance Drop',
      color: valance.color || config.baseColor,
      text: valance.text || '(None)',
      logo: valance.logoUrl ? 'Vector Logo Attached' : '(None)',
    });

    const wall = config.walls[f];
    if (wall.type !== 'none') {
      scheduleRows.push({
        loc: `${f.toUpperCase()} WALL`,
        type: `Wall: ${wall.type.toUpperCase()}`,
        color: wall.color,
        text: wall.graphics.text || '(None)',
        logo: wall.graphics.logoUrl ? 'Full Bleed Logo Attached' : '(None)',
      });
    }
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  scheduleRows.slice(0, 10).forEach((row, i) => {
    const rowY = currentY + 4.5;
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, pageWidth - margin * 2, 5.5, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.text(row.loc, tableCols[0].x, rowY);
    doc.text(row.type, tableCols[1].x, rowY);

    // Color swatch chip
    doc.text(row.color, tableCols[2].x, rowY);

    // Truncate text if needed
    const safeText = row.text.length > 34 ? `${row.text.substring(0, 31)}...` : row.text;
    doc.text(safeText, tableCols[3].x, rowY);
    doc.text(row.logo, tableCols[4].x, rowY);

    currentY += 5.5;
  });

  currentY += 4;

  // --- BILL OF MATERIALS & PRICING TABLE ---
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEMIZED BILL OF MATERIALS (BOM) & FINANCIAL SUMMARY', margin + 3, currentY + 4.2);

  currentY += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - margin * 2, 5, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Line Item Description', margin + 3, currentY + 3.5);
  doc.text('Qty', pageWidth - margin - 48, currentY + 3.5, { align: 'right' });
  doc.text('Unit ($)', pageWidth - margin - 26, currentY + 3.5, { align: 'right' });
  doc.text('Total ($)', pageWidth - margin - 3, currentY + 3.5, { align: 'right' });

  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  pricing.lineItems.forEach((item, idx) => {
    const rowY = currentY + 4.2;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, pageWidth - margin * 2, 5.2, 'F');
    }
    doc.setTextColor(15, 23, 42);
    const itemName = item.name.length > 55 ? `${item.name.substring(0, 52)}...` : item.name;
    doc.text(itemName, margin + 3, rowY);
    doc.text(String(item.quantity), pageWidth - margin - 48, rowY, { align: 'right' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - margin - 26, rowY, { align: 'right' });
    doc.text(`$${item.total.toFixed(2)}`, pageWidth - margin - 3, rowY, { align: 'right' });

    currentY += 5.2;
  });

  // Summary Totals Box
  currentY += 2;
  const totalsBoxWidth = 75;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 23, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalsBoxX + 4, currentY + 5.5);
  doc.text(`$${pricing.subtotal.toFixed(2)}`, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

  doc.text('Estimated Sales Tax (8.25%):', totalsBoxX + 4, currentY + 10.5);
  doc.text(`$${pricing.estimatedTax.toFixed(2)}`, pageWidth - margin - 4, currentY + 10.5, { align: 'right' });

  doc.text('Freight Ground Shipping:', totalsBoxX + 4, currentY + 15.5);
  doc.text(pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`, pageWidth - margin - 4, currentY + 15.5, { align: 'right' });

  doc.setFillColor(2, 132, 199);
  doc.rect(totalsBoxX, currentY + 17.5, totalsBoxWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT:', totalsBoxX + 4, currentY + 21.5);
  doc.text(`$${pricing.total.toFixed(2)} USD`, pageWidth - margin - 4, currentY + 21.5, { align: 'right' });

  // Order Notes & Sign-off on left
  if (orderNotes) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Production Notes:', margin, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(orderNotes, margin, currentY + 11, { maxWidth: 90 });
  }

  // --- SIGN OFF & FOOTER ---
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Client Pre-Flight Approval: ___________________________  Date: ______________', margin, footerY);
  doc.text('QA Pre-Press Technician: ___________________________', margin + 105, footerY);
  doc.text('Page 1 of 1 • 10x10 Custom Canopy 3D Web Configurator Platform', pageWidth - margin, footerY + 5, { align: 'right' });

  return doc;
}
