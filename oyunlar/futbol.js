// Futbol Şut Akademisi
// Sorular üniteye göre; doğru cevap = daha güçlü şut, yanlış = kaleci tutar.

const params = new URLSearchParams(location.search);
const SINIF = parseInt(params.get("sinif"), 10) || 5;
const DERS = params.get("ders") || "fen-bilimleri";
const UNITE = parseInt(params.get("unite"), 10) || 1;
const DERS_AD = params.get("dersAd") || "Fen Bilimleri";
const UNITE_AD = params.get("uniteAd") || `Ünite ${UNITE}`;

// Almanca için ünite sayfasından gelen zorluk seçimi (kolay | orta | zor)
const ZORLUK_SIRA = ["kolay", "orta", "zor"];
const zorlukParam = (params.get("zorluk") || "").toLowerCase();
const SECILI_ZORLUK = ZORLUK_SIRA.includes(zorlukParam) ? zorlukParam : null;

const TOPLAM_HUCUM = 8;
const state = {
  skorBiz: 0,
  skorCpu: 0,
  hucum: TOPLAM_HUCUM,
  mesafe: 0,
  seri: 0,
  penaltiHazir: false,
  oyunBitti: false,
  oyuncu: null,
  kullanilan: [],
  sirada: null, // "pas" | "calsim" | "sut" | "penalti"
  nisanAnim: null,
  nisanX: 0.5,
  nisanYon: 1,
  beklemede: false,
};

const el = (id) => document.getElementById(id);
const mesajGoster = (t) => { el("mesaj").textContent = t; };

// Seçilen zorluk varsa futbol arayüzündeki sabit "Kolay/Zor soru" etiketlerini güncelle
if (SECILI_ZORLUK) {
  const seviye = SECILI_ZORLUK[0].toUpperCase() + SECILI_ZORLUK.slice(1);
  const kucukMetin = {
    btnPas: "Topu koru",
    btnCalsim: "İleri çık",
    btnSut: "Tıkla, köşeye vur!",
    btnPenalti: "Nişan al!",
  };
  Object.keys(kucukMetin).forEach((id) => {
    const btn = el(id);
    const kucuk = btn && btn.querySelector("small");
    if (kucuk) kucuk.textContent = `${seviye} soru · ${kucukMetin[id]}`;
  });
  const hucumMetin = document.querySelector("#hucumModal .soru-metin");
  if (hucumMetin) {
    hucumMetin.innerHTML = `Kaleci öne fırladı — <b>PENALTI</b> kazandın! ${seviye} soruyu bil ve ağları havalandır.`;
  }
}

function guncelleHUD() {
  el("skorBiz").textContent = state.skorBiz;
  el("skorCpu").textContent = state.skorCpu;
  el("kalanHucum").textContent = `Hücum: ${state.hucum}`;
  el("seriGoster").textContent = `🔥 Seri: ${state.seri}`;
  el("mesafeDolgu").style.width = `${state.mesafe}%`;
  const etiket =
    state.mesafe < 25 ? "Kendi sahamız" :
    state.mesafe < 50 ? "Orta saha" :
    state.mesafe < 75 ? "Rakip saha" : "Şut çekilebilir!";
  el("mesafeEtiket").textContent = `${etiket} · Mesafe: %${Math.round(state.mesafe)}`;
  el("btnPenalti").disabled = !state.penaltiHazir || state.beklemede || state.oyunBitti;
  ["btnPas", "btnCalsim", "btnSut"].forEach((id) => {
    el(id).disabled = state.beklemede || state.oyunBitti;
  });
  el("btnPas").disabled = el("btnPas").disabled || state.penaltiHazir;
  el("btnCalsim").disabled = el("btnCalsim").disabled || state.penaltiHazir;
  el("btnSut").disabled = el("btnSut").disabled || state.penaltiHazir;
}

function efektGoster(metin, renk) {
  const e = el("efekt");
  e.textContent = metin;
  e.style.color = renk;
  e.classList.remove("goster");
  void e.offsetWidth;
  e.classList.add("goster");
}

function topuSifirla() {
  const t = el("top");
  t.style.transition = "none";
  t.style.bottom = "24px";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%) scale(1)";
  t.classList.remove("aut");
  void t.offsetWidth;
  t.style.transition = "";
}

// ---------- Soru akışı ----------
function soruCek(zorluk) {
  const denenecek = [zorluk, ...ZORLUK_SIRA.filter((z) => z !== zorluk)];
  for (const z of denenecek) {
    const s = soruUret(SINIF, DERS, UNITE, z, state.kullanilan);
    if (s) {
      state.kullanilan.push(s.s);
      return s;
    }
  }
  // Havuz tükendiyse kullanılan soruları sıfırlayıp tekrar dene
  state.kullanilan = [];
  for (const z of denenecek) {
    const s = soruUret(SINIF, DERS, UNITE, z, []);
    if (s) {
      state.kullanilan.push(s.s);
      return s;
    }
  }
  return null;
}

