// Puan tablosu: attığın her gol +1, yediğin her gol -1. localStorage'da kalıcı.
(function () {
  var ANAHTAR = "dersPuanTablosu_v1";

  function oku() {
    try {
      var ham = localStorage.getItem(ANAHTAR);
      var veri = ham ? JSON.parse(ham) : {};
      if (!veri || typeof veri !== "object" || Array.isArray(veri)) return {};
      return veri;
    } catch (e) {
      return {};
    }
  }

  function yaz(veri) {
    try {
      localStorage.setItem(ANAHTAR, JSON.stringify(veri));
    } catch (e) {}
  }

  function macKaydet(isim, attigi, yedigi) {
    isim = String(isim || "").trim() || "Misafir";
    attigi = Math.max(0, parseInt(attigi, 10) || 0);
    yedigi = Math.max(0, parseInt(yedigi, 10) || 0);
    var veri = oku();
    var k = veri[isim] || { attigi: 0, yedigi: 0, mac: 0 };
    k.attigi += attigi;
    k.yedigi += yedigi;
    k.mac += 1;
    veri[isim] = k;
    yaz(veri);
    return { isim: isim, attigi: k.attigi, yedigi: k.yedigi, mac: k.mac, puan: k.attigi - k.yedigi };
  }

  function hepsi() {
    var veri = oku();
    return Object.keys(veri)
      .map(function (isim) {
        var r = veri[isim] || {};
        var attigi = r.attigi || 0;
        var yedigi = r.yedigi || 0;
        return { isim: isim, attigi: attigi, yedigi: yedigi, mac: r.mac || 0, puan: attigi - yedigi };
      })
      .sort(function (a, b) {
        return b.puan - a.puan || b.attigi - a.attigi || a.isim.localeCompare(b.isim, "tr");
      });
  }

  function sil(isim) {
    var veri = oku();
    delete veri[isim];
    yaz(veri);
  }

  function temizle() {
    yaz({});
  }

  window.PuanDeposu = { macKaydet: macKaydet, hepsi: hepsi, sil: sil, temizle: temizle };

  function kacir(m) {
    return String(m == null ? "" : m)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tabloGovde() {
    var liste = hepsi();
    if (!liste.length) {
      return '<tr><td colspan="7" class="puan-bos">Henüz maç kaydı yok. Bir oyun oynayın!</td></tr>';
    }
    return liste
      .map(function (r, i) {
        var puanSinif = r.puan > 0 ? "pozitif" : r.puan < 0 ? "negatif" : "notr";
        var puan = (r.puan > 0 ? "+" : "") + r.puan;
        return (
          "<tr>" +
          '<td class="puan-sira">' + (i + 1) + "</td>" +
          '<td class="puan-isim">' + kacir(r.isim) + "</td>" +
          '<td class="puan-deger ' + puanSinif + '">' + puan + "</td>" +
          "<td>" + r.attigi + "</td>" +
          "<td>" + r.yedigi + "</td>" +
          "<td>" + r.mac + "</td>" +
          '<td><button type="button" class="puan-sil-mini" data-puan-sil="' + kacir(r.isim) + '" title="Kaydı sil">🗑</button></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  var modal = null;

  function olustur() {
    if (modal && document.body.contains(modal)) return modal;
    modal = document.createElement("div");
    modal.className = "puan-overlay";
    modal.id = "puanOverlay";
    modal.innerHTML =
      '<div class="puan-kutu" role="dialog" aria-label="Puan Tablosu">' +
      '<div class="puan-kutu-baslik">' +
      "<h3>🏆 Puan Tablosu</h3>" +
      '<button type="button" class="puan-kapat" data-puan-kapat title="Kapat">✕</button>' +
      "</div>" +
      '<p class="puan-not">Her attığın gol <b>+1</b>, yediğin her gol <b>−1</b> puandır. Kayıtlar kalıcıdır.</p>' +
      '<div class="puan-tablo-sar">' +
      '<table class="puan-tablo">' +
      "<thead><tr><th>#</th><th>Öğrenci</th><th>Puan</th><th>Gol</th><th>Yediği</th><th>Maç</th><th></th></tr></thead>" +
      '<tbody id="puanTbody"></tbody>' +
      "</table>" +
      "</div>" +
      '<div class="puan-alt">' +
      '<button type="button" class="puan-btn puan-tehlikeli" data-puan-temizle>🗑 Tüm Tabloyu Sil</button>' +
      "</div>" +
      "</div>";

    modal.addEventListener("click", function (e) {
      var hedef = e.target;
      if (hedef === modal) {
        kapat();
        return;
      }
      if (hedef.closest("[data-puan-kapat]")) {
        kapat();
        return;
      }
      var silBtn = hedef.closest("[data-puan-sil]");
      if (silBtn) {
        var ad = silBtn.getAttribute("data-puan-sil");
        if (confirm(ad + " kaydı silinsin mi?")) {
          sil(ad);
          tazele();
        }
        return;
      }
      if (hedef.closest("[data-puan-temizle]")) {
        if (confirm("Tüm puan tablosu silinsin mi? Bu işlem geri alınamaz.")) {
          temizle();
          tazele();
        }
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  function tazele() {
    var tb = document.getElementById("puanTbody");
    if (tb) tb.innerHTML = tabloGovde();
  }

  function ac() {
    olustur();
    tazele();
    modal.classList.add("acik");
  }

  function kapat() {
    if (modal) modal.classList.remove("acik");
  }

  window.puanTablosuAc = ac;
})();
