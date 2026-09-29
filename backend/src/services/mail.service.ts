import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { IBooking } from '../models/booking.model';

let testTransport: ReturnType<typeof nodemailer.createTransport> | undefined;
let testFrom: string | undefined;

export async function sendBookingEmail(to: string, booking: IBooking, event: 'created' | 'completed'): Promise<void> {
  const fields = [env.SMTP_HOST, env.SMTP_USER, env.SMTP_PASS, env.SMTP_FROM];
  const configured = fields.some((value) => !!value?.trim());
  if (configured && !fields.every((value) => !!value?.trim())) {
    throw new Error('Konfigurasi SMTP tidak lengkap: SMTP_HOST, SMTP_USER, SMTP_PASS, dan SMTP_FROM wajib diisi bersama');
  }

  let transport: ReturnType<typeof nodemailer.createTransport>;
  let from: string;
  if (configured) {
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER!, pass: env.SMTP_PASS! },
    });
    from = env.SMTP_FROM!;
  } else {
    if (!testTransport) {
      const account = await nodemailer.createTestAccount();
      testFrom = account.user;
      testTransport = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      });
    }
    transport = testTransport;
    from = testFrom!;
  }

  const created = event === 'created';
  const info = await transport.sendMail({
    from,
    to,
    subject: created ? `Konfirmasi booking ${booking.bookingNumber} - MotorCenter` : `Motor siap diambil: ${booking.bookingNumber} - MotorCenter`,
    text: created
      ? `Booking ${booking.bookingNumber} untuk ${booking.plateNumber} berhasil dibuat. Status: ${booking.status}.`
      : `Motor ${booking.plateNumber} siap diambil. Estimasi biaya jasa: Rp${booking.serviceFee}; suku cadang: Rp${booking.partsTotalCost}; total: Rp${booking.grandTotal}.`,
  });
  if (!configured) console.info(`[Email] Pratinjau ${booking.bookingNumber}: ${nodemailer.getTestMessageUrl(info)}`);
}
