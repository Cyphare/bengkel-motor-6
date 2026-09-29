import mongoose from 'mongoose';
import { env } from './env';

export interface DatabaseStatus {
  status: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';
  code: number;
  databaseName?: string;
  host?: string;
}

/**
 * Mengambil status koneksi Mongoose saat ini
 */
export const getDatabaseStatus = (): DatabaseStatus => {
  const readyState = mongoose.connection.readyState;
  const statusMap: Record<number, DatabaseStatus['status']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: statusMap[readyState] || 'unknown',
    code: readyState,
    databaseName: mongoose.connection.name,
    host: mongoose.connection.host,
  };
};

/**
 * Menghubungkan Mongoose ke MongoDB
 */
export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  try {
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Berhasil terhubung ke database: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Kesalahan koneksi:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[MongoDB] Koneksi terputus.`);
    });

    console.log(`[MongoDB] Menghubungkan ke MongoDB...`);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    return conn;
  } catch (error: any) {
    console.error(`[MongoDB] Gagal menghubungkan ke MongoDB:`, error.message);
    console.warn(`[MongoDB] Server tetap berjalan. Health check akan melaporkan status disconnected hingga koneksi pulih.`);
    return null;
  }
};

/**
 * Menutup koneksi Mongoose dengan aman saat graceful shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log(`[MongoDB] Koneksi database berhasil ditutup secara aman.`);
    }
  } catch (error: any) {
    console.error(`[MongoDB] Galat saat menutup koneksi:`, error.message);
  }
};
