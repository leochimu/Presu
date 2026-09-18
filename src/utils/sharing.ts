import { Budget, CompanyProfile } from '../types';
import { calculateBudgetTotals, formatMoney, getBudgetPDFBlob } from './pdfGenerator';

export function buildBudgetTextSummary(budget: Budget, profile: CompanyProfile): string {
  const totals = calculateBudgetTotals(budget);
  const currency = budget.currency || '$';
  const clientName = budget.client.name ? budget.client.name.trim() : 'Estimado/a cliente';
  const emitterName = profile.name ? profile.name.trim() : 'Presupuestos';

  let message = `📄 *PRESUPUESTO Nº ${budget.number || '001'}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Cliente:* ${clientName}\n`;
  message += `📅 *Fecha:* ${budget.date || new Date().toISOString().split('T')[0]}\n`;
  if (budget.validUntil) {
    message += `⏳ *Vigencia:* ${budget.validUntil}\n`;
  }
  message += `\n📋 *DETALLE DE ÍTEMS:*\n`;

  budget.items.forEach((item, idx) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineTotal = qty * price;
    message += `${idx + 1}. *${item.description || 'Ítem'}*\n`;
    message += `   ${qty} x ${formatMoney(price, currency)} = *${formatMoney(lineTotal, currency)}*\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Subtotal:* ${formatMoney(totals.subtotal, currency)}\n`;

  if (budget.discountRate > 0) {
    message += `🏷️ *Descuento (${budget.discountRate}%):* -${formatMoney(totals.discountAmount, currency)}\n`;
  }

  if (budget.taxRate > 0) {
    message += `🏛️ *IVA / Impuesto (${budget.taxRate}%):* ${formatMoney(totals.taxAmount, currency)}\n`;
  }

  message += `✨ *TOTAL A PAGAR: ${formatMoney(totals.total, currency)}*\n`;

  if (budget.notes?.trim()) {
    message += `\n📌 *Condiciones y Notas:*\n${budget.notes.trim()}\n`;
  }

  message += `\nEmitido por: *${emitterName}*`;
  if (profile.phone) message += ` • Tel: ${profile.phone}`;
  if (profile.email) message += ` • Email: ${profile.email}`;

  return message;
}

export function openWhatsApp(budget: Budget, profile: CompanyProfile, targetPhone?: string) {
  const message = buildBudgetTextSummary(budget, profile);
  const rawPhone = targetPhone ?? budget.client.phone ?? '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const encoded = encodeURIComponent(message);
  let url = '';

  if (cleanPhone) {
    url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encoded}`;
  }

  window.open(url, '_blank');
}

export function openEmail(budget: Budget, profile: CompanyProfile, targetEmail?: string) {
  const totals = calculateBudgetTotals(budget);
  const currency = budget.currency || '$';
  const rawEmail = targetEmail ?? budget.client.email ?? '';
  const subject = `Presupuesto Nº ${budget.number || '001'} - ${profile.name || 'Propuesta Comercial'}`;

  let body = `Estimado/a ${budget.client.name || 'Cliente'},\n\n`;
  body += `Adjunto la información detallada de su presupuesto Nº ${budget.number || '001'}.\n\n`;
  body += `RESUMEN DE ÍTEMS:\n`;

  budget.items.forEach((item, idx) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineTotal = qty * price;
    body += `${idx + 1}. ${item.description || 'Ítem'} (Cant: ${qty} x ${formatMoney(price, currency)}) = ${formatMoney(lineTotal, currency)}\n`;
  });

  body += `\nSubtotal: ${formatMoney(totals.subtotal, currency)}\n`;
  if (budget.discountRate > 0) {
    body += `Descuento (${budget.discountRate}%): -${formatMoney(totals.discountAmount, currency)}\n`;
  }
  if (budget.taxRate > 0) {
    body += `Impuesto (${budget.taxRate}%): ${formatMoney(totals.taxAmount, currency)}\n`;
  }
  body += `TOTAL: ${formatMoney(totals.total, currency)}\n\n`;

  if (budget.notes?.trim()) {
    body += `Condiciones y notas:\n${budget.notes.trim()}\n\n`;
  }

  body += `Quedo a su entera disposición ante cualquier duda o consulta.\n\n`;
  body += `Atentamente,\n${profile.name || 'El Emisor'}\n`;
  if (profile.phone) body += `Teléfono: ${profile.phone}\n`;
  if (profile.email) body += `Email: ${profile.email}\n`;

  const mailtoUrl = `mailto:${encodeURIComponent(rawEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

export async function sharePDFFile(
  budget: Budget,
  profile: CompanyProfile
): Promise<{ success: boolean; supported: boolean; error?: string }> {
  try {
    const blob = getBudgetPDFBlob(budget, profile);
    const fileName = `Presupuesto_${budget.number || '001'}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Presupuesto Nº ${budget.number || '001'}`,
        text: `Presupuesto para ${budget.client.name || 'Cliente'} emitido por ${profile.name || 'Presupuestos'}`,
      });
      return { success: true, supported: true };
    } else {
      return { success: false, supported: false };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // If the user cancelled the share dialog, don't treat as fatal
    if (errorMsg.toLowerCase().includes('abort') || errorMsg.toLowerCase().includes('cancel')) {
      return { success: false, supported: true, error: 'canceled' };
    }
    return { success: false, supported: true, error: errorMsg };
  }
}
