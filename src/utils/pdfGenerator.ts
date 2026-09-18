import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, CompanyProfile } from '../types';

export function calculateBudgetTotals(budget: Budget) {
  const subtotal = budget.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const discountAmount = subtotal * ((Number(budget.discountRate) || 0) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * ((Number(budget.taxRate) || 0) / 100);
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}

export function formatMoney(amount: number, currency: string = '$'): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${currency} ${formatted}`;
}

export function createBudgetPDF(budget: Budget, profile: CompanyProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totals = calculateBudgetTotals(budget);
  const currency = budget.currency || '$';

  // Palette: Professional Slate & Emerald/Navy
  const primaryColor = [30, 41, 59] as [number, number, number]; // Slate 800
  const accentColor = [14, 116, 144] as [number, number, number]; // Cyan 700 / Slate
  const textColor = [51, 65, 85] as [number, number, number]; // Slate 700
  const lightGray = [241, 245, 249] as [number, number, number]; // Slate 100

  // Top header banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 8, 'F');

  // Title and Budget number
  doc.setTextColor(...primaryColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', 15, 24);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº: ${budget.number || '0001'}`, 15, 30);
  doc.text(`Fecha: ${budget.date || new Date().toISOString().split('T')[0]}`, 15, 35);
  if (budget.validUntil) {
    doc.text(`Vigencia hasta: ${budget.validUntil}`, 15, 40);
  }

  // Issuer Info (Right side)
  const rightAlignX = 195;
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  const companyName = profile.name?.trim() || 'Mi Empresa / Profesional';
  doc.text(companyName, rightAlignX, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  let yRight = 28;
  if (profile.taxId) {
    doc.text(`Identificación / ID: ${profile.taxId}`, rightAlignX, yRight, { align: 'right' });
    yRight += 5;
  }
  if (profile.phone) {
    doc.text(`Tel: ${profile.phone}`, rightAlignX, yRight, { align: 'right' });
    yRight += 5;
  }
  if (profile.email) {
    doc.text(`Email: ${profile.email}`, rightAlignX, yRight, { align: 'right' });
    yRight += 5;
  }
  if (profile.address) {
    doc.text(profile.address, rightAlignX, yRight, { align: 'right' });
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 46, 195, 46);

  // Client Box (Para:)
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, 50, 180, 24, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('CLIENTE / DESTINATARIO:', 20, 56);

  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(budget.client.name?.trim() || 'Cliente sin especificar', 20, 62);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  const clientContactParts = [];
  if (budget.client.phone) clientContactParts.push(`Tel: ${budget.client.phone}`);
  if (budget.client.email) clientContactParts.push(`Email: ${budget.client.email}`);
  if (budget.client.address) clientContactParts.push(`Dirección: ${budget.client.address}`);

  const clientContactText = clientContactParts.join('  •  ') || 'Sin datos adicionales de contacto';
  doc.text(clientContactText, 20, 68);

  // Items Table
  const tableRows = (budget.items.length > 0 ? budget.items : [
    { id: '1', description: 'Item de ejemplo', quantity: 1, unitPrice: 0 },
  ]).map((item, index) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineTotal = qty * price;
    return [
      (index + 1).toString(),
      item.description || 'Sin descripción',
      qty.toString(),
      formatMoney(price, currency),
      formatMoney(lineTotal, currency),
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Descripción / Concepto', 'Cant.', 'Precio Unit.', 'Importe']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
    },
    styles: {
      fontSize: 9,
      textColor: textColor,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 15, right: 15 },
  });

  // Calculate position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  // Totals Box (Right aligned)
  const totalsStartX = 115;
  const totalsWidth = 80;
  let curY = finalY + 8;

  // Background card for totals
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsStartX, curY, totalsWidth, budget.discountRate > 0 || budget.taxRate > 0 ? 36 : 22, 2, 2, 'FD');

  curY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text('Subtotal:', totalsStartX + 5, curY);
  doc.text(formatMoney(totals.subtotal, currency), totalsStartX + totalsWidth - 5, curY, { align: 'right' });

  if (budget.discountRate > 0) {
    curY += 6;
    doc.text(`Descuento (${budget.discountRate}%):`, totalsStartX + 5, curY);
    doc.setTextColor(220, 38, 38);
    doc.text(`-${formatMoney(totals.discountAmount, currency)}`, totalsStartX + totalsWidth - 5, curY, { align: 'right' });
    doc.setTextColor(...textColor);
  }

  if (budget.taxRate > 0) {
    curY += 6;
    doc.text(`IVA / Impuesto (${budget.taxRate}%):`, totalsStartX + 5, curY);
    doc.text(formatMoney(totals.taxAmount, currency), totalsStartX + totalsWidth - 5, curY, { align: 'right' });
  }

  curY += 8;
  doc.setFillColor(...primaryColor);
  doc.rect(totalsStartX, curY - 5, totalsWidth, 11, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', totalsStartX + 5, curY + 2);
  doc.text(formatMoney(totals.total, currency), totalsStartX + totalsWidth - 5, curY + 2, { align: 'right' });

  // Notes and payment terms (Left aligned)
  if (budget.notes?.trim()) {
    const notesY = finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Notas y condiciones:', 15, notesY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textColor);
    const splitNotes = doc.splitTextToSize(budget.notes.trim(), 90);
    doc.text(splitNotes, 15, notesY + 10);
  }

  // Footer banner
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Presupuesto generado con Generador de Presupuestos • Válido como propuesta comercial`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
}

export function downloadBudgetPDF(budget: Budget, profile: CompanyProfile) {
  const doc = createBudgetPDF(budget, profile);
  const cleanNumber = (budget.number || '001').replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanClient = (budget.client.name || 'cliente').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`Presupuesto_${cleanNumber}_${cleanClient}.pdf`);
}

export function getBudgetPDFBlob(budget: Budget, profile: CompanyProfile): Blob {
  const doc = createBudgetPDF(budget, profile);
  return doc.output('blob');
}
