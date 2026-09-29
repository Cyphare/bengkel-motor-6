import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { IBooking } from '../models/booking.model';

const rupiah = (amount: number): string => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

export function writeInvoice(booking: IBooking, res: Response): void {
  const pdf = new PDFDocument({ size: 'A4', margin: 50 });
  pdf.on('error', (error) => {
    console.error(`[PDF] Faktur ${booking.bookingNumber} gagal:`, error);
    res.destroy(error);
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${booking.bookingNumber}.pdf"`);
  pdf.pipe(res);

  pdf.fontSize(22).text('MotorCenter', { align: 'center' }).moveDown(0.4);
  pdf.fontSize(15).text('FAKTUR SERVIS', { align: 'center' }).moveDown();
  pdf.fontSize(10)
    .text(`Nomor faktur: ${booking.bookingNumber}`)
    .text(`Tanggal pengambilan: ${new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' }).format(booking.pickedUpAt!)}`)
    .text(`Pelanggan: ${booking.customerName}`)
    .text(`Telepon: ${booking.customerPhone}`)
    .text(`Kendaraan: ${booking.motorModel} (${booking.plateNumber})`)
    .moveDown();
  pdf.fontSize(12).text('Rincian biaya').moveDown(0.4);
  pdf.fontSize(10).text(`Jasa servis${booking.serviceName ? ` - ${booking.serviceName}` : ''}: ${rupiah(booking.serviceFee)}`);
  if (booking.partsUsed.length) {
    pdf.moveDown(0.4).text('Suku cadang:');
    for (const part of booking.partsUsed) {
      pdf.text(`${part.name} (${part.code}) - ${part.quantity} x ${rupiah(part.price)} = ${rupiah(part.subtotal)}`);
    }
  }
  pdf.moveDown().text(`Total suku cadang: ${rupiah(booking.partsTotalCost)}`);
  pdf.fontSize(14).moveDown(0.5).text(`TOTAL: ${rupiah(booking.serviceFee + booking.partsTotalCost)}`, { align: 'right' });
  pdf.end();
}
