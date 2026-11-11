// Sınıf ve öğrenci deposu (localStorage).
// index.html ve oyunlar tarafından ortak kullanılır.
(function () {
  var ANAHTAR = "dersSiniflar_v1";

  function bosVeri() {
    return { siniflar: [], aktifId: null };
  }

  function oku() {
    try {
      var ham = localStorage.getItem(ANAHTAR);
      if (!ham) return bosVeri();
      var veri = JSON.parse(ham);
      if (!veri || !Array.isArray(veri.siniflar)) return bosVeri();
      veri.siniflar.forEach(function (s) {
        if (!Array.isArray(s.ogrenciler)) s.ogrenciler = [];
      });
      return veri;
    } catch (e) {
      return bosVeri();
    }
  }

  function yaz(veri) {
    try {
      localStorage.setItem(ANAHTAR, JSON.stringify(veri));
    } catch (e) {}
    return veri;
  }

  var sayac = 0;
  function yeniId() {
    sayac++;
    return "s" + Date.now().toString(36) + "-" + sayac;
  }

  function liste() {
    return oku().siniflar;
  }

  function getir(id) {
    return (
      oku().siniflar.filter(function (s) {
        return s.id === id;
      })[0] || null
    );
  }

  function ekle(ad) {
    var temiz = String(ad || "").trim();
    if (!temiz) return null;
    var veri = oku();
    var sinif = { id: yeniId(), ad: temiz, ogrenciler: [], sonIndex: -1 };
    veri.siniflar.push(sinif);
    if (!veri.aktifId) veri.aktifId = sinif.id;
    yaz(veri);
    return sinif;
  }

  function sil(id) {
    var veri = oku();
    veri.siniflar = veri.siniflar.filter(function (s) {
      return s.id !== id;
    });
    if (veri.aktifId === id) {
      veri.aktifId = veri.siniflar[0] ? veri.siniflar[0].id : null;
    }
    yaz(veri);
  }

  function aktifYap(id) {
    var veri = oku();
    var varMi = veri.siniflar.some(function (s) {
      return s.id === id;
    });
    if (varMi) {
      veri.aktifId = id;
      yaz(veri);
    }
  }

  function aktif() {
    var veri = oku();
    var s = veri.siniflar.filter(function (x) {
      return x.id === veri.aktifId;
    })[0];
    return s || veri.siniflar[0] || null;
  }

  function ogrenciEkle(id, ad) {
    var temiz = String(ad || "").trim();
    if (!temiz) return;
    var veri = oku();
    var sinif = veri.siniflar.filter(function (s) {
      return s.id === id;
    })[0];
    if (!sinif) return;
    if (sinif.ogrenciler.indexOf(temiz) === -1) {
      sinif.ogrenciler.push(temiz);
      yaz(veri);
    }
  }

  function ogrenciSil(id, index) {
    var veri = oku();
    var sinif = veri.siniflar.filter(function (s) {
      return s.id === id;
    })[0];
    if (sinif) {
      sinif.ogrenciler.splice(index, 1);
      yaz(veri);
    }
  }

  // Rastgele öğrenci; mümkünse bir öncekini tekrar etmez.
  function rastgeleOgrenci(id) {
    var veri = oku();
    var sinif = id
      ? veri.siniflar.filter(function (s) {
          return s.id === id;
        })[0]
      : veri.siniflar.filter(function (s) {
          return s.id === veri.aktifId;
        })[0] || veri.siniflar[0];
    if (!sinif || !sinif.ogrenciler.length) return null;
    var n = sinif.ogrenciler.length;
    var idx = Math.floor(Math.random() * n);
    if (n > 1 && idx === sinif.sonIndex) {
      idx = (idx + 1 + Math.floor(Math.random() * (n - 1))) % n;
    }
    sinif.sonIndex = idx;
    yaz(veri);
    return sinif.ogrenciler[idx];
  }

  window.SinifDeposu = {
    liste: liste,
    getir: getir,
    ekle: ekle,
    sil: sil,
    aktifYap: aktifYap,
    aktif: aktif,
    ogrenciEkle: ogrenciEkle,
    ogrenciSil: ogrenciSil,
    rastgeleOgrenci: rastgeleOgrenci
  };
})();