function soruAc(tur, zorluk, onDogru, onYanlis) {
  const q = soruCek(zorluk);
  if (!q) {
    mesajGoster("Soru bulunamadı, tekrar deneniyor...");
    setTimeout(() => soruAc(tur, zorluk, onDogru, onYanlis), 300);
    return;
  }
  state.beklemede = true;
  guncelleHUD();
  el("soruTur").textContent = `${tur} SORUSU · ${DERS_AD} · Ünite ${UNITE}`;
  el("soruMetin").textContent = q.s;
  const ipuclari = {
    kolay: "Kolay soru: top sende kalsın.",
    orta: "Orta soru: dikkatli oyna, fırsatı kaçırma.",
    zor: "Zor soru: iyi düşün, güçlü şut!",
  };
  el("soruIpucu").textContent = ipuclari[zorluk] || ipuclari.kolay;
  const kutu = el("secenekler");
  kutu.innerHTML = "";
  q.secenekler.forEach((sec, i) => {
    const b = document.createElement("button");
    b.className = "secenek";
    b.textContent = sec;
    b.onclick = () => cevapla(i === q.dogruIdx, b, kutu, onDogru, onYanlis);
    kutu.appendChild(b);
  });
  el("soruModal").classList.add("acik");
}

function cevapla(dogru, btn, kutu, onDogru, onYanlis) {
  [...kutu.children].forEach((c) => (c.disabled = true));
  btn.classList.add(dogru ? "dogru" : "yanlis");
  el("soruIpucu").textContent = dogru ? "Doğru! Devam..." : "Yanlış! Kaleci gole izin vermedi.";
  setTimeout(() => {
    el("soruModal").classList.remove("acik");
    state.beklemede = false;
    if (dogru) {
      state.seri++;
      onDogru();
    } else {
      state.seri = 0;
      onYanlis();
    }
    guncelleHUD();
  }, dogru ? 600 : 1100);
}

// ---------- Aksiyonlar ----------
el("btnPas").onclick = () => {
  soruAc("PAS", SECILI_ZORLUK || "kolay", () => {
    state.mesafe = Math.min(100, state.mesafe + 10);
    mesajGoster("Pas tuttu! Kimseye kaptırmadan oyna.");
    topuSifirla();
    guncelleHUD();
  }, () => {
    mesajGoster("Pas koptu! Rakip topu aldı.");
    topKaybettin();
  });
};

el("btnCalsim").onclick = () => {
  soruAc("ÇALIM", SECILI_ZORLUK || "kolay", () => {
    state.mesafe = Math.min(100, state.mesafe + 22);
    mesajGoster("Çalım patladı! Rakipler sende takıldı.");
    if (state.mesafe >= 50 && Math.random() < 0.55 && !state.penaltiHazir) {
      state.penaltiHazir = true;
      mesajGoster("Faul! PENALTI kazandın 🎯");
      el("hucumModal").classList.add("acik");
    }
    topuSifirla();
    guncelleHUD();
  }, () => {
    mesajGoster("Çalım tutmadı, top rakipte!");
    topKaybettin();
  });
};

el("btnPenalti").onclick = () => {
  state.penaltiHazir = false;
  sutCek(true);
};

el("btnPenaltiBasla").onclick = () => {
  el("hucumModal").classList.remove("acik");
  state.penaltiHazir = false;
  sutCek(true);
};

el("btnSut").onclick = () => sutCek(false);

function topKaybettin() {
  state.mesafe = 0;
  state.penaltiHazir = false;
  topuSifirla();
  hucumBitir();
}

// ---------- Şut & Nişan ----------
function sutCek(penalti) {
  const tur = penalti ? "PENALTI" : "ŞUT";
  soruAc(tur, SECILI_ZORLUK || "zor", () => {
    nisanlamaBaslat(penalti);
  }, () => {
    // yanlış: kaleci tutar
    mesajGoster(penalti ? "Kaleci köşeye uçtu, kurtardı!" : "Şut zayıftı, kaleci tuttu!");
    kaleciKurtar(false);
  });
}

