# Panduan pengujian Postman dan screenshot untuk laporan MotorCenter

Panduan ini menghasilkan **bukti dari request dan respons nyata**, bukan contoh respons yang diketik ulang. Ikuti urutan karena ID tiket, layanan, dan part dipakai lagi pada langkah berikutnya. Semua URL memakai `http://localhost:8000/api`; rincian kontrak ada di [API_DOCUMENTATION.md](../API_DOCUMENTATION.md). Tidak perlu mengimpor folder atau berkas koleksi Postman.

## 1. Siapkan backend dan data awal

1. Isi `backend/.env` dengan koneksi Atlas yang memang dipakai proyek. Jika ingin bukti pratinjau Ethereal, kosongkan keempat variabel `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, dan `SMTP_FROM`. Jangan menaruh URI, JWT secret, atau kredensial SMTP dalam laporan.
2. Dari `backend/`, jalankan `npm run build`, lalu `npm run dev`. Biarkan terminal server terbuka agar log email dapat diperiksa.
3. Di Postman, kirim **GET** `http://localhost:8000/api/health` tanpa Authorization. Lanjutkan hanya jika status HTTP `200`, `data.database.status` = `connected`, dan `data.database.databaseName` = `motorcenter_phase3`. Jika `disconnected`, periksa koneksi/IP Atlas lebih dulu.
4. Sediakan akun **admin, kasir, pemilik, dan satu mekanik aktif yang kredensialnya diketahui**. Akun contoh pada [README](../README.md) hanya berlaku jika database tersebut pernah di-seed. Coba login dahulu; jika tidak tersedia, gunakan akun proyek yang sudah ada atau minta admin proyek menyiapkannya. **Jangan jalankan seeder pada `motorcenter_phase3` yang sudah berisi data**, dan jangan hapus data lama demi screenshot.

Seluruh langkah berikut menulis data demo ke Atlas. Pilih `runId` yang unik, misalnya `RPT2909A` (huruf/angka saja), agar data laporan mudah dibedakan. Tiket tidak memiliki endpoint hapus; catat nomor tiket dan gunakan hanya data demo yang memang boleh tersimpan.

## 2. Siapkan Postman sekali saja

1. Buka **Environments**, buat environment `MotorCenter Laporan`, lalu pilih environment itu sebagai yang aktif.
2. Buat variabel berikut. Isi `runId` dengan nilai unik milik sesi Anda; yang lain biarkan kosong dahulu.

   | Variabel | Nilai awal | Kegunaan |
   | --- | --- | --- |
   | `baseUrl` | `http://localhost:8000/api` | Awalan semua URL |
   | `runId` | `RPT2909A` | Penanda data demo unik |
   | `adminToken`, `kasirToken`, `mekanikToken`, `pemilikToken`, `pelangganToken` | kosong | JWT masing-masing peran |
   | `serviceId`, `partId`, `mechanicId`, `bookingId`, `bookingNumber`, `todayWib` | kosong | ID, nomor tiket, dan tanggal dari respons |

