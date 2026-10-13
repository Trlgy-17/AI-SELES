# Arsitektur AI

## Saat ini (setelah fondasi)
```
AIWorkspace → AIService.generateWhatsAppReply
   ├─ KnowledgeRetriever (browser, knowledge localStorage)      ← fase 8: pindah ke /knowledge FULLTEXT server
   ├─ buildModularPrompt: system core · sales policy · human voice · persuasion playbook (etis) · brand · knowledge · memory · mode playbook · directive · skema JSON
   └─ POST /api/v1/ai/generate  (server)
         ├─ permission ai.use + rate limit 30/menit
         ├─ allowlist provider/model (system_settings)
         ├─ panggil Gemini / OpenAI-compatible (key dari env)
         ├─ validasi output (Zod: reply wajib, analisis opsional)
         └─ ai_generations (provider, model, prompt_version=sales_reply_v4, latency, ukuran, sukses/gagal)
POST /api/v1/ai/feedback → ai_feedback (GOOD / NEEDS_WORK + alasan)
```

## Target (fase 7) — pipeline modular di server
1. **Normalize input** (teks/screenshot, telepon).
2. **Load context**: client → lead aktif → tahap → memori terverifikasi → pesan terakhir + ringkasan bergulir → tugas → estimasi terakhir.
3. **Retrieve knowledge**: FULLTEXT MySQL, diberi peringkat, ID knowledge dicatat (provenance).
4. **Satu panggilan LLM** (gabungan intent + strategi + balasan + kandidat memori + next action) untuk menjaga latensi; panggilan kedua hanya untuk ringkasan percakapan saat riwayat panjang.
5. **Validasi**: skema Zod; pengecekan faktual ringan (harga yang disebut harus ada di knowledge; tidak ada kelangkaan tanpa sumber).
6. **Output**: `reply`, `intent`, `strategy`, `stage`, `missingFields`, `nextAction {type, priority, dueAt?}`, `memoryCandidates[]`, `knowledgeIds[]`. Tidak ada angka "confidence" yang ditampilkan tanpa kalibrasi.
7. **Human control**: saran tahap/tugas/memori tampil sebagai tombol "Terapkan", tidak otomatis.

## Prinsip
- Prompt versi (`sales_reply_v4`, nanti `memory_extract_v1`) dicatat per generasi.
- Tidak ada fine-tuning dari data pengguna; feedback dipakai untuk evaluasi prompt.
- Metrik: acceptance (feedback GOOD), copy rate, regenerasi, error rate, latensi — dari `ai_generations` + `ai_feedback`.
