(function () {
  "use strict";

  // ---------- Sabitler ----------
  const MAX_HAK = 6;
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

  // ---------- Yardımcılar ----------
  function ingilizceBuyuk(metin) {
    return String(metin || "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
  }

  function mesajAyarla(metin, tur) {
    mesajEl.textContent = metin;
    mesajEl.className = "mesaj" + (tur ? " " + tur : "");
  }

  function salla() {
    tahta.classList.remove("salla");
    void tahta.offsetWidth;
    tahta.classList.add("salla");
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
    klavyeAc();
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
    klavyeAc();
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
    if (bitti || !hedef) return;
    if (mevcut.length >= harfSayisi) return;
    mevcut += harf;
    kutulariYaz();
  }

  function sil() {
    if (bitti || !hedef || !mevcut.length) return;
    mevcut = mevcut.slice(0, -1);
    kutulariYaz();
  }

  function gonder() {
    if (bitti || !hedef) return;

    if (mevcut.length !== harfSayisi) {
      mesajAyarla(`Kelime ${harfSayisi} harf olmalı.`, "uyari");
      salla();
      return;
    }

    const tahmin = mevcut;
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
      return;
    }

    if (deneme >= MAX_HAK) {
      bitti = true;
      mesajAyarla(`😔 Hakkın doldu. Doğru kelime: ${hedef}`, "hata");
      klavyeKilitle();
      return;
    }

    mesajAyarla("", "");
  }

  // ---------- Kendi kelimeni ekle ----------
  function ozelModalAc() {
    el("ozelGirdi").value = "";
    el("ozelHata").textContent = "";
    el("ozelModal").classList.add("acik");
    el("ozelModal").setAttribute("aria-hidden", "false");
    setTimeout(() => el("ozelGirdi").focus(), 50);
  }

  function ozelModalKapat() {
    el("ozelModal").classList.remove("acik");
    el("ozelModal").setAttribute("aria-hidden", "true");
    el("ozelHata").textContent = "";
  }

  function ozelKelimeDene() {
    const ham = el("ozelGirdi").value.trim();
    if (!ham) {
      el("ozelHata").textContent = "Bir kelime yaz.";
      el("ozelGirdi").focus();
      return;
    }
    if (!/^[A-Za-z][A-Za-z' -]*$/.test(ham)) {
      el("ozelHata").textContent = "Yalnızca İngilizce harf kullan (A-Z).";
      el("ozelGirdi").focus();
      return;
    }

    const kelime = ingilizceBuyuk(ham);
    if (kelime.length < 3 || kelime.length > 12) {
      el("ozelHata").textContent = "Kelime 3–12 harf arasında olmalı.";
      el("ozelGirdi").focus();
      return;
    }

    ozelModalKapat();
    ozelKelimeBaslat(kelime);
  }

  // ---------- Olaylar ----------
  document.addEventListener("keydown", (e) => {
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
  el("ozelModal").addEventListener("click", (e) => {
    if (e.target === el("ozelModal")) ozelModalKapat();
  });
  el("ozelGirdi").addEventListener("input", () => {
    el("ozelHata").textContent = "";
  });

  // ---------- Başlat ----------
  kelimeleriYukle();
  klavyeKur();
  const ilkUzunluk = UZUNLUKLAR.find((u) => kelimeHavuzu[u].length) || 5;
  uzunlukSec(ilkUzunluk);
})();
