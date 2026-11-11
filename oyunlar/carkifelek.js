(function () {
  const qs = new URLSearchParams(location.search);
  const SINIF_ID = parseInt(qs.get("sinif") || "0", 10);
  const DERS_SLUG = qs.get("ders") || "";
  const UNITE_NO = parseInt(qs.get("unite") || "0", 10);
  const DERS_AD = qs.get("dersAd") || "Ders";
  const UNITE_AD = qs.get("uniteAd") || "Ünite";

  // Almanca için ünite sayfasından gelen zorluk seçimi (kolay | orta | zor)
  const ZORLUK_SIRA = ["kolay", "orta", "zor"];
  const zorlukParam = (qs.get("zorluk") || "").toLowerCase();
  const SECILI_ZORLUK = ZORLUK_SIRA.includes(zorlukParam) ? zorlukParam : null;

  const MAX_SORU = 16;

  // Çark dizilimi: 10 sayı + İFLAS + SIRA = 12 segment (her biri 30°)
  const SEG = [
    { tip: "sayi", deger: 10 },
    { tip: "iflas" },
    { tip: "sayi", deger: 50 },
    { tip: "sayi", deger: 4000 },
    { tip: "sayi", deger: 100 },
    { tip: "sira" },
    { tip: "sayi", deger: 250 },
    { tip: "sayi", deger: 8000 },
    { tip: "sayi", deger: 500 },
    { tip: "sayi", deger: 10000 },
    { tip: "sayi", deger: 1000 },
    { tip: "sayi", deger: 2000 }
  ];
  const SEG_RENK = {
    10: "#1e40af", 50: "#1d4ed8", 100: "#2563eb", 250: "#0891b2",
    500: "#0d9488", 1000: "#16a34a", 2000: "#65a30d", 4000: "#ca8a04",
    8000: "#ea580c", 10000: "#dc2626", iflas: "#7f1d1d", sira: "#4c1d95"
  };

  const TAKIM_ADLARI = [
    ["Kırmızılar", "#ef4444"], ["Maviler", "#38bdf8"], ["Yeşiller", "#22c55e"],
    ["Sarılar", "#eab308"], ["Morlar", "#a855f7"], ["Turuncular", "#f97316"]
  ];

  const el = (id) => document.getElementById(id);

  const state = {
    takimlar: [
      { ad: "Kırmızılar", renk: "#ef4444", ogrenciler: [], puan: 0, soruSayisi: 0 },
      { ad: "Maviler", renk: "#38bdf8", ogrenciler: [], puan: 0, soruSayisi: 0 }
    ],
    sira: 0,
    donuyor: false,
    bitti: false,
    donus: 0,          // birikmiş çark dönüşü (derece)
    soru: null,
    zorIndex: 0,
    kullanilan: [],
    ekran: "giris",
    mesajTimer: null
  };

  // ---------- Sınıf ----------
  function aktifSinif() {
    if (typeof SinifDeposu === "undefined") return null;
    return SinifDeposu.aktif();
  }

  function bilgiCiz() {
    const s = aktifSinif();
    el("dersBilgi").textContent = s
      ? `${s.ad} · ${DERS_AD} · Ünite ${UNITE_NO}`
      : `${DERS_AD} · Ünite ${UNITE_NO}`;
    document.title = `Çarkıfelek · ${DERS_AD} Ünite ${UNITE_NO}`;
  }

  // ---------- Ekran ----------
  function ekranGoster(hangi) {
    state.ekran = hangi;
    el("ekranGiris").hidden = hangi !== "giris";
    el("ekranOyun").hidden = hangi !== "oyun";
  }

  // ---------- Takım bölme ----------
  function takimGuncelle() {
    state.takimlar.forEach((t, i) => {
      el("isimT" + i).textContent = t.ad;
      el("isimT" + i).style.color = t.renk;
      el("puanT" + i).textContent = t.puan;
      el("kartT" + i).style.borderColor = t.renk;
      const liste = el("uyelerT" + i);
      liste.innerHTML = "";
      if (t.ogrenciler.length === 0) {
        const b = document.createElement("span");
        b.className = "bos-uye";
        b.textContent = "Öğrenci yok — takımla oyna";
        liste.appendChild(b);
      } else {
        t.ogrenciler.forEach((o) => {
          const u = document.createElement("span");
          u.className = "uye";
          u.textContent = o;
          liste.appendChild(u);
        });
      }
      el("kartT" + i).className = "takim-karti t" + i;
    });
    el("baslatNot").textContent =
      state.takimlar[0].ogrenciler.length + state.takimlar[1].ogrenciler.length > 0
        ? `Toplam ${state.takimlar[0].ogrenciler.length + state.takimlar[1].ogrenciler.length} öğrenci iki takıma bölündü`
        : "Takımlar hazır — çark seni bekliyor!";
  }

  function takimlariBol() {
    const s = aktifSinif();
    if (!s || s.ogrenciler.length < 2) {
      el("baslatNot").textContent = "En az 2 öğrenci gerekli (Ana Sayfa > Sınıflarım)";
      return;
    }
    const karisik = s.ogrenciler.slice();
    for (let i = karisik.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [karisik[i], karisik[j]] = [karisik[j], karisik[i]];
    }
    const yarim = Math.ceil(karisik.length / 2);
    const adlar = TAKIM_ADLARI.slice();
    for (let i = adlar.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [adlar[i], adlar[j]] = [adlar[j], adlar[i]];
    }
    state.takimlar[0].ad = adlar[0][0];
    state.takimlar[0].renk = adlar[0][1];
    state.takimlar[1].ad = adlar[1][0];
    state.takimlar[1].renk = adlar[1][1];
    state.takimlar[0].ogrenciler = karisik.slice(0, yarim);
    state.takimlar[1].ogrenciler = karisik.slice(yarim);
    takimGuncelle();
  }

  function takimlariSifirla() {
    state.takimlar[0].ad = "Kırmızılar";
    state.takimlar[0].renk = "#ef4444";
    state.takimlar[1].ad = "Maviler";
    state.takimlar[1].renk = "#38bdf8";
    state.takimlar[0].ogrenciler = [];
    state.takimlar[1].ogrenciler = [];
    skorlariSifirla();
  }

  function skorlariSifirla() {
    state.takimlar.forEach((t) => { t.puan = 0; t.soruSayisi = 0; });
    state.sira = 0;
    state.bitti = false;
    state.soru = null;
    state.kullanilan = [];
    takimGuncelle();
    oyunGosterim();
  }

  // ---------- Çark çizimi ----------
  function carkCiz() {
    const canvas = el("cark");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) - 8;
    ctx.clearRect(0, 0, W, H);
    const adim = 360 / SEG.length;
    SEG.forEach((seg, i) => {
      const bas = (i * adim - 90) * Math.PI / 180;
      const bit = ((i + 1) * adim - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, bas, bit);
      ctx.closePath();
      ctx.fillStyle = SEG_RENK[seg.tip === "sayi" ? seg.deger : seg.tip];
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.stroke();
      // etiket
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * adim + adim / 2 - 90) * Math.PI / 180);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 17px 'Segoe UI', sans-serif";
      const etiket = seg.tip === "sayi" ? seg.deger.toLocaleString("tr-TR") : (seg.tip === "iflas" ? "İFLAS" : "SIRA");
      ctx.fillText(etiket, R - 14, 0);
      ctx.restore();
    });
    // orta
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ÇEVİR", cx, cy);
  }

  // ---------- Çevir ----------
  function cevir() {
    if (state.donuyor || state.bitti) return;
    const t = state.takimlar[state.sira];
    if (t.soruSayisi >= MAX_SORU) { sonrakiAdim(); return; }
    state.donuyor = true;
    el("btnCevir").disabled = true;
    el("mesajKutu").hidden = true;

    const idx = Math.floor(Math.random() * SEG.length);
    const offset = (Math.random() * 24) - 12; // -12..+12
    const hedefMod = (360 - (idx * 30 + 15 + offset)) % 360;
    const mevcutMod = ((state.donus % 360) + 360) % 360;
    let ekstra = (hedefMod - mevcutMod + 360) % 360 + 360 * (4 + Math.floor(Math.random() * 3));
    state.donus += ekstra;

    const cark = el("cark");
    cark.style.transition = "transform 3.4s cubic-bezier(0.12, 0.65, 0.12, 1)";
    cark.style.transform = "rotate(" + state.donus + "deg)";
    setTimeout(() => segmanCoz(idx), 3550);
  }

  function segmanCoz(idx) {
    state.donuyor = false;
    const seg = SEG[idx];
    const t = state.takimlar[state.sira];
    if (seg.tip === "sayi") {
      soruSor(seg.deger);
    } else if (seg.tip === "iflas") {
      t.puan = 0;
      takimGuncelle();
      mesajGoster("💥 " + t.ad + " İFLAS! Tüm puanlar sıfırlandı", "kotu");
      setTimeout(() => sonrakiAdim(), 2200);
    } else {
      mesajGoster("⏭ " + t.ad + " sorusuz geçti, sıra rakibe!", "nötr");
      setTimeout(() => sonrakiAdim(), 2200);
    }
  }

  // ---------- Soru ----------
  function soruSor(deger) {
    const zorluk = SECILI_ZORLUK || (deger <= 500 ? "kolay" : "zor");
    const denenecek = [zorluk, ...ZORLUK_SIRA.filter((z) => z !== zorluk)];
    let obj = null;
    if (typeof soruUret === "function") {
      for (const z of denenecek) {
        obj = soruUret(SINIF_ID, DERS_SLUG, UNITE_NO, z, state.kullanilan.slice(-60));
        if (obj && obj.s) break;
      }
      if (!obj || !obj.s) {
        for (const z of denenecek) {
          obj = soruUret(SINIF_ID, DERS_SLUG, UNITE_NO, z, []);
          if (obj && obj.s) break;
        }
      }
    }
    if (!obj || !obj.s) {
      mesajGoster("Bu ders/ünite için soru bulunamadı — tur atlandı", "nötr");
      setTimeout(() => sonrakiAdim(), 2200);
      return;
    }
    state.kullanilan.push(obj.s);
    state.soru = {
      metin: obj.s,
      dogru: obj.secenekler[obj.dogruIdx],
      sec: obj.secenekler.slice(),
      deger: deger
    };
    const t = state.takimlar[state.sira];
    t.soruSayisi++;
    takimGuncelle();

    el("soruTakim").textContent = t.ad + " soruyu yanıtlıyor";
    el("soruTakim").style.color = t.renk;
    el("soruDeger").textContent = "+" + deger.toLocaleString("tr-TR");
    el("soruMetni").textContent = obj.s;
    el("soruBilgi").textContent = "";
    el("soruBilgi").className = "soru-bilgi";
    el("btnDevam").hidden = true;

    const kont = el("secenekler");
    kont.innerHTML = "";
    state.soru.sec.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "secenek";
      btn.textContent = opt;
      btn.onclick = () => cevapla(opt, btn);
      kont.appendChild(btn);
    });
    el("soruModal").classList.add("acik");
  }

  function cevapla(metin, btn) {
    if (!state.soru) return;
    const dogru = metin === state.soru.dogru;
    const t = state.takimlar[state.sira];
    Array.from(el("secenekler").children).forEach((b) => {
      b.disabled = true;
      if (b.textContent === state.soru.dogru) b.classList.add("dogru");
    });
    if (dogru) {
      btn.classList.add("dogru");
      t.puan += state.soru.deger;
      el("soruBilgi").textContent = "✅ Doğru! +" + state.soru.deger.toLocaleString("tr-TR") + " puan";
      el("soruBilgi").className = "soru-bilgi iyi";
    } else {
      btn.classList.add("yanlis");
      el("soruBilgi").textContent = "❌ Yanlış! Doğru cevap yeşil ile işaretlendi";
      el("soruBilgi").className = "soru-bilgi kotu";
    }
    takimGuncelle();
    el("btnDevam").hidden = false;
    el("btnDevam").onclick = () => {
      el("soruModal").classList.remove("acik");
      state.soru = null;
      sonrakiAdim();
    };
  }

  // ---------- Sıra / bitiş ----------
  function sonrakiAdim() {
    if (state.takimlar[0].soruSayisi >= MAX_SORU && state.takimlar[1].soruSayisi >= MAX_SORU) {
      bitirOyun();
      return;
    }
    // Her turdan sonra rakibe geç
    const diger = 1 - state.sira;
    if (state.takimlar[diger].soruSayisi < MAX_SORU) {
      state.sira = diger;
    }
    oyunGosterim();
    el("btnCevir").disabled = false;
  }

  function bitirOyun() {
    state.bitti = true;
    el("btnCevir").disabled = true;
    const [a, b] = state.takimlar;
    let baslik;
    if (a.puan > b.puan) baslik = "🏆 Kazanan: " + a.ad;
    else if (b.puan > a.puan) baslik = "🏆 Kazanan: " + b.ad;
    else baslik = "🤝 Berabere!";
    el("sonucBaslik").textContent = baslik;
    el("sonucDetay").innerHTML =
      a.ad + ": <b>" + a.puan + "</b> puan (" + a.soruSayisi + " soru)<br>" +
      b.ad + ": <b>" + b.puan + "</b> puan (" + b.soruSayisi + " soru)";
    puanKaydet();
    el("sonucModal").classList.add("acik");
  }

  function puanKaydet() {
    if (typeof PuanDeposu === "undefined") return;
    const [a, b] = state.takimlar;
    const sinifAd = aktifSinif() ? aktifSinif().ad : "";
    const etiket = (t) => sinifAd ? t.ad + " (" + sinifAd + ")" : t.ad;
    if (a.puan > b.puan) {
      PuanDeposu.macKaydet(etiket(a), 1, 0);
      PuanDeposu.macKaydet(etiket(b), 0, 1);
    } else if (b.puan > a.puan) {
      PuanDeposu.macKaydet(etiket(b), 1, 0);
      PuanDeposu.macKaydet(etiket(a), 0, 1);
    }
  }

  // ---------- Oyun gösterimi ----------
  function oyunGosterim() {
    const s = state.sira;
    const st = state.takimlar[s];
    el("siraGosterge").textContent = "Sıra: " + st.ad;
    el("siraGosterge").style.background = st.renk;
    el("siraGosterge").style.color = "#ffffff";
    state.takimlar.forEach((t, i) => {
      const chip = el("chipT" + i);
      chip.className = "skor-chip " + (i === 0 ? "sol" : "sag") + (i === s && !state.bitti ? " aktif-takim" : "");
      chip.style.borderColor = t.renk;
      chip.querySelector(".chip-isim").textContent = t.ad;
      chip.querySelector(".chip-isim").style.color = t.renk;
      el("oyunPuanT" + i).textContent = t.puan;
      el("oyunSoruT" + i).textContent = t.soruSayisi + "/" + MAX_SORU + " soru";
    });
  }

  function mesajGoster(metin, tip) {
    const kutu = el("mesajKutu");
    kutu.textContent = metin;
    kutu.className = "mesaj-kutu " + (tip || "nötr");
    kutu.hidden = false;
    if (state.mesajTimer) clearTimeout(state.mesajTimer);
    state.mesajTimer = setTimeout(() => { kutu.hidden = true; }, 2300);
  }

  // ---------- Bağlayıcılar ----------
  el("btnTakimBol").onclick = takimlariBol;
  el("btnTakimSifirla").onclick = takimlariSifirla;
  el("btnSiralamaGiris").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };
  el("btnSiralamaOyun").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };
  el("btnSiralamaSonuc").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };

  el("btnOyunuBaslat").onclick = () => {
    skorlariSifirla();
    ekranGoster("oyun");
    oyunGosterim();
    el("btnCevir").disabled = false;
  };

  el("btnGeriGiris").onclick = () => {
    ekranGoster("giris");
    takimGuncelle();
  };

  el("btnCevir").onclick = cevir;

  el("btnYeniOyun").onclick = () => {
    el("cark").style.transition = "none";
    el("cark").style.transform = "rotate(0deg)";
    state.donus = 0;
    skorlariSifirla();
    el("btnCevir").disabled = false;
  };

  el("btnTekrarOyna").onclick = () => {
    el("sonucModal").classList.remove("acik");
    el("cark").style.transition = "none";
    el("cark").style.transform = "rotate(0deg)";
    state.donus = 0;
    skorlariSifirla();
    ekranGoster("oyun");
    oyunGosterim();
    el("btnCevir").disabled = false;
  };

  // ---------- Başlat ----------
  bilgiCiz();
  carkCiz();
  takimGuncelle();
  ekranGoster("giris");
})();
