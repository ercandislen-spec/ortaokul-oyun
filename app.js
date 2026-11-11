const app = document.getElementById("app");
const breadcrumb = document.getElementById("breadcrumb");

function setBreadcrumb(parts) {
  breadcrumb.innerHTML = parts
    .map((p, i) => {
      const isLast = i === parts.length - 1;
      const content = p.hash ? `<a href="${p.hash}">${p.ad}</a>` : p.ad;
      const sep = isLast ? "" : `<span class="sep">/</span>`;
      return content + sep;
    })
    .join("");
}

function kacir(metin) {
  return String(metin)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Almanca zorluk seçimi ----------
const ALMANCA_ZORLUK_ANAHTARI = "almancaZorluk_v1";
const ALMANCA_ZORLUKLARI = ["kolay", "orta", "zor"];

function almancaZorlukOku() {
  try {
    const kayit = localStorage.getItem(ALMANCA_ZORLUK_ANAHTARI);
    return ALMANCA_ZORLUKLARI.includes(kayit) ? kayit : "kolay";
  } catch (e) {
    return "kolay";
  }
}

function almancaZorlukYaz(zorluk) {
  try {
    localStorage.setItem(ALMANCA_ZORLUK_ANAHTARI, zorluk);
  } catch (e) {
    // depolama kapalıysa seçim sadece bu sayfada geçerli olur
  }
}

function zorlukParametresiEkle(href, zorluk) {
  const temiz = href.replace(/([?&])zorluk=[^&]*/g, "$1").replace(/[?&]$/, "");
  const ayrac = temiz.includes("?") ? "&" : "?";
  return `${temiz}${ayrac}zorluk=${encodeURIComponent(zorluk)}`;
}

function sinifDeposuHTML() {
  return `
    <section class="sinif-yonetim">
      <div class="sy-baslik">
        <h2>👥 Sınıflarım &amp; Öğrenciler</h2>
        <button class="btn-mini btn-ekle" id="btnSinifEkle">+ Sınıf Ekle</button>
      </div>
      <p class="sy-aciklama">Sınıf adını yaz, ardından öğrenci isimlerini tek tek ekle (isim yazıp Enter'a bas). Oyun sayfalarındaki "Öğrenci Seç" butonu aktif sınıftan rastgele öğrenci seçer.</p>
      <div class="sy-liste" id="syListe"></div>
    </section>`;
}

function syKartHTML(s, aktifId) {
  const aktif = s.id === aktifId;
  const cipler = s.ogrenciler.length
    ? s.ogrenciler
        .map(
          (o, i) =>
            `<span class="sy-cip">${kacir(o)}<button type="button" class="sy-cip-sil" data-ogrenci-sil="${s.id}:${i}" title="Öğrenciyi sil">×</button></span>`
        )
        .join("")
    : `<span class="sy-bos">Henüz öğrenci yok — aşağıdaki alana isim yazıp Enter'a bas.</span>`;
  return `
    <div class="sy-kart ${aktif ? "aktif" : ""}">
      <div class="sy-kart-baslik">
        <h3>${kacir(s.ad)} <span class="sy-sayi">${s.ogrenciler.length} öğrenci</span></h3>
        <div class="sy-kart-aksiyon">
          ${
            aktif
              ? `<span class="sy-aktif-etiket">AKTİF</span>`
              : `<button type="button" class="btn-mini" data-aktif="${s.id}">Aktif Yap</button>`
          }
          <button type="button" class="btn-mini btn-sil" data-sil="${s.id}" title="Sınıfı sil">🗑</button>
        </div>
      </div>
      <input type="text" class="sy-input" data-ogrenci-input="${s.id}" placeholder="Öğrenci adı yaz, Enter'a bas" autocomplete="off" />
      <div class="sy-ogrenciler">${cipler}</div>
    </div>`;
}

function syCiz(odakId) {
  const kutu = document.getElementById("syListe");
  if (!kutu || typeof SinifDeposu === "undefined") return;
  const liste = SinifDeposu.liste();
  const aktif = SinifDeposu.aktif();
  if (!liste.length) {
    kutu.innerHTML = `<div class="sy-bos-durum">Henüz sınıf eklenmedi. Yukarıdaki <b>+ Sınıf Ekle</b> ile başla.</div>`;
    return;
  }
  kutu.innerHTML = liste.map((s) => syKartHTML(s, aktif ? aktif.id : null)).join("");
  if (odakId) {
    const inp = kutu.querySelector(`[data-ogrenci-input="${odakId}"]`);
    if (inp) inp.focus();
  }
}

function sinifDeposuBagla() {
  if (typeof SinifDeposu === "undefined") return;
  const ekleBtn = document.getElementById("btnSinifEkle");
  const kutu = document.getElementById("syListe");
  if (!ekleBtn || !kutu) return;

  ekleBtn.onclick = () => {
    const ad = prompt("Sınıfın adını yaz (örn. 5-A):");
    if (ad && ad.trim()) {
      SinifDeposu.ekle(ad.trim());
      syCiz();
    }
  };

  kutu.addEventListener("click", (e) => {
    const aktifBtn = e.target.closest("[data-aktif]");
    if (ekleBtn && aktifBtn) {
      SinifDeposu.aktifYap(aktifBtn.dataset.aktif);
      syCiz();
      return;
    }
    const silBtn = e.target.closest("[data-sil]");
    if (silBtn) {
      if (confirm("Bu sınıf ve öğrencileri silinsin mi?")) {
        SinifDeposu.sil(silBtn.dataset.sil);
        syCiz();
      }
      return;
    }
    const osBtn = e.target.closest("[data-ogrenci-sil]");
    if (osBtn) {
      const parcalar = osBtn.dataset.ogrenciSil.split(":");
      SinifDeposu.ogrenciSil(parcalar[0], parseInt(parcalar[1], 10));
      syCiz();
      return;
    }
  });

  kutu.addEventListener("keydown", (e) => {
    const inp = e.target.closest("[data-ogrenci-input]");
    if (!inp) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const id = inp.dataset.ogrenciInput;
      const ad = inp.value.trim();
      if (ad) {
        SinifDeposu.ogrenciEkle(id, ad);
        inp.value = "";
        syCiz(id);
      }
    }
  });

  syCiz();
}