function nisanlamaBaslat(penalti) {
  state.beklemede = true;
  guncelleHUD();
  const kale = el("kale");
  const saha = el("saha");
  kale.classList.add("hedef-aktif");
  mesajGoster(
    penalti
      ? "KALEDE bir yere TIKLA / DOKUN! Direk dibine vurma, aut olur!"
      : "ŞUT: Kalede nereye istiyorsan ORAYA TIKLA! Köşeler ideal."
  );

  const bitir = (e) => {
    e.preventDefault();
    kale.classList.remove("hedef-aktif");
    saha.onclick = null;
    window.removeEventListener("keydown", bosTus);

    const rect = kale.getBoundingClientRect();
    let nx;
    if (e.clientX !== undefined && e.clientX !== 0) {
      nx = (e.clientX - rect.left) / rect.width;
    } else if (e.touches && e.touches[0]) {
      nx = (e.touches[0].clientX - rect.left) / rect.width;
    } else {
      nx = state.nisanX;
    }
    nx = Math.min(1.15, Math.max(-0.15, nx));
    state.nisanX = nx;
    state.beklemede = false;
    sutSonucu(nx, penalti, rect);
  };

  const bosTus = (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      // merkeze güçlü şut
      state.nisanX = 0.5;
      kale.classList.remove("hedef-aktif");
      saha.onclick = null;
      window.removeEventListener("keydown", bosTus);
      state.beklemede = false;
      sutSonucu(0.5, penalti, kale.getBoundingClientRect());
    }
  };

  saha.onclick = bitir;
  window.addEventListener("keydown", bosTus);
}

function sutSonucu(x, penalti, kaleRect) {
  // Güç: pas/çalım yaptıkça (mesafe) ve seri arttıkça yükselir. Direkt şut = zayıf/yavaş.
  const guc = Math.min(1.5, 0.3 + state.seri * 0.09 + (state.mesafe / 100) * 0.5 + (penalti ? 0.18 : 0));
  // x: kale koordinatında 0..1 (0 = sol direk, 1 = sağ direk); 0..1 dışında aut
  const kaleIci = x >= 0 && x <= 1;

  const t = el("top");
  const gk = el("kaleci");
  const saha = el("saha");
  const sahaRect = saha.getBoundingClientRect();

  if (!kaleIci) {
    mesajGoster(penalti ? "PENALTI AUT! Direğin dibinden geçti!" : "ŞUT AUT! Kalenin dışında.");
    efektGoster("AUT!", "#ef4444");
    const autX = x < 0 ? 12 : 88;
    t.style.bottom = "200px";
    t.style.left = `${autX}%`;
    t.style.transform = "translateX(-50%) scale(0.8)";
    t.classList.add("aut");
    setTimeout(() => {
      topuSifirla();
      hucumBitir();
    }, 900);
    return;
  }

  // Top tıklanan noktaya uçsun (saha koordinatına çevir)
  const hedefLeftSaha = kaleRect.left - sahaRect.left + x * kaleRect.width;
  const hedefTopSaha = kaleRect.top - sahaRect.top + (0.15 + Math.random() * 0.55) * kaleRect.height;
  const sahaH = sahaRect.height;
  const topBottom = Math.max(20, sahaH - hedefTopSaha - 12);

  // Kaleci: düşük güçte şutun yönünü iyi okur (aynı tarafa uçar), güç arttıkça geç kalır
  const okuma = Math.min(0.9, Math.max(0.12, 0.95 - guc * 0.5));
  let gkX;
  if (Math.random() < okuma) {
    gkX = Math.min(1, Math.max(0, x + (Math.random() - 0.5) * 0.36));
  } else {
    gkX = 0.08 + Math.random() * 0.84;
  }
  const kurtarmaYariCap = Math.max(0.06, 0.26 - guc * 0.2);
  const tuttu = Math.abs(x - gkX) < kurtarmaYariCap && Math.random() < Math.min(0.97, 0.96 - guc * 0.28);

  gk.style.left = `${gkX * 100}%`;

  // Top hızı güce bağlı: düşük güçte yavaş başlar, seri/pas-çalım ile hızlanır
  const sure = Math.max(0.3, Math.min(0.95, 1.05 - guc * 0.5));
  t.style.transition = `all ${sure}s cubic-bezier(0.45, 0, 0.7, 0)`;
  t.style.bottom = `${topBottom}px`;
  t.style.left = `${hedefLeftSaha}px`;
  t.style.transform = "translateX(-50%) scale(0.65)";

  setTimeout(() => {
    if (tuttu) {
      mesajGoster("KALECİ! Topu köşeden çıkardı!");
      efektGoster("KURTARIŞ", "#38bdf8");
      t.style.transform = "translateX(-50%) scale(0.9) translateY(30px)";
      setTimeout(() => {
        topuSifirla();
        gk.style.left = "50%";
        hucumBitir();
      }, 800);
    } else {
      state.skorBiz++;
      const sert = guc > 0.95;
      mesajGoster(sert ? "GOOOL! Duvar gibi bir şut!" : "GOOOL! Ağları havalandırdın!");
      efektGoster(sert ? "GOOOL! 💥" : "GOOOL! ⚽", "#fbbf24");
      guncelleHUD();
      setTimeout(() => {
        topuSifirla();
        gk.style.left = "50%";
        hucumBitir();
      }, 1000);
    }
  }, sure * 1000 + 80);
}

