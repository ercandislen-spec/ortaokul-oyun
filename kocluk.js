(function () {
  "use strict";

  // Sınav sonuçları sınıf bazında saklanır: { "5": [ { id, ad, tarih, notlar: { turkce: 85, ... } } ] }
  const ANAHTAR = "koclukSinavlar_v1";
  const SINIFLAR_REF = typeof SINIFLAR !== "undefined" ? SINIFLAR : [];

  function anahtar(sinifId) {
    return String(sinifId);
  }

  function departmanOku() {
    try {
      const ham = localStorage.getItem(ANAHTAR);
      if (!ham) return {};
      const veri = JSON.parse(ham);
      return veri && typeof veri === "object" && !Array.isArray(veri) ? veri : {};
    } catch (hata) {
      return {};
    }
  }

  function departmanYaz(veri) {
    try {
      localStorage.setItem(ANAHTAR, JSON.stringify(veri));
    } catch (hata) {
      /* Depolama kapalıysa veri yalnızca bu oturumda tutulur. */
    }
  }

  function sinifDersleri(sinifId) {
    const sinif = SINIFLAR_REF.find((s) => String(s.id) === anahtar(sinifId));
    return sinif ? sinif.dersler || [] : [];
  }

  function sinavlariAl(sinifId) {
    const veri = departmanOku();
    const list = veri[anahtar(sinifId)];
    return Array.isArray(list) ? list : [];
  }

  function sinavlariYaz(sinifId, list) {
    const veri = departmanOku();
    veri[anahtar(sinifId)] = list;
    departmanYaz(veri);
  }

  function yeniId() {
    return "snv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function sayi(value) {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function ekle(sinifId, sinav) {
    if (!sinav || typeof sinav !== "object") return null;
    const notlar = {};
    let dolu = 0;

    sinifDersleri(sinifId).forEach((ders) => {
      const n = sayi(sinav.notlar ? sinav.notlar[ders.slug] : null);
      if (n !== null && n >= 0 && n <= 100) {
        notlar[ders.slug] = Math.round(n * 10) / 10;
        dolu++;
      }
    });
    if (!dolu) return null;

    const list = sinavlariAl(sinifId);
    const kayit = {
      id: yeniId(),
      ad: String(sinav.ad || "").trim().slice(0, 60) || `Sınav ${list.length + 1}`,
      tarih: String(sinav.tarih || "").slice(0, 10),
      notlar: notlar,
    };
    list.push(kayit);
    sinavlariYaz(sinifId, list);
    return kayit;
  }

  function sil(sinifId, id) {
    const list = sinavlariAl(sinifId).filter((s) => String(s.id) !== String(id));
    sinavlariYaz(sinifId, list);
    return list;
  }

  function temizle(sinifId) {
    sinavlariYaz(sinifId, []);
  }

  function sinavOrtalamesi(sinav) {
    const degerler = Object.keys(sinav.notlar || {})
      .map((k) => sayi(sinav.notlar[k]))
      .filter((n) => n !== null);
    if (!degerler.length) return null;
    return degerler.reduce((a, b) => a + b, 0) / degerler.length;
  }

  function genelOrtalama(sinifId) {
    const degerler = [];
    sinavlariAl(sinifId).forEach((sinav) => {
      Object.keys(sinav.notlar || {}).forEach((k) => {
        const n = sayi(sinav.notlar[k]);
        if (n !== null) degerler.push(n);
      });
    });
    if (!degerler.length) return null;
    return degerler.reduce((a, b) => a + b, 0) / degerler.length;
  }

  function dersOrtalamalari(sinifId) {
    const sinavlar = sinavlariAl(sinifId);
    return sinifDersleri(sinifId)
      .map((ders) => {
        const degerler = sinavlar
          .map((s) => sayi(s.notlar ? s.notlar[ders.slug] : null))
          .filter((n) => n !== null);
        return {
          slug: ders.slug,
          ad: ders.ad,
          ikon: ders.ikon || "📘",
          ortalama: degerler.length ? degerler.reduce((a, b) => a + b, 0) / degerler.length : null,
          sayi: degerler.length,
        };
      })
      .filter((d) => d.ortalama !== null);
  }

  function uniteler(sinifId, dersSlug) {
    const ders = sinifDersleri(sinifId).find((d) => d.slug === dersSlug);
    if (!ders || !ders.uniteler || !ders.uniteler.length) return [];
    return ders.uniteler.slice(0, 2).map((u) => u.ad);
  }

  function seviye(ortalama) {
    if (ortalama >= 85) return { anahtar: "guclu", ad: "Güçlü", renk: "#22c55e" };
    if (ortalama >= 70) return { anahtar: "iyi", ad: "İyi", renk: "#38bdf8" };
    if (ortalama >= 50) return { anahtar: "orta", ad: "Orta", renk: "#eab308" };
    return { anahtar: "risk", ad: "Destek gerekli", renk: "#ef4444" };
  }

  function genelMesaj(ortalama) {
    if (ortalama === null) return "Henüz sınav girilmedi. İlk sınavını eklediğinde burada genel değerlendirme ve çalışma önerileri görünecek.";
    if (ortalama >= 85) return "Genel ortalaman çok iyi. Güçlü yönlerini koru; en düşük dersini de 85'in üzerine çıkarmayı hedefle.";
    if (ortalama >= 70) return "Genel ortalaman iyi. En düşük iki derse haftada 2 kısa tekrar seansı ekleyerek 85 hedefini kovala.";
    if (ortalama >= 50) return "Genel ortalaman orta. Önce en düşük üç derse odaklan; her gün 15 dakikalık tekrar ve 10 soruluk mini test yap.";
    return "Genel ortalaman düşük. Temel kavramları yeniden çalışmak için öğretmeninden destek al; günde 10 soruyla başlayıp sayıyı artır.";
  }

  function ozeriMetin(ders, konular) {
    const konu = konular.length ? `${konular.join(" ve ")} ünitelerini ` : "";
    if (ders.ortalama < 50) {
      return `Öncelikli ders: ${ders.ad}. ${konu}temelden yeniden çalış; 10'ar soruluk kısa testler çöz ve yanlışlarının nedenini deftere yaz.`;
    }
    if (ders.ortalama < 70) {
      return `${ders.ad} için ${konu}konularında 20 soru çöz; yanlış yaptığın soruları tekrar çalış. Hedefin 70.`;
    }
    if (ders.ortalama < 85) {
      return `${ders.ad} iyi gidiyor. ${konu}karışık sorularla pekiştir, 1 sayfa özet çıkar. Hedefin 85.`;
    }
    return `${ders.ad} güçlü yönün. ${konu}zorlayıcı sorulara geç; öğrendiklerini arkadaşına anlatarak pekiştir.`;
  }

  function oneriler(sinifId) {
    const genel = genelOrtalama(sinifId);
    const dersler = dersOrtalamalari(sinifId).sort((a, b) => a.ortalama - b.ortalama);
    const maddeler = dersler.map((ders) => {
      const sev = seviye(ders.ortalama);
      return {
        slug: ders.slug,
        ad: ders.ad,
        ikon: ders.ikon,
        ortalama: ders.ortalama,
        seviye: sev,
        metin: ozeriMetin(ders, uniteler(sinifId, ders.slug)),
      };
    });
    return { genel: genel, genelMesaj: genelMesaj(genel), maddeler: maddeler };
  }

  window.Kocluk = {
    ANAHTAR: ANAHTAR,
    dersler: sinifDersleri,
    sinavlariAl: sinavlariAl,
    ekle: ekle,
    sil: sil,
    temizle: temizle,
    sinavOrtalamesi: sinavOrtalamesi,
    genelOrtalama: genelOrtalama,
    dersOrtalamalari: dersOrtalamalari,
    seviye: seviye,
    oneriler: oneriler,
  };
})();