function renderAnaSayfa() {
  setBreadcrumb([{ ad: "Ana Sayfa" }]);
  document.title = SITE.baslik;
  app.innerHTML = `
    <h1 class="page-title">${SITE.baslik}</h1>
    <p class="page-sub">${SITE.aciklama}</p>
    <section class="ana-oyunlar">
      <div class="bolum-baslik">
        <h2>🎮 Sınıf Seçmeden Oyna</h2>
        <p>Hemen başlayabileceğin tek oyunculu oyunlar.</p>
      </div>
      <div class="grid">
        <a class="card wordle-kart" href="oyunlar/wordle.html">
          <span class="icon">🟩</span>
          <div class="subject-tag">İngilizce · Kelime Oyunu</div>
          <h2>Wordle <span class="yeni-etiket">YENİ</span></h2>
          <p>4, 5 veya 6 harfli İngilizce kelimeyi 6 denemede bul. Yeşil doğru yeri, sarı yanlış yeri, gri olmayan harfi gösterir.</p>
          <span class="badge">Tek oyunculu · Taslak</span>
        </a>
      </div>
    </section>
    <div class="grid">
      ${SINIFLAR.map(
        (s) => `
        <a class="card class-${s.id}" href="#/sinif/${s.id}">
          <span class="icon">${s.ikon}</span>
          <h2>${s.ad}</h2>
          <p>${s.aciklama}</p>
          <span class="badge">${s.dersler.length} ders</span>
        </a>`
      ).join("")}
    </div>
    ${sinifDeposuHTML()}`;
  sinifDeposuBagla();
}

function renderSinif(sinifId) {
  const sinif = getSinif(sinifId);
  if (!sinif) return renderAnaSayfa();

  setBreadcrumb([
    { ad: "Ana Sayfa", hash: "#/" },
    { ad: sinif.ad },
  ]);
  document.title = `${sinif.ad} — Dersler`;
  app.innerHTML = `
    <a class="back-link" href="#/">← Ana Sayfa</a>
    <h1 class="page-title">${sinif.ikon} ${sinif.ad} — Ders Seç</h1>
    <p class="page-sub">Önce bir ders seç, sonra üniteleri gör.</p>
    <div class="grid">
      ${sinif.dersler
        .map(
          (d) => `
        <a class="card class-${sinifId}" href="#/sinif/${sinifId}/${d.slug}">
          <span class="icon">${d.ikon}</span>
          <h2>${d.ad}</h2>
          <span class="badge">${d.uniteler.length} ünite</span>
        </a>`
        )
        .join("")}
    </div>`;
}

