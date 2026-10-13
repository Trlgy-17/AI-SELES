# Keputusan Database

**Keputusan: MySQL 8 (lokal 8.4.3 via Laragon, produksi MySQL Hostinger).**

## Perbandingan

| Kriteria | PostgreSQL 16 | MySQL 8.x | Firebase (Firestore) |
|---|---|---|---|
| Data relasional CRM (klien–lead–task–estimasi) | Sangat baik | Sangat baik | Lemah (tanpa join/relasi) |
| Transaksi | ACID penuh | ACID (InnoDB) | Terbatas (batch/transaction per dokumen) |
| JSON | JSONB + index GIN | JSON + generated column index | Native dokumen |
| Indexing | B-tree, GIN, partial, expression | B-tree, FULLTEXT, functional index | Otomatis + composite manual |
| Full-text search | tsvector, bahasa, ranking | FULLTEXT InnoDB (natural/boolean) | Tidak ada (butuh layanan luar) |
| Reporting/agregasi | Sangat baik (window, CTE) | Baik (window, CTE sejak 8.0) | Lemah |
| Migrations | Matang | Matang | Tidak ada skema |
| Audit log | Mudah | Mudah | Mungkin, mahal di query |
| Memori AI terstruktur | Baik | Baik | Cukup |
| Vector embedding | pgvector | Tidak tersedia di MySQL Community 8.4 | Vector search (preview) |
| Kompleksitas operasional | Butuh VPS/managed | **Sudah ada di Hostinger & Laragon** | Managed, lock-in |
| Hosting target (Hostinger web/Node) | Tidak tersedia | **Tersedia** | Eksternal |
| Backup | pg_dump / PITR | mysqldump / backup harian Hostinger | Export terjadwal |
| Scaling (skala ratusan ribu lead) | Lebih dari cukup | Lebih dari cukup | Cukup |
| Biaya | VPS tambahan | Termasuk paket hosting | Per operasi baca/tulis |

## Alasan memilih MySQL
1. Batasan hosting produksi: Hostinger web hosting menyediakan MySQL pada server yang sama dengan aplikasi Node; PostgreSQL tidak tersedia tanpa VPS.
2. Laragon lokal sudah menjalankan MySQL 8.4.3, sehingga dev dan produksi identik.
3. Kebutuhan sesi ini (relasional, transaksi, audit, full-text sederhana) terpenuhi MySQL 8.
4. API e-report (sumber lead) juga MySQL — keterampilan & tooling tim sama.

## Konsekuensi & mitigasi
- **Tanpa pgvector**: pencarian semantik ditunda. Tahap awal retrieval memakai `FULLTEXT` pada `knowledge_documents(title, content)`. Jika nanti embedding terbukti perlu, opsi: tabel embedding + pencarian cosine di aplikasi untuk korpus kecil, atau pindah ke PostgreSQL managed.
- **JSON dipakai hemat**: hanya untuk `audit_logs.before/after`, `brands.configuration`, laporan migrasi. Fakta memori tetap kolom relasional.
- **ORM Drizzle** dipakai agar pindah ke PostgreSQL di masa depan cukup mengganti dialek schema.
- Charset `utf8mb4` / collation `utf8mb4_unicode_ci`; semua timestamp `DATETIME(3)` dalam UTC.
- Uang: `BIGINT` rupiah (tanpa desimal).
- Firebase tidak lagi menjadi database; hanya sumber impor data lama.
