# Andhika Rafi — Portfolio

Website portofolio pribadi milik Andhika Rafi, siswa kelas 11 jurusan Teknik Jaringan Komputer dan Telekomunikasi (TJKT) di SMK Wikrama Bogor. Website ini menampilkan profil, keahlian, proyek, dan sertifikat secara interaktif.

---

## Tampilan

- Desain dark futuristic dengan efek glassmorphism
- Animasi partikel interaktif di background
- Custom cursor dengan efek hover
- Animasi scroll reveal pada setiap section
- Fully responsive untuk semua ukuran layar

---

## Fitur

- Hero section dengan badge status, deskripsi singkat, dan tautan media sosial
- Section Tentang dengan statistik animasi (proyek, sertifikat, teknologi)
- Timeline pendidikan dan pengalaman
- Scrolling skills marquee dua arah (kiri dan kanan)
- Portofolio dengan tab Proyek dan Sertifikat
- Modal viewer untuk sertifikat dengan navigasi keyboard (panah kiri/kanan, Esc)
- Form kontak dengan validasi real-time
- Floating navbar dengan highlight section aktif saat scroll
- Tombol back to top
- Data proyek dan sertifikat diambil dari `data.json` secara dinamis

---

## Teknologi yang Digunakan

- HTML5
- CSS3 (custom properties, animasi, glassmorphism)
- JavaScript (Vanilla, tanpa framework)
- Google Fonts (Syne, DM Sans)
- Canvas API untuk animasi partikel
- Intersection Observer API untuk scroll reveal dan counter animasi

---

## Struktur Proyek

```
portfolio/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   ├── cover.jpg
│   │   ├── donghua.png
│   │   └── donghua1.png
│   └── js/
│       └── script.js
├── project/
│   └── detail.html
├── sertifikat/
│   ├── cisco.png
│   ├── cyber.png
│   ├── jaringan.png
│   └── linux.png
├── data.json
├── index.html
└── README.md
```

---

## Data Proyek

Proyek dan sertifikat dikelola melalui file `data.json`. Untuk menambah atau mengubah konten, cukup edit file tersebut tanpa perlu menyentuh HTML.

Contoh struktur proyek:

```json
{
  "id": 1,
  "title": "Nama Proyek",
  "description": "Deskripsi singkat",
  "longDesc": "Deskripsi panjang",
  "tech": ["Node.js", "Express"],
  "image": "assets/img/nama.png",
  "github": "https://github.com/...",
  "demo": "https://..."
}
```

---

## Proyek yang Ditampilkan

| Proyek | Teknologi | Deskripsi |
|---|---|---|
| Donghua Streaming | Node.js, Express, Cheerio | Platform streaming donghua dengan scraper otomatis |
| YouTube Converter | Python, Flask, FFmpeg | Konversi video YouTube ke MP3/MP4 |
| TikTok Photo Downloader | Python, PyQt5 | Aplikasi desktop untuk unduh foto TikTok |
| Music Streaming Website | PHP, MySQL, JavaScript | Platform streaming musik dengan autentikasi pengguna |

---

## Sertifikat

- Cisco Dasar — IDN (2026)
- Cyber Security Dasar — IDN (2026)
- Linux Dasar — IDN (2026)
- Jaringan Komputer Dasar — IDN (2026)

---

## Cara Menjalankan

Website ini adalah static site yang tidak memerlukan build tools atau instalasi dependensi.

1. Clone repository ini
2. Buka file `index.html` di browser, atau gunakan live server (misalnya ekstensi Live Server di VS Code)

```bash
git clone https://github.com/dhiksn/portfolio.git
cd portfolio
# Buka index.html di browser
```

---

## Kontak

- Email: andhikarafi@gmail.com
- GitHub: [github.com/dhiksn](https://github.com/dhiksn)
- LinkedIn: [linkedin.com/in/andhikarafi](https://linkedin.com/in/andhikarafi)
- Instagram: [@andhika_itsu](https://instagram.com/andhika_itsu)
- Lokasi: Bogor, Jawa Barat, Indonesia

---

© 2026 Andhika Rafi. SMK Wikrama Bogor — TJKT.
