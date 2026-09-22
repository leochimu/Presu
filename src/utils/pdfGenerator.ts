import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, CompanyProfile } from '../types';
import { createDefaultTechnicalReport } from './technicalReportDefaults';
import { formatDisplayDate } from './dateUtils';

export function calculateBudgetTotals(budget: Budget) {
  const subtotal = budget.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const discountAmount = subtotal * ((Number(budget.discountRate) || 0) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  return {
    subtotal,
    discountAmount,
    taxAmount: 0,
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
  const formattedEmissionDate = formatDisplayDate(budget.date) || formatDisplayDate(new Date().toISOString().split('T')[0]);
  doc.text(`Fecha de emisión: ${formattedEmissionDate}`, 15, 35);
  if (budget.validUntil) {
    const formattedValidityDate = formatDisplayDate(budget.validUntil);
    doc.text(`Vigencia hasta: ${formattedValidityDate}`, 15, 40);
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
  doc.roundedRect(totalsStartX, curY, totalsWidth, budget.discountRate > 0 ? 28 : 20, 2, 2, 'FD');

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

export function createTechnicalReportPDF(budget: Budget, profile: CompanyProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const tech = budget.technicalReport || createDefaultTechnicalReport(budget, profile);

  const primaryColor: [number, number, number] = [0, 0, 0];
  const lineColor: [number, number, number] = [60, 60, 60];
  const textDark: [number, number, number] = [20, 20, 20];

  // Helper for drawing checkbox
  const drawCheckbox = (x: number, y: number, isChecked: boolean, label: string, boldLabel = false) => {
    // Draw box
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.35);
    doc.rect(x, y - 3.2, 3.6, 3.6);

    if (isChecked) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text('X', x + 0.8, y - 0.5);
    }

    // Label
    doc.setFont('helvetica', boldLabel ? 'bold' : 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...textDark);
    doc.text(label, x + 5.5, y);
  };

  // Helper to draw a dotted/solid fill line with label and value
  const drawFieldLine = (
    label: string,
    value: string,
    labelX: number,
    labelY: number,
    lineStartX: number,
    lineEndX: number,
    fontSize = 9.5
  ) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...textDark);
    doc.text(label, labelX, labelY);

    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.3);
    doc.line(lineStartX, labelY + 0.8, lineEndX, labelY + 0.8);

    if (value?.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);
      const maxLen = lineEndX - lineStartX - 2;
      const truncated = doc.splitTextToSize(value.trim(), maxLen)[0] || '';
      doc.text(truncated, lineStartX + 1.5, labelY - 0.2);
    }
  };

  // Helper to draw multi-line text on ruled lines
  const drawRuledLines = (
    text: string,
    startY: number,
    lineCount: number,
    lineSpacing = 8,
    startX = 20,
    endX = 190
  ) => {
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.3);

    const split = text ? doc.splitTextToSize(text.trim(), endX - startX - 2) : [];

    for (let i = 0; i < lineCount; i++) {
      const y = startY + i * lineSpacing;
      doc.line(startX, y, endX, y);
      if (split[i]) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        doc.text(split[i], startX + 1.5, y - 1);
      }
    }
  };

  // ==========================================
  // PAGE 1
  // ==========================================

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  const titleText = 'INFORME DE REVISIÓN TÉCNICA PREVENTIVA / ESTADO DE INSTALACIÓN';
  doc.text(titleText, 105, 26, { align: 'center' });

  // Underline for title
  const titleWidth = doc.getTextWidth(titleText);
  doc.setLineWidth(0.4);
  doc.line(105 - titleWidth / 2, 27.5, 105 + titleWidth / 2, 27.5);

  // 1. INFORMACIÓN GENERAL
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. INFORMACIÓN GENERAL', 20, 42);

  // Top horizontal separator line
  doc.setLineWidth(0.45);
  doc.line(20, 48, 190, 48);

  // N° de Informe and Fecha de Inspección
  drawFieldLine('N° de Informe:', tech.reportNumber || budget.number || '', 20, 56, 46, 88);
  drawFieldLine('Fecha de Inspección:', formatDisplayDate(tech.inspectionDate || budget.date), 98, 56, 137, 190);

  // Nombre del Técnico/Inspector
  drawFieldLine(
    'Nombre del Técnico/Inspector:',
    tech.technicianName || profile.name || '',
    20,
    66,
    73,
    190
  );

  // Registro/Matrícula
  drawFieldLine(
    'Registro/Matrícula:',
    tech.technicianLicense || profile.taxId || '',
    20,
    76,
    55,
    115
  );

  // Propietario/Cliente
  drawFieldLine(
    'Propietario/Cliente:',
    tech.clientName || budget.client.name || '',
    20,
    86,
    55,
    190
  );

  // Teléfono
  drawFieldLine('Teléfono:', tech.clientPhone || budget.client.phone || '', 20, 96, 38, 105);

  // Dirección del Inmueble
  drawFieldLine(
    'Dirección del Inmueble:',
    tech.propertyAddress || budget.client.address || '',
    20,
    106,
    63,
    190
  );

  // Tipo de Inmueble
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Tipo de Inmueble:', 20, 118);

  drawCheckbox(20, 126, !!tech.propertyType?.residential, 'Residencial');
  drawCheckbox(20, 134, !!tech.propertyType?.commercial, 'Comercial');
  drawCheckbox(20, 142, !!tech.propertyType?.industrial, 'Industrial');

  const otherLabel = tech.propertyType?.other && tech.propertyType.otherText
    ? `Otro: ${tech.propertyType.otherText}`
    : 'Otro';
  drawCheckbox(20, 150, !!tech.propertyType?.other, otherLabel);

  // 2. RESUMEN DEL ESTADO GENERAL DE LA INSTALACIÓN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. RESUMEN DEL ESTADO GENERAL DE LA INSTALACIÓN', 20, 168);

  // 2 Ruled lines for general summary
  drawRuledLines(tech.generalSummary || '', 178, 2, 9, 20, 190);

  // General Condition Checkboxes
  const condY1 = 200;
  drawCheckbox(
    20,
    condY1,
    !!tech.conditionConforme,
    'Conforme (Instalación segura y operativa, sin novedades críticas)'
  );

  const condY2 = 210;
  drawCheckbox(
    20,
    condY2,
    !!tech.conditionConformeObservaciones,
    'Conforme con Observaciones (Operativa, pero requiere mejoras o mantenimiento menor)'
  );

  const condY3 = 222;
  drawCheckbox(
    20,
    condY3,
    !!tech.conditionNoConforme,
    'No Conforme (Riesgo potencial o fallas graves. Requiere intervención inmediata)'
  );

  // Page 1 number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('1', 190, 278, { align: 'right' });

  // ==========================================
  // PAGE 2
  // ==========================================
  doc.addPage();

  // 3. LISTA DE VERIFICACIÓN (CHECKLIST)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. LISTA DE VERIFICACIÓN (CHECKLIST):', 20, 26);

  // A. Conexión de Entrada y Medidores:
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('A. Conexión de Entrada y Medidores:', 20, 35);

  drawCheckbox(20, 43, !!tech.checkMedidorFisico, '- Estado físico del medidor/regulador');
  drawCheckbox(20, 50, !!tech.checkAusenciaFugas, '- Ausencia de fugas o corrosión visible');
  drawCheckbox(20, 57, !!tech.checkAccesibilidadLlaves, '- Accesibilidad y llaves de paso principales');

  // Observation line for section A
  drawRuledLines(tech.notesMedidores ? `Observación: ${tech.notesMedidores}` : '', 66, 1, 8, 20, 190);

  // B. Tuberías:
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('B. Tuberías:', 20, 78);

  drawCheckbox(20, 86, !!tech.checkHermeticidad, '- Hermeticidad');
  drawCheckbox(20, 93, !!tech.checkSoportesFijaciones, '- Estado de los soportes y fijaciones');
  drawCheckbox(20, 100, !!tech.checkVentilacionesRejillas, '- Ventilaciones y rejillas de seguridad');
  drawCheckbox(20, 107, !!tech.checkConexionArtefactos, '- Conexión de artefactos / equipos:');
  drawCheckbox(20, 114, !!tech.checkEstadoGriferias, '- Estado de griferías');

  // Observation line for section B
  drawRuledLines(tech.notesTuberias ? `Observación: ${tech.notesTuberias}` : '', 124, 1, 8, 20, 190);

  // 4. DETALLE DE HALLAZGOS Y ACCIONES RECOMENDADAS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. DETALLE DE HALLAZGOS Y ACCIONES RECOMENDADAS', 20, 140);

  drawRuledLines(tech.findingsAndActions || '', 150, 2, 9, 20, 190);

  // 5. CONCLUSIONES Y RECOMENDACIONES FINALES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('5. CONCLUSIONES Y RECOMENDACIONES FINALES', 20, 178);

  drawRuledLines(tech.conclusionsAndRecommendations || '', 188, 2, 9, 20, 190);

  // Firma
  const sigLineY = 246;
  doc.setDrawColor(...lineColor);
  doc.setLineWidth(0.4);
  doc.line(75, sigLineY, 135, sigLineY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  doc.text('Firma', 105, sigLineY + 5, { align: 'center' });

  if (tech.technicianSignatureName || tech.technicianName || profile.name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      tech.technicianSignatureName || tech.technicianName || profile.name || '',
      105,
      sigLineY + 10,
      { align: 'center' }
    );
  }

  // Page 2 number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('2', 190, 278, { align: 'right' });

  return doc;
}

export function downloadTechnicalReportPDF(budget: Budget, profile: CompanyProfile) {
  const doc = createTechnicalReportPDF(budget, profile);
  const cleanNumber = (budget.number || '001').replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanClient = (budget.client.name || 'cliente').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`Informe_Tecnico_${cleanNumber}_${cleanClient}.pdf`);
}

export function getTechnicalReportPDFBlob(budget: Budget, profile: CompanyProfile): Blob {
  const doc = createTechnicalReportPDF(budget, profile);
  return doc.output('blob');
}