3. Setiap request JSON: pilih **Body → raw → JSON**, tempel body yang ditunjukkan, lalu klik **Send**. Pada request terproteksi, pilih **Authorization → Bearer Token** dan isi **Token** dengan variabel peran yang disebutkan, misalnya `{{adminToken}}`. Postman menambahkan awalan `Bearer` sendiri; jangan mengetiknya lagi. Request publik memakai **No Auth**. [Rujukan resmi Postman untuk Bearer Token](https://learning.postman.com/docs/sending-requests/authorization/authorization/).
4. Untuk login, buat **POST** `{{baseUrl}}/auth/login` dengan body berikut. Ganti email dan password sesuai akun yang tersedia; jalankan terpisah untuk admin, kasir, mekanik terpilih, dan pemilik.

   ```json
   {"email":"admin@motorcenter.id","password":"admin123"}
   ```

   Pada tab **Scripts → Post-response** request login, tempel skrip berikut. Jika login `200`, token tersimpan sesuai `data.user.role`. Pastikan environment `MotorCenter Laporan` aktif saat mengirim.

   ```javascript
   if (pm.response.code === 200) {
     const { user, accessToken } = pm.response.json().data;
     pm.environment.set(`${user.role}Token`, accessToken);
   }
   ```

   Jika nama tab pada versi Postman berbeda, cari bagian skrip yang berjalan **setelah respons**. Variabel environment dapat diisi lewat `pm.environment.set()`. [Rujukan resmi Postman](https://learning.postman.com/docs/use/send-requests/variables/environment-variables/).
5. Untuk setiap respons pembuatan data di bawah, salin `data._id` ke variabel yang disebutkan melalui **Environments**. Alternatifnya, pasang skrip Post-response ini pada request terkait dengan mengganti `NAMA_VARIABEL`:

   ```javascript
   if (pm.response.code === 201) {
     pm.environment.set('NAMA_VARIABEL', pm.response.json().data._id);
   }
   ```

**Aturan screenshot:** tampilkan method + URL, body request bila ada, status HTTP, dan field respons yang membuktikan klaim. Gunakan tampilan **Pretty/JSON** dan perbesar panel respons bila perlu. Tutupi `accessToken`, password, URI Atlas, serta data pribadi nyata. Jangan memotong status HTTP atau mengganti isi respons secara manual. Beri nama file sesuai tabel pada bagian 4 dan pakai caption yang menyebut hasil yang benar-benar terlihat.

## 3. Jalankan skenario utama berurutan

### A. Koneksi, autentikasi, dan otorisasi

1. **Health:** ulangi **GET** `{{baseUrl}}/health` dengan **No Auth**. Simpan screenshot `01-health.png`: `200`, status database `connected`, dan nama database `motorcenter_phase3`. Build terminal boleh menjadi lampiran terpisah; screenshot utama bagian ini tetap dari Postman.
2. **Login admin:** jalankan login admin dari bagian 2. Respons `200` harus memuat `data.user.role: "admin"` dan `data.accessToken`; simpan `02-login-admin.png` dengan token ditutupi.
3. **Tanpa token:** kirim **GET** `{{baseUrl}}/reports/dashboard` dengan **No Auth**. Harapkan `401` dan `success: false`; simpan `03-tanpa-token-401.png`.
4. **Pelanggan tidak boleh melihat laporan:** buat pelanggan demo melalui **POST** `{{baseUrl}}/auth/register`, **No Auth**:

   ```json
   {"name":"Pelanggan Laporan","email":"laporan.{{runId}}@example.test","password":"demo123456","phone":"081234567890"}
   ```

   Harapkan `201` dan `data.user.role: "pelanggan"`. Salin `data.accessToken` ke `pelangganToken` (respons register juga memberi JWT). Simpan `04-register-pelanggan.png` dengan token ditutupi. Jika email sudah dipakai, ganti `runId` dan ulangi; jangan memakai record lama secara diam-diam.
5. Kirim **GET** `{{baseUrl}}/reports/dashboard` dengan Bearer `{{pelangganToken}}`. Harapkan `403` dan `success: false`; simpan `05-rbac-laporan-403.png`.

### B. Katalog dan booking online

6. Dengan Bearer `{{adminToken}}`, buat layanan melalui **POST** `{{baseUrl}}/services`:

   ```json
   {"name":"Servis Laporan {{runId}}","description":"Layanan demo untuk bukti laporan","estimatedPrice":50000,"estimatedDurationMinutes":45}
   ```

   Harapkan `201`; simpan `data._id` sebagai `serviceId`. Screenshot `06-layanan-dibuat.png` harus memperlihatkan `estimatedPrice: 50000`. Cek **GET** `{{baseUrl}}/services` tanpa token bila perlu membuktikan layanan muncul di katalog.
7. Dengan Bearer `{{adminToken}}`, buat part melalui **POST** `{{baseUrl}}/parts`:

   ```json
   {"code":"PART-{{runId}}","name":"Part Laporan {{runId}}","stock":2,"minStock":1,"price":35000,"unit":"pcs"}
   ```

   Harapkan `201`; simpan `data._id` sebagai `partId`. Screenshot `07-part-dibuat.png` memperlihatkan `stock: 2`, `minStock: 1`, `price: 35000`, dan `isLowStock: false`. Kode part harus unik. Jangan memakai part lama karena stok/omzet akan sulit direkonsiliasi.
8. Dengan Bearer `{{pelangganToken}}`, buat tiket melalui **POST** `{{baseUrl}}/bookings/online`:

   ```json
   {"plateNumber":"B 1234 RPT","motorModel":"Honda Beat Demo","complaint":"Rem depan berdecit","serviceId":"{{serviceId}}"}
   ```

   Harapkan `201`; simpan `data._id` sebagai `bookingId` dan `data.bookingNumber` sebagai `bookingNumber`. Screenshot `08-booking-online.png` menunjukkan `bookingType: "online"`, `status: "Antre"`, `serviceFee: 50000`, `partsTotalCost: 0`, dan `bookingNumber`. Nomor tiket memakai tanggal WIB. Backend mencoba mengirim email konfirmasi **setelah** tiket tersimpan; bukti email di bagian 5.
9. Dengan Bearer `{{pelangganToken}}`, kirim **GET** `{{baseUrl}}/bookings/{{bookingId}}`. Harapkan `200`; ini bukti pelanggan hanya membaca tiket online miliknya. Ambil `09-detail-tiket.png` bila laporan membutuhkan bukti baca/detail. Untuk daftar tiket, **GET** `{{baseUrl}}/bookings` menampilkan `data` array dan `pagination`.

### C. Penugasan, status, stok, dan biaya

10. Dengan Bearer `{{adminToken}}` atau `{{kasirToken}}`, kirim **GET** `{{baseUrl}}/users/mechanics`. Pilih mekanik **aktif yang bisa Anda login** dan salin `_id` ke `mechanicId`. Login mekanik tersebut untuk mengisi `mekanikToken`; token mekanik lain tidak dapat mengubah tiket ini.
11. Dengan Bearer `{{kasirToken}}`, kirim **PUT** `{{baseUrl}}/bookings/{{bookingId}}/assign`:

    ```json
    {"mechanicId":"{{mechanicId}}"}
    ```

    Harapkan `200` dan `data.mechanicId` terisi. Simpan `10-mekanik-ditugaskan.png`.
12. Dengan Bearer `{{mekanikToken}}`, kirim **PUT** `{{baseUrl}}/bookings/{{bookingId}}/status` dua kali, **berurutan**, dengan body `{"status":"Diperiksa"}` lalu `{"status":"Dikerjakan"}`. Keduanya harus `200`; simpan `11-status-diperiksa.png` dan `12-status-dikerjakan.png`. Melompat langsung ke `Selesai` dari `Antre` menghasilkan `400`.
13. Saat tiket `Dikerjakan`, dengan Bearer `{{mekanikToken}}` kirim **POST** `{{baseUrl}}/bookings/{{bookingId}}/parts`:

    ```json
    {"partId":"{{partId}}","quantity":1}
    ```

    Harapkan `200`. Screenshot `13-part-pada-tiket.png` harus menunjukkan `partsUsed[0].price: 35000`, `partsTotalCost: 35000`, dan `grandTotal: 85000`.
14. Dengan Bearer `{{adminToken}}`, kirim **GET** `{{baseUrl}}/parts/{{partId}}`, lalu **GET** `{{baseUrl}}/parts/low-stock`. Stok kini **1**, tepat sama dengan `minStock: 1`; `isLowStock: true`, dan part muncul di daftar stok rendah. Simpan `14-stok-tepat-ambang.png` dan `15-daftar-stok-rendah.png`. Gunakan dua screenshot jika satu layar tidak memuat kedua respons.
15. Dengan Bearer `{{mekanikToken}}`, kirim **PUT** `{{baseUrl}}/bookings/{{bookingId}}/status` dengan body `{"status":"Selesai"}`. Harapkan `200`, `completedAt` terisi, `pickedUpAt` belum ada, dan `grandTotal: 85000`. Simpan `16-servis-selesai.png`. Email selesai hanya dicoba untuk tiket **online**.

### D. Bukti laporan sebelum dan sesudah pengambilan

16. Dengan Bearer `{{pemilikToken}}`, kirim **GET** `{{baseUrl}}/reports/dashboard`. Respons `data.date` adalah tanggal WIB; salin ke variabel `todayWib` (format `YYYY-MM-DD`). Catat `data.revenueToday` dan `data.revenueMonth` sebagai **nilai sebelum**. Screenshot `17-dashboard-sebelum-diambil.png` memperlihatkan tanggal, kedua omzet, `completedToday`, dan part demo di `lowStockParts`. Tiket yang baru `Selesai` **belum** menambah omzet.
17. Masih sebagai pemilik, kirim **GET** `{{baseUrl}}/reports/revenue?startDate={{todayWib}}&endDate={{todayWib}}`. Catat `serviceTotal`, `partsTotal`, dan `revenue` sebagai **nilai sebelum**. Simpan `18-revenue-sebelum-diambil.png`. Angka sebelum bisa lebih dari nol jika database memiliki transaksi lain hari ini.
18. Dengan Bearer `{{pemilikToken}}`, kirim **GET** `{{baseUrl}}/bookings/{{bookingId}}/invoice/pdf`. Harapkan `400` karena tiket belum `Diambil`; simpan `19-faktur-sebelum-diambil-400.png`.
19. Dengan Bearer `{{mekanikToken}}`, coba **PUT** `{{baseUrl}}/bookings/{{bookingId}}/status` berisi `{"status":"Diambil"}`. Harapkan `403`; simpan `20-mekanik-tidak-boleh-diambil.png`. Status tiket tetap `Selesai`.
20. Dengan Bearer `{{kasirToken}}` atau `{{adminToken}}`, kirim request status yang sama. Harapkan `200`, `status: "Diambil"`, dan `pickedUpAt` terisi. Simpan `21-tiket-diambil.png`. Dalam model saat ini, `Diambil` mewakili pembayaran dan serah motor.
21. Sebagai pemilik, ulangi **GET** dashboard dan revenue satu hari yang sama. Simpan `22-dashboard-sesudah-diambil.png` dan `23-revenue-sesudah-diambil.png`. Bila tidak ada transaksi lain di sela dua pengambilan data, selisih yang harus tampak adalah:

    | Field | Sesudah dikurangi sebelum |
    | --- | ---: |
    | `revenueToday` dan `revenueMonth` | Rp85.000 |
    | `serviceTotal` pada revenue | Rp50.000 |
    | `partsTotal` pada revenue | Rp35.000 |
    | `revenue` pada revenue | Rp85.000 |
    | `days` untuk `todayWib` | bertambah satu tiket |

    Angka total **tidak harus** tepat Rp85.000 karena Atlas dapat berisi transaksi lain. Yang dibuktikan adalah selisih dari tiket demo ini. Ambil pasangan sebelum/sesudah pada hari WIB yang sama dan tanpa transaksi lain di antaranya; bila melewati tengah malam WIB, ulangi skenario pada hari baru. Untuk tanggal tanpa transaksi, coba **GET** `{{baseUrl}}/reports/revenue?startDate=2099-01-01&endDate=2099-01-01`: total `0`, `days: []`. Untuk validasi, kirim hanya `startDate={{todayWib}}`: harapkan `400`. Dua bukti ini opsional sebagai `24-revenue-kosong.png` dan `25-rentang-tidak-lengkap-400.png`.

### E. Faktur PDF

22. Dengan Bearer `{{pemilikToken}}` atau `{{pelangganToken}}` pemilik tiket, kirim **GET** `{{baseUrl}}/bookings/{{bookingId}}/invoice/pdf`. Harapkan `200`. Buka tab **Headers** pada respons dan tampilkan `Content-Type: application/pdf`; simpan `26-faktur-response-postman.png`. Jika Postman menampilkan data biner, itu normal.
23. Pada dropdown di samping **Send**, pilih **Send and Download**, simpan hasil sebagai `{{bookingNumber}}.pdf`, lalu buka PDF tersebut. Screenshot `27-faktur-pdf.png` harus memperlihatkan **MotorCenter**, nomor faktur = `bookingNumber`, tanggal pengambilan, pelanggan, kendaraan, jasa Rp50.000, part 1 × Rp35.000, dan total Rp85.000. Berkas PDF dibuat saat request, bukan disimpan di Atlas. [Rujukan resmi Postman tentang Send and Download](https://learning.postman.com/help/faqs/sending-requests/im-experiencing-a-long-response-time/).
24. Jika perlu bukti penolakan akses, ulangi endpoint PDF dengan Bearer `{{mekanikToken}}`: `403`. Pelanggan lain juga `403`, tetapi pelanggan pemilik tiket online boleh mengunduh.

## 4. Pilih screenshot untuk laporan

Urutan bernomor di atas menghasilkan paket bukti lengkap. Untuk laporan yang membatasi jumlah gambar, pilih gambar yang langsung mendukung klaim berikut, tanpa menghilangkan pasangan **sebelum/sesudah** saat menjelaskan omzet.

| Klaim laporan | Screenshot utama | Hal yang ditunjukkan dalam caption |
| --- | --- | --- |
| Backend terhubung ke Atlas | `01-health.png` | HTTP 200, `connected`, `motorcenter_phase3` |
| JWT dan pembatasan peran | `02-login-admin.png`, `03-tanpa-token-401.png`, `05-rbac-laporan-403.png` | Login berhasil, 401 tanpa token, 403 untuk pelanggan |
| Katalog dan booking | `06-layanan-dibuat.png`, `07-part-dibuat.png`, `08-booking-online.png` | ID, harga awal, status `Antre` |
| Alur servis dan stok | `10-mekanik-ditugaskan.png`, `12-status-dikerjakan.png`, `13-part-pada-tiket.png`, `14-stok-tepat-ambang.png`, `16-servis-selesai.png` | Penugasan, perubahan status, pengurangan stok, subtotal |
| Omzet hanya sesudah `Diambil` | `17-dashboard-sebelum-diambil.png`, `18-revenue-sebelum-diambil.png`, `21-tiket-diambil.png`, `22-dashboard-sesudah-diambil.png`, `23-revenue-sesudah-diambil.png` | Selisih jasa Rp50.000 + part Rp35.000 = Rp85.000 |
| Faktur | `19-faktur-sebelum-diambil-400.png`, `26-faktur-response-postman.png`, `27-faktur-pdf.png` | PDF ditolak sebelum pengambilan, lalu berhasil diunduh |

Jika gambar memuat banyak data, sertakan hanya potongan respons yang relevan **tanpa mengubah nilainya**. Tuliskan tanggal pengambilan screenshot dan `bookingNumber` pada caption agar lima gambar laporan merujuk tiket yang sama. [Dokumentasi Postman tentang status, body, dan headers respons](https://learning.postman.com/docs/use/send-requests/response-data/responses/).

## 5. Bukti tambahan bila dibutuhkan rubrik

- **Email:** setelah langkah 8 dan 15, lihat terminal backend. Dengan seluruh konfigurasi SMTP kosong, backend memakai Ethereal dan mencatat URL pratinjau untuk dua email tiket online: konfirmasi booking dan pemberitahuan `Selesai` berisi estimasi biaya. Screenshot terminal + halaman pratinjau sebagai `28-email-konfirmasi.png` dan `29-email-selesai.png`. Ethereal hanya untuk pratinjau; pesan tidak terkirim ke alamat pelanggan sebenarnya. Jika layanan Ethereal tidak dapat dijangkau, catat kegagalannya secara jujur dan tampilkan respons booking/status yang tetap sukses; jangan menyebutnya bukti email terkirim.
- **Walk-in:** buat tiket tambahan lewat **POST** `{{baseUrl}}/bookings/walk-in` dengan Bearer `{{kasirToken}}` dan body `{"customerName":"Walk-in {{runId}}","customerPhone":"081234567890","plateNumber":"B 5678 RPT","motorModel":"Yamaha Mio Demo","complaint":"Lampu mati","serviceFee":45000}`. Respons `201`, `bookingType: "walk-in"`; tidak ada email. Simpan `data._id` sebagai `otherBookingId`, terpisah dari `bookingId` utama. **GET** `{{baseUrl}}/bookings/{{otherBookingId}}` dengan Bearer `{{pelangganToken}}` harus `403`.
- **Pembatalan part:** pada tiket walk-in tadi, kirim **PUT** `{{baseUrl}}/bookings/{{otherBookingId}}/assign` dengan body `{"mechanicId":"{{mechanicId}}"}` dan Bearer kasir, lalu **PUT** `{{baseUrl}}/bookings/{{otherBookingId}}/status` dengan body `{"status":"Diperiksa"}`. Catat stok `GET /parts/{{partId}}`, tambahkan satu part lewat **POST** `{{baseUrl}}/bookings/{{otherBookingId}}/parts` dengan body `{"partId":"{{partId}}","quantity":1}` dan simpan `data.partsUsed[0]._id` sebagai `partItemId`. Kirim **DELETE** `{{baseUrl}}/bookings/{{otherBookingId}}/parts/{{partItemId}}` dengan Bearer kasir. Bandingkan stok sebelum penambahan, setelah penambahan, dan setelah pembatalan; respons `200` mengembalikan stok. Jangan memakai tiket utama setelah `Selesai`/`Diambil`.
- **CRUD katalog:** setelah semua screenshot utama dan pembatalan part selesai, ubah harga layanan atau part demo dengan **PUT** `{{baseUrl}}/services/{{serviceId}}` atau **PUT** `{{baseUrl}}/parts/{{partId}}` sebagai admin/kasir, misalnya body `{"estimatedPrice":60000}` atau `{"price":40000}`; respons `200`. Detail tiket utama tetap memuat snapshot biaya awal. **DELETE** pada kedua endpoint menonaktifkan record (`isActive: false`), bukan menghapus tiket atau riwayat. Ambil screenshot request dan respons bila bagian CRUD diperlukan; data demo tiket tetap tersimpan.

**Catatan penyajian:** jangan mengklaim semua screenshot sebagai hasil pengujian otomatis. Uji otomatis tersedia di `backend/tests/`, sedangkan gambar dalam panduan ini adalah bukti manual Postman. Data laporan `revenue` memakai `pickedUpAt` menurut `Asia/Jakarta`; filter tanggal pada daftar booking memakai `serviceDate`, sehingga kedua endpoint tidak boleh disamakan.
