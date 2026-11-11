(function () {
  const qs = new URLSearchParams(location.search);
  const SINIF_ID = parseInt(qs.get("sinif") || "0", 10);
  const DERS_SLUG = qs.get("ders") || "";
  const UNITE_NO = parseInt(qs.get("unite") || "0", 10);
  const DERS_AD = qs.get("dersAd") || "Ders";

  // Almanca için ünite sayfasından gelen zorluk seçimi (kolay | orta | zor)
  const ZORLUK_SIRA = ["kolay", "orta", "zor"];
  const zorlukParam = (qs.get("zorluk") || "").toLowerCase();
  const SECILI_ZORLUK = ZORLUK_SIRA.includes(zorlukParam) ? zorlukParam : null;

  const el = (id) => document.getElementById(id);

  const OTOMATIK_TUR_MS = 1000;

  const state = {
    o1: null,
    o2: null,
    puan1: 0,
    puan2: 0,
    tur: 0,
    soru: null,
    cevaplayan: new Set(), // "o1" | "o2" - cevap veren taraflar
    elenen: new Set(),     // yanlış cevaplayanlar
    dogruYapan: new Set(), // doğru cevaplayanlar
    bitti: false,          // bu tur kapandı mı
    kazananSonTur: null,   // "o1" | "o2" | null
    kullanilan: [],
    ekran: "giris",
    otomatikZamanlayici: null,
  };

  function otomatikTuruIptal() {
    if (state.otomatikZamanlayici) {
      clearTimeout(state.otomatikZamanlayici);
      state.otomatikZamanlayici = null;
    }
  }

  // ---------- Sınıf / öğrenci ----------
  function aktifSinif() {
    if (typeof SinifDeposu === "undefined") return null;
    return SinifDeposu.aktif();
  }

  function ogrenciBilgiCiz() {
    const s = aktifSinif();
    el("ogrenciSinif").textContent = s
      ? `${s.ad} · ${s.ogrenciler.length} öğrenci`
      : "Sınıf yok (ana sayfadan ekle)";
    el("dersBilgi").textContent = `${DERS_AD} · Ünite ${UNITE_NO}`;
    document.title = `Hızlı Seçen Kazanır · ${DERS_AD} Ünite ${UNITE_NO}`;
  }

  // ---------- Ekran geçişleri ----------
  function ekranGoster(hangi) {
    state.ekran = hangi;
    if (hangi !== "oyun") otomatikTuruIptal();
    el("ekranGiris").hidden = hangi !== "giris";
    el("ekranOyun").hidden = hangi !== "oyun";
  }

  function baslatButonuGuncelle() {
    const hazir = !!(state.o1 && state.o2);
    el("btnOyunuBaslat").disabled = !hazir;
    el("baslatNot").textContent = hazir
      ? `${state.o1}  vs  ${state.o2}`
      : "Başlamak için iki öğrenci seç";
  }

  // ---------- Görünüm ----------
  function guncelleKartlar() {
    el("isimO1").textContent = state.o1 || "Seçilmemiş";
    el("isimO2").textContent = state.o2 || "Seçilmemiş";
    el("puanO1").textContent = state.puan1;
    el("puanO2").textContent = state.puan2;
    el("durumO1").textContent = state.o1 ? "Hazır" : "Seçilmedi";
    el("durumO2").textContent = state.o2 ? "Hazır" : "Seçilmedi";

    const lbl1 = state.o1 || "Sol";
    const lbl2 = state.o2 || "Sağ";
    el("lblO1").textContent = lbl1;
    el("lblO2").textContent = lbl2;
    el("chipO1").textContent = `${lbl1}: ${state.puan1}`;
    el("chipO2").textContent = `${lbl2}: ${state.puan2}`;
    el("bolumIsim1").textContent = lbl1;
    el("bolumIsim2").textContent = lbl2;
    el("turSayaci").textContent = `Tur ${state.tur}`;

    const max = Math.max(1, state.puan1 + state.puan2);
    const b1 = el("barO1"), b2 = el("barO2");
    b1.style.width = (state.puan1 / max) * 100 + "%";
    b2.style.width = (state.puan2 / max) * 100 + "%";
    b1.classList.toggle("ileri", state.puan1 > 0);
    b2.classList.toggle("ileri", state.puan2 > 0);

    if (state.kazananSonTur) {
      el("adv1").textContent = state.kazananSonTur === "o1" ? lbl1 : "—";
      el("adv2").textContent = state.kazananSonTur === "o2" ? lbl2 : "—";
      el("sonucTur").textContent =
        `Son Tur: ${state.kazananSonTur === "o1" ? lbl1 : lbl2} kazandı (+1)`;
    } else if (state.bitti) {
      el("adv1").textContent = "—";
      el("adv2").textContent = "—";
      el("sonucTur").textContent = "Berabere — kimse puan alamadı";
    } else {
      el("adv1").textContent = "—";
      el("adv2").textContent = "—";
      el("sonucTur").textContent = state.tur ? "Cevap bekleniyor..." : "Tur bekleniyor";
    }
    baslatButonuGuncelle();
  }

  // ---------- Soru ----------
  function yeniSoru() {
    if (typeof soruUret !== "function") return null;
    const zorluk = SECILI_ZORLUK || (state.tur % 2 === 1 ? "kolay" : "zor");
    const denenecek = [zorluk, ...ZORLUK_SIRA.filter((z) => z !== zorluk)];
    let obj = null;
    let kullanilanZorluk = zorluk;
    for (const z of denenecek) {
      obj = soruUret(SINIF_ID, DERS_SLUG, UNITE_NO, z, state.kullanilan.slice(-40));
      if (obj && obj.s) {
        kullanilanZorluk = z;
        break;
      }
    }
    if (!obj || !obj.s) {
      for (const z of denenecek) {
        obj = soruUret(SINIF_ID, DERS_SLUG, UNITE_NO, z, []);
        if (obj && obj.s) {
          kullanilanZorluk = z;
          break;
        }
      }
    }
    if (!obj || !obj.s) return null;
    state.kullanilan.push(obj.s);
    return {
      metin: obj.s,
      dogru: obj.secenekler[obj.dogruIdx],
      sec: obj.secenekler.slice(),
      zorluk: kullanilanZorluk,
    };
  }

  function soruCiz(kontId, kim) {
    const kont = el(kontId);
    kont.innerHTML = "";
    state.soru.sec.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "secenek";
      btn.textContent = opt;
      btn.onclick = () => cevapla(kim, opt, btn);
      kont.appendChild(btn);
    });
  }

  function bolumDurumu() {
    const s1 = el("durumSol"), s2 = el("durumSag");
    const bs = el("bolumSol"), bg = el("bolumSag");
    bs.classList.remove("aktif", "kilitli-dogru", "kilitli-yanlis", "beklemede");
    bg.classList.remove("aktif", "kilitli-dogru", "kilitli-yanlis", "beklemede");

    if (state.bitti) {
      [
        { taraf: "o1", bolum: bs, durum: s1 },
        { taraf: "o2", bolum: bg, durum: s2 },
      ].forEach(({ taraf, bolum, durum }) => {
        if (state.kazananSonTur === taraf) {
          bolum.classList.add("kilitli-dogru");
          durum.textContent = "Kazandı! +1";
        } else if (state.dogruYapan.has(taraf)) {
          bolum.classList.add("kilitli-dogru");
          durum.textContent = "Doğru — geç kaldı";
        } else if (state.elenen.has(taraf)) {
          bolum.classList.add("kilitli-yanlis");
          durum.textContent = "Yanlış";
        } else {
          bolum.classList.add("beklemede");
          durum.textContent = "—";
        }
      });
      return;
    }

    if (!state.tur) {
      bs.classList.add("aktif");
      bg.classList.add("aktif");
      s1.textContent = "Hazır";
      s2.textContent = "Hazır";
      return;
    }

    // Tur devam ediyor: yanlış yapan taraf bekler, vermeyen taraf cevaplar.
    // Doğru cevap gelirse tur zaten hemen kapanır; burada yalnızca yanlış kalan
    // tarafın rakibini beklediği durum gösterilir.
    if (state.cevaplayan.has("o1")) {
      bs.classList.add("beklemede");
      s1.textContent = "Yanlış — rakibi bekliyor";
    } else {
      bs.classList.add("aktif");
      s1.textContent = "CEVAP VER";
    }
    if (state.cevaplayan.has("o2")) {
      bg.classList.add("beklemede");
      s2.textContent = "Yanlış — rakibi bekliyor";
    } else {
      bg.classList.add("aktif");
      s2.textContent = "CEVAP VER";
    }
  }

  function baslatYeniTur() {
    if (!(state.o1 && state.o2)) return;
    otomatikTuruIptal();
    state.tur++;
    state.soru = yeniSoru();
    state.cevaplayan = new Set();
    state.elenen = new Set();
    state.dogruYapan = new Set();
    state.bitti = false;
    state.kazananSonTur = null;

    el("turNo").textContent = `Tur ${state.tur}`;
    el("zorluk").textContent = state.soru ? state.soru.zorluk.toUpperCase() : "—";
    el("soruMetni").textContent = state.soru ? state.soru.metin : "Bu ders/ünite için soru bulunamadı";

    if (!state.soru) {
      el("seceneklerSol").innerHTML = "";
      el("seceneklerSag").innerHTML = "";
      state.bitti = true;
      bolumDurumu();
      guncelleKartlar();
      return;
    }
    soruCiz("seceneklerSol", "o1");
    soruCiz("seceneklerSag", "o2");
    bolumDurumu();
    guncelleKartlar();
  }

  // ---------- Cevap ----------
  function cevapla(kim, metin, btn) {
    if (!state.soru || state.bitti || state.cevaplayan.has(kim)) return;

    const dogru = metin === state.soru.dogru;
    state.cevaplayan.add(kim);

    // Seçimi işaretle. Doğru cevapta tur hemen kapanır; yanlış cevapta
    // doğru/yanlış rengi rakibin cevabı gelene kadar gizli kalır.
    btn.classList.add("secildi");
    btn.dataset.secim = "1";

    // Cevap veren tarafın şıklarını kilitle (tekrar basmasın)
    const kont = el(kim === "o1" ? "seceneklerSol" : "seceneklerSag");
    Array.from(kont.querySelectorAll(".secenek")).forEach((b) => (b.disabled = true));

    if (dogru) {
      // İlk doğru cevap: rakibini beklemeden turu bitir ve yeni soruya geç.
      state.dogruYapan.add(kim);
      if (!state.kazananSonTur) state.kazananSonTur = kim;
      turuBitir();
      return;
    }

    state.elenen.add(kim);

    // Yanlış cevap: rakip de cevapladıysa tur kapanır, aksi halde rakibi bekle.
    if (state.cevaplayan.size >= 2) {
      turuBitir();
    } else {
      bolumDurumu();
      guncelleKartlar();
    }
  }

  // Tur kapanınca doğru cevap yeşil olur, kazanan puan alır ve otomatik yeni tura geçilir.
  function turuBitir() {
    if (state.bitti) return;
    state.bitti = true;

    if (state.kazananSonTur) {
      if (state.kazananSonTur === "o1") state.puan1++;
      else state.puan2++;
      puanKaydet(state.kazananSonTur);
    }

    // İki panelde de doğru şıkkı yeşil göster
    [el("seceneklerSol"), el("seceneklerSag")].forEach((k) => {
      Array.from(k.querySelectorAll(".secenek")).forEach((b) => {
        if (b.textContent === state.soru.dogru) b.classList.add("dogru");
        else if (b.dataset.secim === "1") b.classList.add("yanlis");
        b.disabled = true;
      });
    });

    bolumDurumu();
    guncelleKartlar();

    // Yeni tur butonuna gerek yok: kısa bir gösterimden sonra kendiliğinden geç.
    otomatikTuruIptal();
    state.otomatikZamanlayici = setTimeout(() => {
      state.otomatikZamanlayici = null;
      if (state.ekran === "oyun") baslatYeniTur();
    }, OTOMATIK_TUR_MS);
  }

  function puanKaydet(kazananKim) {
    if (typeof PuanDeposu === "undefined") return;
    const kazanan = kazananKim === "o1" ? state.o1 : state.o2;
    const kaybeden = kazananKim === "o1" ? state.o2 : state.o1;
    if (kazanan) PuanDeposu.macKaydet(kazanan, 1, 0);
    if (kaybeden) PuanDeposu.macKaydet(kaybeden, 0, 1);
  }

  // ---------- Oyuncu seçimi ----------
  function rastgeleIki() {
    const s = aktifSinif();
    if (!s || s.ogrenciler.length < 2) {
      el("ogrenciIsim").textContent = "Yeterli öğrenci yok";
      el("ogrenciAlt").textContent = "En az 2 öğrenci ekle (Ana Sayfa > Sınıflarım)";
      el("ogrenciModal").classList.add("acik");
      return;
    }
    let a, b;
    do {
      a = SinifDeposu.rastgeleOgrenci(s.id);
      b = SinifDeposu.rastgeleOgrenci(s.id);
    } while (a === b);
    state.o1 = a;
    state.o2 = b;
    state.puan1 = 0;
    state.puan2 = 0;
    guncelleKartlar();
  }

  function sifirlaSkor() {
    otomatikTuruIptal();
    state.puan1 = 0;
    state.puan2 = 0;
    state.tur = 0;
    state.kazananSonTur = null;
    state.bitti = false;
    state.cevaplayan = new Set();
    state.elenen = new Set();
    state.dogruYapan = new Set();
    guncelleKartlar();
  }

  // ---------- Bağlayıcılar ----------
  el("btnRastgeleIkili").onclick = rastgeleIki;
  el("btnSifirla").onclick = sifirlaSkor;
  el("btnSiralama").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };
  el("btnSiralamaOyun").onclick = () => { if (typeof puanTablosuAc === "function") puanTablosuAc(); };

  el("btnOyunuBaslat").onclick = () => {
    if (!(state.o1 && state.o2)) return;
    ekranGoster("oyun");
    state.tur = 0;
    baslatYeniTur();
  };

  el("btnGeriGiris").onclick = () => {
    otomatikTuruIptal();
    ekranGoster("giris");
    guncelleKartlar();
  };

  // Öğrenci seçim penceresi
  let secilenTaraf = "o1";
  el("btnO1Sec").onclick = () => { secilenTaraf = "o1"; acOgrenciPenceresi(); };
  el("btnO2Sec").onclick = () => { secilenTaraf = "o2"; acOgrenciPenceresi(); };

  function acOgrenciPenceresi() {
    const s = aktifSinif();
    if (!s || !s.ogrenciler.length) {
      el("ogrenciIsim").textContent = "Öğrenci bulunamadı";
      el("ogrenciAlt").textContent = "Ana sayfada sınıf ve öğrenci ekle";
    } else {
      el("ogrenciIsim").textContent = state[secilenTaraf] || "—";
      el("ogrenciAlt").textContent = "Rastgele seç butonuna bas";
    }
    el("ogrenciModal").classList.add("acik");
  }

  el("btnOgrenciSec2").onclick = () => {
    const s = aktifSinif();
    if (!s || !s.ogrenciler.length) {
      el("ogrenciIsim").textContent = "Öğrenci bulunamadı";
      el("ogrenciAlt").textContent = "Ana sayfadan sınıf/öğrenci ekle";
      return;
    }
    const o = SinifDeposu.rastgeleOgrenci(s.id);
    state[secilenTaraf] = o;
    el("ogrenciIsim").textContent = o;
    el("ogrenciAlt").textContent = "Seçildi ✓";
    guncelleKartlar();
  };

  const modalKapat = () => el("ogrenciModal").classList.remove("acik");
  el("btnOgrenciKapat").onclick = modalKapat;
  el("btnOgrenciKapat2").onclick = modalKapat;

  // ---------- Başlat ----------
  ogrenciBilgiCiz();
  ekranGoster("giris");
  guncelleKartlar();
  baslatButonuGuncelle();
})();