function renderDers(sinifId, dersSlug) {
  const sinif = getSinif(sinifId);
  if (!sinif) return renderAnaSayfa();
  const ders = getDers(sinif, dersSlug);
  if (!ders) return renderSinif(sinifId);

  setBreadcrumb([
    { ad: "Ana Sayfa", hash: "#/" },
    { ad: sinif.ad, hash: `#/sinif/${sinifId}` },
    { ad: ders.ad },
  ]);
  document.title = `${ders.ad} — ${sinif.ad} Üniteler`;
  app.innerHTML = `
    <a class="back-link" href="#/sinif/${sinifId}">← ${sinif.ad} Dersleri</a>
    <h1 class="page-title">${ders.ikon} ${ders.ad} Üniteleri</h1>
    <p class="page-sub">${sinif.ad} · İlgilendiğin üniteyi seçerek eğitici oyunlara ulaş.</p>
    <div class="grid">
      ${ders.uniteler
        .map(
          (u) => `
        <a class="card class-${sinifId}" href="#/sinif/${sinifId}/${dersSlug}/unite/${u.no}">
          <span class="unit-number">ÜNİTE ${u.no}</span>
          <h2>${u.ad}</h2>
          <span class="badge">${u.oyunlar.length} oyun</span>
        </a>`
        )
        .join("")}
    </div>`;
}

