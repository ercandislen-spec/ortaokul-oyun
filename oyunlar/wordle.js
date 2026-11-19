(function () {
  "use strict";

  // ---------- Sabitler ----------
  const MAX_HAK = 6;
  const SKOR_KEY = "wordleSkor_v1";
  const UZUNLUKLAR = [4, 5, 6];
  const INGILIZ_HARFLER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const KLAVYE_SATIRLARI = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM",
  ];

  const el = (id) => document.getElementById(id);
  const tahta = el("tahta");
  const klavye = el("klavye");
  const mesajEl = el("mesaj");

  // ---------- Durum ----------
  let kelimeHavuzu = { 4: [], 5: [], 6: [] };
  let secilenUzunluk = 5;
  let hedef = null;
  let harfSayisi = 5;
  let deneme = 0;
  let mevcut = "";
  let bitti = false;
  let ozelMod = false;
  let klavyeDurum = {};
  let sozluk = null; // İngilizce sözlük (A-Z kelimeler)
  let sozlukHazir = false;
  let ozelBekleyenKelime = ""; // Sözlükte olmayıp "Yine de kullan" bekleyen kelime
  let skorlar = { A: 0, B: 0 };

  // ---------- Yardımcılar ----------
  function ingilizceBuyuk(metin) {
    return String(metin || "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
  }

  function mesajAyarla(metin, tur, zorla) {
    mesajEl.textContent = metin;
    mesajEl.className = "mesaj" + (tur ? " " + tur : "");
    el("btnYineDe").hidden = !zorla;
  }

  function salla() {
    tahta.classList.remove("salla");
    void tahta.offsetWidth;
    tahta.classList.add("salla");
  }

  // ---------- Takım skorları ----------
  function skorlariYukle() {
    try {
      const ham = localStorage.getItem(SKOR_KEY);
      if (!ham) return;
      const veri = JSON.parse(ham);
      if (veri && Number.isFinite(veri.A)) skorlar.A = Math.trunc(veri.A);
      if (veri && Number.isFinite(veri.B)) skorlar.B = Math.trunc(veri.B);
    } catch (hata) {
      /* Depolama kapalıysa sıfırdan başla */
    }
  }

  function skorlariKaydet() {
    try {
      localStorage.setItem(SKOR_KEY, JSON.stringify(skorlar));
    } catch (hata) {
      /* Yoksay */
    }
  }

  function skorEkraniniGuncelle() {
    el("skorA").textContent = String(skorlar.A);
    el("skorB").textContent = String(skorlar.B);
  }

  function skorDegistir(takim, delta) {
    if (takim !== "A" && takim !== "B") return;
    const miktar = Number(delta);
    if (!Number.isFinite(miktar)) return;
    skorlar[takim] += miktar;
    skorlariKaydet();
    skorEkraniniGuncelle();
  }

  function skorSifirla() {
    skorlar.A = 0;
    skorlar.B = 0;
    skorlariKaydet();
    skorEkraniniGuncelle();
  }

  function skorModalAc(neden) {
    el("skorModalAciklama").textContent =
      neden === "kazandi"
        ? "Kelime bulundu! Skor güncellensin mi?"
        : "Hakkın doldu. Skor güncellensin mi?";
    el("skorModal").classList.add("acik");
    el("skorModal").setAttribute("aria-hidden", "false");
  }

  function skorModalKapat() {
    el("skorModal").classList.remove("acik");
    el("skorModal").setAttribute("aria-hidden", "true");
  }

  function skorSonucVer(takim) {
    skorDegistir(takim, 1);
    skorModalKapat();
    const tur = mesajEl.className.replace(/\bmesaj\b/g, "").trim();
    mesajAyarla(`${mesajEl.textContent} · ${takim} Takımına +1 verildi.`, tur);
  }

  function kelimeleriYukle() {
    const kaynak = typeof WORDLE_KELIMELER !== "undefined" ? WORDLE_KELIMELER : null;
    const havuz = { 4: [], 5: [], 6: [] };

    const listeyiEkle = (liste) => {
      if (!Array.isArray(liste)) return;
      liste.forEach((ham) => {
        const kelime = ingilizceBuyuk(ham);
        if (havuz[kelime.length]) havuz[kelime.length].push(kelime);
      });
    };

    if (Array.isArray(kaynak)) {
      listeyiEkle(kaynak);
    } else if (kaynak && typeof kaynak === "object") {
      UZUNLUKLAR.forEach((u) => listeyiEkle(kaynak[u] || kaynak[String(u)]));
    }

    UZUNLUKLAR.forEach((u) => {
      havuz[u] = Array.from(new Set(havuz[u]));
    });
    kelimeHavuzu = havuz;
  }

  // İngilizce sözlüğü yükle: sözlükte olmayan tahminler kabul edilmez.
  // Kaynak: SCOWL / dwyl english-words (3–12 harfli, A–Z kelimeler).
  async function sozluguYukle() {
    try {
      const yanit = await fetch("wordle-sozluk.txt?v=20261119", { cache: "force-cache" });
      if (!yanit.ok) throw new Error("HTTP " + yanit.status);
      const metin = await yanit.text();
      sozluk = new Set(
        metin
          .split(/\r?\n/)
          .map((kelime) => kelime.trim().toUpperCase())
          .filter((kelime) => /^[A-Z]{3,12}$/.test(kelime))
      );

      // Kendi listemizdeki kelimeler sözlükte yoksa da geçerli sayılsın.
      UZUNLUKLAR.forEach((u) => {
        kelimeHavuzu[u].forEach((kelime) => sozluk.add(kelime));
      });

      sozlukHazir = true;
      if (!bitti && hedef) klavyeAc();
      if (hedef) mesajAyarla("", "");
    } catch (hata) {
      sozlukHazir = false;
      klavyeKilitle();
      mesajAyarla("İngilizce sözlük yüklenemedi. Sayfayı yenile.", "hata");
    }
  }

  function sozlukteMi(kelime) {
    return sozlukHazir && sozluk ? sozluk.has(kelime) : false;
  }

  function klavyeyiOyunDurumunaGoreAyarla() {
    if (bitti || !sozlukHazir) klavyeKilitle();
    else klavyeAc();
  }

  function uzunlukButonlariGuncelle() {
    const aktifUzunluk = ozelMod && !UZUNLUKLAR.includes(harfSayisi) ? null : secilenUzunluk;
    document.querySelectorAll(".uzunluk-btn").forEach((btn) => {
      const aktif = parseInt(btn.dataset.uzunluk, 10) === aktifUzunluk;
      btn.classList.toggle("aktif", aktif);
      btn.setAttribute("aria-pressed", String(aktif));
    });
  }

  function kelimeSec(havuz) {
    if (havuz.length === 1) return havuz[0];
    let yeni = hedef;
    let guvenlik = 0;
    while (yeni === hedef && guvenlik < 30) {
      yeni = havuz[Math.floor(Math.random() * havuz.length)];
      guvenlik++;
    }
    return yeni;
  }

  // ---------- Tahta ----------
  function tahtaKur() {
    tahta.hidden = false;
    tahta.innerHTML = "";
    tahta.style.setProperty("--harf-sayisi", String(harfSayisi));
    tahta.classList.remove("salla");
    for (let r = 0; r < MAX_HAK; r++) {
      for (let c = 0; c < harfSayisi; c++) {
        const kutu = document.createElement("div");
        kutu.className = "kutu";
        kutu.dataset.satir = String(r);
        kutu.dataset.kolon = String(c);
        tahta.appendChild(kutu);
      }
    }
  }

  function kutulariYaz() {
    for (let c = 0; c < harfSayisi; c++) {
      const kutu = tahta.children[deneme * harfSayisi + c];
      if (!kutu) continue;
      const harf = mevcut[c] || "";
      kutu.textContent = harf;
      kutu.classList.toggle("dolu", !!harf);
    }
  }

  function degerlendir(tahmin) {
    const sonuc = new Array(harfSayisi).fill("yok");
    const kalan = {};

    // 1. geçiş: doğru yerdeki harfler
    for (let i = 0; i < harfSayisi; i++) {
      if (tahmin[i] === hedef[i]) {
        sonuc[i] = "dogru";
      } else {
        kalan[hedef[i]] = (kalan[hedef[i]] || 0) + 1;
      }
    }

    // 2. geçiş: kelimede olup yeri yanlış olan harfler
    for (let i = 0; i < harfSayisi; i++) {
      if (sonuc[i] === "dogru") continue;
      if ((kalan[tahmin[i]] || 0) > 0) {
        sonuc[i] = "var";
        kalan[tahmin[i]]--;
      }
    }
    return sonuc;
  }

  // ---------- Klavye ----------
  function tusOlustur(etiket, ariaEtiket, ekSinif) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tus" + (ekSinif ? " " + ekSinif : "");
    b.textContent = etiket;
    if (ariaEtiket) b.setAttribute("aria-label", ariaEtiket);
    return b;
  }

  function klavyeKur() {
    klavye.innerHTML = "";
    KLAVYE_SATIRLARI.forEach((satir, sira) => {
      const satirEl = document.createElement("div");
      satirEl.className = "klavye-satir";

      for (const harf of satir) {
        const b = tusOlustur(harf, harf);
        b.dataset.harf = harf;
        b.onclick = () => {
          ekle(harf);
          b.blur();
        };
        satirEl.appendChild(b);
      }

      if (sira === KLAVYE_SATIRLARI.length - 1) {
        const silBtn = tusOlustur("⌫", "Son harfi sil", "genis");
        silBtn.onclick = () => {
          sil();
          silBtn.blur();
        };
        satirEl.appendChild(silBtn);
      }
      klavye.appendChild(satirEl);
    });

    const sonSatir = document.createElement("div");
    sonSatir.className = "klavye-satir";
    const gonderBtn = tusOlustur("TAHMİN ET", "Tahmini gönder", "gonder");
    gonderBtn.onclick = () => {
      gonder();
      gonderBtn.blur();
    };
    sonSatir.appendChild(gonderBtn);
    klavye.appendChild(sonSatir);
  }

  function klavyeGuncelle() {
    klavye.querySelectorAll(".tus[data-harf]").forEach((b) => {
      const durum = klavyeDurum[b.dataset.harf];
      b.classList.remove("dogru", "var", "yok");
      if (durum) b.classList.add(durum);
    });
  }

  function klavyeKilitle() {
    klavye.querySelectorAll(".tus").forEach((b) => (b.disabled = true));
  }

  function klavyeAc() {
    klavye.querySelectorAll(".tus").forEach((b) => (b.disabled = false));
  }

  function durumEkle(harf, durum) {
    const oncelik = { yok: 0, var: 1, dogru: 2 };
    const eski = klavyeDurum[harf];
    if (!eski || oncelik[durum] > oncelik[eski]) {
      klavyeDurum[harf] = durum;
    }
  }

  // ---------- Oyun akışı ----------
  function durumGuncelle() {
    el("harfBilgi").textContent = ozelMod ? `${harfSayisi} harf · Özel` : `${harfSayisi} harf`;
    el("hakBilgi").textContent = `${Math.max(0, MAX_HAK - deneme)} hak`;
  }

  function yeniKelime() {
    ozelMod = false;
    uzunlukButonlariGuncelle();

    const havuz = kelimeHavuzu[secilenUzunluk] || [];
    if (!havuz.length) {
      bosDurum(secilenUzunluk);
      return;
    }

    hedef = kelimeSec(havuz);
    harfSayisi = secilenUzunluk;
    deneme = 0;
    mevcut = "";
    bitti = false;
    klavyeDurum = {};

    tahtaKur();
    klavyeyiOyunDurumunaGoreAyarla();
    klavyeGuncelle();
    durumGuncelle();
    mesajAyarla("", "");
    el("btnYeniKelime").disabled = false;
  }

  function ozelKelimeBaslat(kelime) {
    hedef = kelime;
    harfSayisi = kelime.length;
    deneme = 0;
    mevcut = "";
    bitti = false;
    ozelMod = true;
    klavyeDurum = {};
    if (UZUNLUKLAR.includes(harfSayisi)) secilenUzunluk = harfSayisi;

    tahtaKur();
    klavyeyiOyunDurumunaGoreAyarla();
    klavyeGuncelle();
    durumGuncelle();
    mesajAyarla("", "");
    el("btnYeniKelime").disabled = false;
    uzunlukButonlariGuncelle();
  }

  function bosDurum(uzunluk) {
    hedef = null;
    harfSayisi = uzunluk;
    deneme = 0;
    mevcut = "";
    bitti = true;
    ozelMod = false;
    tahta.hidden = true;
    tahta.innerHTML = "";
    klavyeKilitle();
    el("harfBilgi").textContent = `${uzunluk} harf`;
    el("hakBilgi").textContent = "Kelime yok";
    el("btnYeniKelime").disabled = true;
    uzunlukButonlariGuncelle();

    const toplamKelime = UZUNLUKLAR.reduce(
      (toplam, u) => toplam + kelimeHavuzu[u].length,
      0
    );
    if (!toplamKelime) {
      mesajAyarla(
        "Henüz kelime eklenmedi. oyunlar/wordle-kelimeler.js dosyasına İngilizce kelime ekleyip sayfayı yenile.",
        "uyari"
      );
    } else {
      mesajAyarla(
        `${uzunluk} harfli kelime henüz eklenmedi. Yukarıdan başka bir uzunluk seçebilirsin.`,
        "uyari"
      );
    }
  }

  function uzunlukSec(uzunluk) {
    if (!UZUNLUKLAR.includes(uzunluk)) return;
    secilenUzunluk = uzunluk;
    uzunlukButonlariGuncelle();
    if ((kelimeHavuzu[uzunluk] || []).length) {
      yeniKelime();
    } else {
      bosDurum(uzunluk);
    }
  }

  function ekle(harf) {
    if (bitti || !hedef || !sozlukHazir) return;
    if (mevcut.length >= harfSayisi) return;
    mesajAyarla("", ""); // Yazmaya başlayınca eski "Yine de yaz" uyarısını kaldır
    mevcut += harf;
    kutulariYaz();
  }

  function sil() {
    if (bitti || !hedef || !sozlukHazir || !mevcut.length) return;
    mesajAyarla("", ""); // Kelime değişince eski "Yine de yaz" uyarısını kaldır
    mevcut = mevcut.slice(0, -1);
    kutulariYaz();
  }

  function gonder(zorla) {
    if (bitti || !hedef) return;

    if (mevcut.length !== harfSayisi) {
      mesajAyarla(`Kelime ${harfSayisi} harf olmalı.`, "uyari");
      salla();
      return;
    }

    if (!sozlukHazir) {
      mesajAyarla("İngilizce sözlük yükleniyor, biraz bekler misin?", "uyari");
      return;
    }

    const tahmin = mevcut;
    if (!sozlukteMi(tahmin) && !zorla) {
      mesajAyarla(`“${tahmin}” İngilizce sözlükte yok. İstersen “Yine de yaz” ile kabul ettirebilirsin.`, "uyari", true);
      salla();
      return;
    }
    if (zorla && sozluk) sozluk.add(tahmin); // Aynı uyarı tekrar çıkmasın
    const renkler = degerlendir(tahmin);
    const satir = deneme;

    for (let c = 0; c < harfSayisi; c++) {
      const kutu = tahta.children[satir * harfSayisi + c];
      if (!kutu) continue;
      kutu.textContent = tahmin[c];
      kutu.className = "kutu " + renkler[c];
      durumEkle(tahmin[c], renkler[c]);
    }

    deneme++;
    mevcut = "";
    klavyeGuncelle();
    durumGuncelle();

    if (tahmin === hedef) {
      bitti = true;
      mesajAyarla(`🎉 Tebrikler! ${deneme} denemede bildin.`, "basari");
      klavyeKilitle();
      skorModalAc("kazandi");
      return;
    }

    if (deneme >= MAX_HAK) {
      bitti = true;
      mesajAyarla(`😔 Hakkın doldu. Doğru kelime: ${hedef}`, "hata");
      klavyeKilitle();
      skorModalAc("kaybetti");
      return;
    }

    mesajAyarla("", "");
  }

  // ---------- Kendi kelimeni ekle ----------
  function ozelHataAyarla(metin, zorla) {
    el("ozelHata").textContent = metin;
    el("btnOzelYineDe").hidden = !zorla;
    if (!zorla) ozelBekleyenKelime = "";
  }

  function ozelModalAc() {
    el("ozelGirdi").value = "";
    ozelHataAyarla("");
    el("ozelModal").classList.add("acik");
    el("ozelModal").setAttribute("aria-hidden", "false");
    setTimeout(() => el("ozelGirdi").focus(), 50);
  }

  function ozelModalKapat() {
    el("ozelModal").classList.remove("acik");
    el("ozelModal").setAttribute("aria-hidden", "true");
    ozelHataAyarla("");
  }

  function ozelKelimeDene() {
    const ham = el("ozelGirdi").value.trim();
    if (!ham) {
      ozelHataAyarla("Bir kelime yaz.");
      el("ozelGirdi").focus();
      return;
    }
    if (!/^[A-Za-z][A-Za-z' -]*$/.test(ham)) {
      ozelHataAyarla("Yalnızca İngilizce harf kullan (A-Z).");
      el("ozelGirdi").focus();
      return;
    }

    const kelime = ingilizceBuyuk(ham);
    if (kelime.length < 3 || kelime.length > 12) {
      ozelHataAyarla("Kelime 3–12 harf arasında olmalı.");
      el("ozelGirdi").focus();
      return;
    }

    if (!sozlukHazir) {
      ozelHataAyarla("İngilizce sözlük yükleniyor, biraz sonra tekrar dene.");
      el("ozelGirdi").focus();
      return;
    }
    if (!sozlukteMi(kelime)) {
      ozelBekleyenKelime = kelime;
      ozelHataAyarla(`“${kelime}” İngilizce sözlükte yok.`, true);
      el("ozelGirdi").focus();
      return;
    }
    if (sozluk) sozluk.add(kelime);

    ozelModalKapat();
    ozelKelimeBaslat(kelime);
  }

  // ---------- Olaylar ----------
  document.addEventListener("keydown", (e) => {
    if (el("skorModal").classList.contains("acik")) {
      if (e.key === "Escape") {
        e.preventDefault();
        skorModalKapat();
      }
      return;
    }

    if (el("ozelModal").classList.contains("acik")) {
      if (e.key === "Enter") {
        e.preventDefault();
        ozelKelimeDene();
      } else if (e.key === "Escape") {
        e.preventDefault();
        ozelModalKapat();
      }
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "Enter") {
      e.preventDefault();
      gonder();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      sil();
      return;
    }
    if (e.key.length === 1) {
      const harf = ingilizceBuyuk(e.key);
      if (harf.length === 1 && INGILIZ_HARFLER.includes(harf)) {
        e.preventDefault();
        ekle(harf);
      }
    }
  });

  document.querySelectorAll(".uzunluk-btn").forEach((btn) => {
    btn.onclick = () => {
      uzunlukSec(parseInt(btn.dataset.uzunluk, 10));
      btn.blur();
    };
  });

  el("btnYeniKelime").onclick = () => {
    yeniKelime();
    el("btnYeniKelime").blur();
  };

  el("btnYineDe").onclick = () => {
    gonder(true);
    el("btnYineDe").blur();
  };

  el("btnOzelKelime").onclick = () => {
    ozelModalAc();
    el("btnOzelKelime").blur();
  };
  el("btnOzelKapat").onclick = () => {
    ozelModalKapat();
    el("btnOzelKapat").blur();
  };
  el("btnOzelIptal").onclick = () => {
    ozelModalKapat();
    el("btnOzelIptal").blur();
  };
  el("btnOzelOyna").onclick = () => {
    ozelKelimeDene();
    el("btnOzelOyna").blur();
  };
  el("btnOzelYineDe").onclick = () => {
    const kelime = ozelBekleyenKelime;
    if (!kelime) return;
    ozelBekleyenKelime = "";
    if (sozluk) sozluk.add(kelime);
    ozelModalKapat();
    ozelKelimeBaslat(kelime);
    el("btnOzelYineDe").blur();
  };
  el("ozelModal").addEventListener("click", (e) => {
    if (e.target === el("ozelModal")) ozelModalKapat();
  });
  el("ozelGirdi").addEventListener("input", () => {
    ozelHataAyarla("");
  });

  document.querySelectorAll("[data-skor-takim]").forEach((btn) => {
    btn.onclick = () => {
      skorDegistir(btn.dataset.skorTakim, parseInt(btn.dataset.skorDelta, 10));
      btn.blur();
    };
  });

  el("btnSkorSifirla").onclick = () => {
    skorSifirla();
    el("btnSkorSifirla").blur();
  };

  el("btnSkorKapat").onclick = () => {
    skorModalKapat();
    el("btnSkorKapat").blur();
  };
  el("btnSkorHayir").onclick = () => {
    skorModalKapat();
    el("btnSkorHayir").blur();
  };
  document.querySelectorAll("[data-skor-ver]").forEach((btn) => {
    btn.onclick = () => {
      skorSonucVer(btn.dataset.skorVer);
      btn.blur();
    };
  });
  el("skorModal").addEventListener("click", (e) => {
    if (e.target === el("skorModal")) skorModalKapat();
  });

  // ---------- Başlat ----------
  skorlariYukle();
  skorEkraniniGuncelle();
  kelimeleriYukle();
  klavyeKur();
  const ilkUzunluk = UZUNLUKLAR.find((u) => kelimeHavuzu[u].length) || 5;
  uzunlukSec(ilkUzunluk);
  klavyeyiOyunDurumunaGoreAyarla();
  if (hedef) mesajAyarla("İngilizce sözlük yükleniyor…", "");
  sozluguYukle();
})();