function kaleciKurtar(penalti) {
  const gk = el("kaleci");
  const yan = Math.random() < 0.5 ? "15%" : "85%";
  gk.style.left = yan;
  const t = el("top");
  t.style.bottom = "60px";
  t.style.left = yan;
  t.style.transform = "translateX(-50%) scale(0.75)";
  efektGoster("KURTARIŞ", "#38bdf8");
  setTimeout(() => {
    topuSifirla();
    gk.style.left = "50%";
    hucumBitir();
  }, 900);
}

// ---------- Hücum bitişi / Rakip ----------
function hucumBitir() {
  state.mesafe = 0;
  state.penaltiHazir = false;
  state.hucum--;
  guncelleHUD();

  // Rakip kontratak
  if (Math.random() < 0.28 && state.hucum > 0) {
    state.skorCpu++;
    mesajGoster("Rakip kontratatta gol attı... Hemen toparlan!");
    guncelleHUD();
  }

  if (state.hucum <= 0) {
    bitir();
  } else {
    topuSifirla();
    setTimeout(() => {
      if (!state.oyunBitti) mesajGoster(`Yeni hücum! Kalan: ${state.hucum}`);
    }, 400);
  }
}

function bitir() {
  state.oyunBitti = true;
  guncelleHUD();
  const b = state.skorBiz, k = state.skorCpu;
  let baslik, metin;
  if (b > k) { baslik = "🏆 Kazandın!"; metin = `${b} - ${k}! Kaleciyi çözdün, şutların patladı.`; }
  else if (b === k) { baslik = "🤝 Berabere!"; metin = `${b} - ${k}. Bir dahaki maçta seriyle sert vur!`; }
  else { baslik = "😵 Kaybettin..."; metin = `${b} - ${k}. Daha çok pas-çalım yap, seriyi yükselt, şutlar sertleşsin!`; }
  metin += `\nDoğru cevap serin şut gücünü artırır; kaleci tutarsa top elde kalır.`;

  if (typeof PuanDeposu !== "undefined") {
    const isim = state.oyuncu || "Misafir";
    const kayit = PuanDeposu.macKaydet(isim, b, k);
    const macPuan = b - k;
    metin += `\n\n👤 ${isim}: bu maç ${macPuan >= 0 ? "+" : ""}${macPuan} puan · Toplam ${kayit.puan >= 0 ? "+" : ""}${kayit.puan} puan (${kayit.mac} maç)`;
  }

  el("sonucBaslik").textContent = baslik;
  el("sonucMetin").textContent = metin;
  el("sonucModal").classList.add("acik");
}

el("btnTekrar").onclick = () => location.reload();

// ---------- Öğrenci Seç ----------
function aktifSinif() {
  if (typeof SinifDeposu === "undefined") return null;
  return SinifDeposu.aktif();
}

function ogrenciBilgiCiz() {
  const s = aktifSinif();
  el("ogrenciSinif").textContent = s
    ? `${s.ad} · ${s.ogrenciler.length} öğrenci`
    : "Sınıf yok (ana sayfadan ekle)";
}

el("btnOgrenciSec").onclick = () => {
  const s = aktifSinif();
  const isimEl = el("ogrenciIsim");
  const altEl = el("ogrenciAlt");
  if (!s || !s.ogrenciler.length) {
    isimEl.textContent = "Öğrenci bulunamadı";
    altEl.textContent = "Ana sayfada “+ Sınıf Ekle” ile sınıf ve öğrenci ekle.";
    el("ogrenciModal").classList.add("acik");
    return;
  }
  const o = SinifDeposu.rastgeleOgrenci(s.id);
  state.oyuncu = o;
  isimEl.textContent = o;
  altEl.textContent = `${s.ad} · rastgele seçildi`;
  el("ogrenciGoster").textContent = o;
  const g = el("ogrenciGoster");
  g.classList.remove("vurgu");
  void g.offsetWidth;
  g.classList.add("vurgu");
  el("ogrenciModal").classList.add("acik");
};

el("btnOgrenciKapat").onclick = () => el("ogrenciModal").classList.remove("acik");

if (el("btnSiralama")) el("btnSiralama").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };
if (el("btnSiralamaSonuc")) el("btnSiralamaSonuc").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };

ogrenciBilgiCiz();

// ---------- Başlangıç ----------
el("dersBilgi").textContent = `${DERS_AD} · Ünite ${UNITE}`;
document.title = `Futbol · ${DERS_AD} Ünite ${UNITE}`;
mesajGoster("Maç başladı! Pas veya çalım yap, seriyi yükselt, sert şut at!");
guncelleHUD();