function renderUnite(sinifId, dersSlug, uniteNo) {
  const sinif = getSinif(sinifId);
  if (!sinif) return renderAnaSayfa();
  const ders = getDers(sinif, dersSlug);
  if (!ders) return renderSinif(sinifId);
  const unite = getUnite(ders, uniteNo);
  if (!unite) return renderDers(sinifId, dersSlug);

  setBreadcrumb([
    { ad: "Ana Sayfa", hash: "#/" },
    { ad: sinif.ad, hash: `#/sinif/${sinifId}` },
    { ad: ders.ad, hash: `#/sinif/${sinifId}/${dersSlug}` },
    { ad: `Ünite ${unite.no}` },
  ]);
  document.title = `Ünite ${unite.no}: ${unite.ad}`;

  const almancaMi = dersSlug === "almanca";
  const zorluk = almancaMi ? almancaZorlukOku() : null;
  const zorlukEki = almancaMi ? `&zorluk=${encodeURIComponent(zorluk)}` : "";

  const futbolURL =
    `oyunlar/futbol.html?sinif=${sinifId}&ders=${encodeURIComponent(dersSlug)}` +
    `&unite=${unite.no}&dersAd=${encodeURIComponent(ders.ad)}&uniteAd=${encodeURIComponent(unite.ad)}` +
    zorlukEki;

  const hizliSecenURL =
    `oyunlar/hizli-secen.html?sinif=${sinifId}&ders=${encodeURIComponent(dersSlug)}` +
    `&unite=${unite.no}&dersAd=${encodeURIComponent(ders.ad)}&uniteAd=${encodeURIComponent(unite.ad)}` +
    zorlukEki;

  const carkifelekURL =
    `oyunlar/carkifelek.html?sinif=${sinifId}&ders=${encodeURIComponent(dersSlug)}` +
    `&unite=${unite.no}&dersAd=${encodeURIComponent(ders.ad)}&uniteAd=${encodeURIComponent(unite.ad)}` +
    zorlukEki;

  const oyunKartHTML = (ikon, tur, ad, aciklama, href) => `
    <div class="card game-card class-${sinifId}">
      <a class="game-link" href="${href}">
        <span class="icon">${ikon}</span>
        <div class="subject-tag">${tur}</div>
        <h2>${ad}</h2>
        <p>${aciklama}</p>
      </a>
      <button type="button" class="siralama-btn" data-siralama>🏆 Sıralama</button>
    </div>`;

  const futbolAciklama = almancaMi
    ? "Ünitede seçtiğin zorlukta sorular çöz. Doğru cevapların arttıkça şutun sertleşir; yanlışta kaleci tutar! Her gol +1, yediğin gol -1 puan."
    : "Pas ve çalım için kolay, şut ve penaltı için zor soru çöz. Doğru cevapların arttıkça şutun sertleşir; yanlışta kaleci tutar! Her gol +1, yediğin gol -1 puan.";

  const zorlukSecimHTML = almancaMi
    ? `
    <section class="zorluk-secim" data-zorluk-secim>
      <span class="zorluk-baslik">Zorluk</span>
      <div class="zorluk-butonlar" role="group" aria-label="Soru zorluğu">
        ${ALMANCA_ZORLUKLARI.map(
          (z) =>
            `<button type="button" class="zorluk-btn${z === zorluk ? " aktif" : ""}" data-zorluk="${z}" aria-pressed="${z === zorluk}">${z[0].toUpperCase() + z.slice(1)}</button>`
        ).join("")}
      </div>
      <p class="zorluk-not">Seçtiğin zorluk bu ünitedeki tüm oyunlarda kullanılır.</p>
    </section>`
    : "";

  const dahiliOyunlar = `
    <div class="grid">
      ${oyunKartHTML(
        "⚽",
        "Spor · Soru-Pas Şut",
        "Futbol Şut Akademisi",
        futbolAciklama,
        futbolURL
      )}
      ${oyunKartHTML(
        "⚡",
        "Rekabet · Hızlı Cevap",
        "Hızlı Seçen Kazanır",
        "Tek tahta üzerinde aynı soru her iki tarafa gösterilir. İlk basanın cevabı doğruysa +1 puan onun olur. Yanlışsa o tur bekler; rakibi de yanlış yaparsa kimse alamaz. Kazananın puanı genel Sıralama Tablosuna eklenir.",
        hizliSecenURL
      )}
      ${oyunKartHTML(
        "🎡",
        "Takım · Çarkıfelek",
        "Çarkıfelek",
        "Öğrencileri rastgele iki takıma böl. Çarkı çevir; İFLAS tüm puanı sıfırlar, SIRA rakibe geçer. Puan karesinde ünite sorusu sorulur: bilirsen puanı kazanırsın, bilemezsen kazanamazsın. Her takıma 16 soru; en çok puanlı takım kazanır.",
        carkifelekURL
      )}
    </div>`;

  const ekOyunlar =
    unite.oyunlar.length > 0
      ? `<div class="grid" style="margin-top:20px">${unite.oyunlar
          .map((o) => oyunKartHTML(o.ikon || "🎮", o.tur || "Oyun", o.ad, o.aciklama || "", o.url || "#"))
          .join("")}</div>`
      : "";

  app.innerHTML = `
    <a class="back-link" href="#/sinif/${sinifId}/${dersSlug}">← ${ders.ad} Üniteleri</a>
    <h1 class="page-title">${unite.ad}</h1>
    <p class="page-sub">Ünite ${unite.no} · ${ders.ad} · ${sinif.ad}</p>
    ${zorlukSecimHTML}
    ${dahiliOyunlar}
    ${ekOyunlar}`;

  const zorlukSecim = app.querySelector("[data-zorluk-secim]");
  if (zorlukSecim) {
    const butonlar = zorlukSecim.querySelectorAll("[data-zorluk]");
    butonlar.forEach((btn) => {
      btn.onclick = () => {
        const secili = btn.dataset.zorluk;
        almancaZorlukYaz(secili);
        butonlar.forEach((b) => {
          const aktif = b === btn;
          b.classList.toggle("aktif", aktif);
          b.setAttribute("aria-pressed", String(aktif));
        });
        app.querySelectorAll(".game-link").forEach((a) => {
          a.setAttribute("href", zorlukParametresiEkle(a.getAttribute("href"), secili));
        });
      };
    });
  }

  app.querySelectorAll("[data-siralama]").forEach((b) => {
    b.onclick = () => {
      if (typeof puanTablosuAc === "function") puanTablosuAc();
    };
  });
}

function router() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);

  if (parts.length === 0) return renderAnaSayfa();
  if (parts[0] !== "sinif") return renderAnaSayfa();

  const sinifId = parseInt(parts[1], 10);
  if (parts.length === 2) return renderSinif(sinifId);

  const dersSlug = parts[2];
  if (parts.length === 3) return renderDers(sinifId, dersSlug);

  if (parts[3] === "unite" && parts.length === 5) {
    return renderUnite(sinifId, dersSlug, parseInt(parts[4], 10));
  }
  return renderSinif(sinifId);
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
