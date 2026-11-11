// ============================================================
// VERİ DOSYASI — Türkiye Yüzyılı Maarif Modeli (TYMM) üniteleri
// Kaynak: tymm.meb.gov.tr (MEB resmî programları)
// Oyun nesnesi örneği:
//   { ad: "Oyun Adı", tur: "Bilmece", aciklama: "Kısa açıklama", url: "oyunlar/xxx.html" }
// ============================================================

const SITE = {
  baslik: "Ortaokul Oyun Portalı",
  aciklama: "Sınıfını seç, dersini seç, üniteleri keşfet, eğitici oyunlarla öğren!",
};

const SINIFLAR = [
  {
    id: 5,
    ad: "5. Sınıf",
    ikon: "🌱",
    aciklama: "Ortaokula adım attığın yıl! TYMM üniteleriyle eğlenerek öğren.",
    dersler: [
      {
        slug: "turkce",
        ad: "Türkçe",
        ikon: "📖",
        uniteler: [
          { no: 1, ad: "Oyun Dünyası", oyunlar: [] },
          { no: 2, ad: "Atatürk'ü Tanımak", oyunlar: [] },
          { no: 3, ad: "Duygularımı Tanıyorum", oyunlar: [] },
          { no: 4, ad: "Geleneklerimiz", oyunlar: [] },
          { no: 5, ad: "İletişim ve Sosyal İlişkiler", oyunlar: [] },
          { no: 6, ad: "Sağlıklı Yaşıyorum", oyunlar: [] },
        ],
      },
      {
        slug: "matematik",
        ad: "Matematik",
        ikon: "➗",
        uniteler: [
          { no: 1, ad: "Sayılar ve Nicelikler (1)", oyunlar: [] },
          { no: 2, ad: "Sayılar ve Nicelikler (2)", oyunlar: [] },
          { no: 3, ad: "İşlemlerle Cebirsel Düşünme", oyunlar: [] },
          { no: 4, ad: "Geometrik Şekiller", oyunlar: [] },
          { no: 5, ad: "Geometrik Nicelikler", oyunlar: [] },
          { no: 6, ad: "İstatistiksel Araştırma Süreci", oyunlar: [] },
          { no: 7, ad: "Veriden Olasılığa", oyunlar: [] },
        ],
      },
      {
        slug: "fen-bilimleri",
        ad: "Fen Bilimleri",
        ikon: "🔬",
        uniteler: [
          { no: 1, ad: "Gökyüzündeki Komşularımız ve Biz", oyunlar: [] },
          { no: 2, ad: "Kuvveti Tanıyalım", oyunlar: [] },
          { no: 3, ad: "Canlıların Yapısına Yolculuk", oyunlar: [] },
          { no: 4, ad: "Işığın Dünyası", oyunlar: [] },
          { no: 5, ad: "Maddenin Doğası", oyunlar: [] },
          { no: 6, ad: "Yaşamımızdaki Elektrik", oyunlar: [] },
          { no: 7, ad: "Sürdürülebilir Yaşam ve Geri Dönüşüm", oyunlar: [] },
        ],
      },
      {
        slug: "sosyal-bilgiler",
        ad: "Sosyal Bilgiler",
        ikon: "🗺️",
        uniteler: [
          { no: 1, ad: "Birlikte Yaşamak", oyunlar: [] },
          { no: 2, ad: "Evimiz Dünya", oyunlar: [] },
          { no: 3, ad: "Ortak Mirasımız", oyunlar: [] },
          { no: 4, ad: "Yaşayan Demokrasimiz", oyunlar: [] },
          { no: 5, ad: "Hayatımızdaki Ekonomi", oyunlar: [] },
          { no: 6, ad: "Teknoloji ve Sosyal Bilimler", oyunlar: [] },
        ],
      },
      {
        slug: "ingilizce",
        ad: "İngilizce",
        ikon: "🌍",
        uniteler: [
          { no: 1, ad: "School Life", oyunlar: [] },
          { no: 2, ad: "Classroom Life", oyunlar: [] },
          { no: 3, ad: "Personal Life", oyunlar: [] },
          { no: 4, ad: "Family Life", oyunlar: [] },
          { no: 5, ad: "Life in the Neighbourhood & City", oyunlar: [] },
          { no: 6, ad: "Life in the World", oyunlar: [] },
          { no: 7, ad: "Life in Nature", oyunlar: [] },
          { no: 8, ad: "Life in the Universe & Future", oyunlar: [] },
        ],
      },
      {
        slug: "almanca",
        ad: "Almanca",
        ikon: "🇩🇪",
        uniteler: [
          { no: 1, ad: "Schulleben", oyunlar: [] },
          { no: 2, ad: "Klassenleben", oyunlar: [] },
          { no: 3, ad: "Persönliches Leben", oyunlar: [] },
          { no: 4, ad: "Familienleben", oyunlar: [] },
          { no: 5, ad: "Leben in der Nachbarschaft & in der Stadt", oyunlar: [] },
          { no: 6, ad: "Leben in der Welt", oyunlar: [] },
          { no: 7, ad: "Leben in der Natur", oyunlar: [] },
          { no: 8, ad: "Leben im Universum & in der Zukunft", oyunlar: [] },
        ],
      },
      {
        slug: "din-kulturu",
        ad: "Din Kültürü ve Ahlak Bilgisi",
        ikon: "🤲",
        uniteler: [
          { no: 1, ad: "Allah İnancı", oyunlar: [] },
          { no: 2, ad: "Namaz", oyunlar: [] },
          { no: 3, ad: "Kur'an-ı Kerim", oyunlar: [] },
          { no: 4, ad: "Peygamber Kıssaları", oyunlar: [] },
          { no: 5, ad: "Mimarimizde Dinî Motifler", oyunlar: [] },
        ],
      },
    ],
  },
  {
    id: 6,
    ad: "6. Sınıf",
    ikon: "📚",
    aciklama: "TYMM üniteleriyle yeni ufuklar açılıyor.",
    dersler: [
      {
        slug: "turkce",
        ad: "Türkçe",
        ikon: "📖",
        uniteler: [
          { no: 1, ad: "Dilimizin Zenginliği", oyunlar: [] },
          { no: 2, ad: "Bağımsızlık Yolu", oyunlar: [] },
          { no: 3, ad: "Farklı Dünyalar", oyunlar: [] },
          { no: 4, ad: "İletişim ve Sosyal İlişkiler", oyunlar: [] },
          { no: 5, ad: "Bilim ve Teknoloji", oyunlar: [] },
          { no: 6, ad: "Lider Ruhlar", oyunlar: [] },
        ],
      },
      {
        slug: "matematik",
        ad: "Matematik",
        ikon: "➗",
        uniteler: [
          { no: 1, ad: "Sayılar ve Nicelikler (1)", oyunlar: [] },
          { no: 2, ad: "Sayılar ve Nicelikler (2)", oyunlar: [] },
          { no: 3, ad: "İşlemlerle Cebirsel Düşünme ve Değişimler", oyunlar: [] },
          { no: 4, ad: "Geometrik Şekiller", oyunlar: [] },
          { no: 5, ad: "Geometrik Nicelikler", oyunlar: [] },
          { no: 6, ad: "İstatistiksel Araştırma Süreci", oyunlar: [] },
          { no: 7, ad: "Veriden Olasılığa", oyunlar: [] },
        ],
      },
      {
        slug: "fen-bilimleri",
        ad: "Fen Bilimleri",
        ikon: "🔬",
        uniteler: [
          { no: 1, ad: "Güneş Sistemi ve Tutulmalar", oyunlar: [] },
          { no: 2, ad: "Kuvvetin Etkisinde Hareket", oyunlar: [] },
          { no: 3, ad: "Canlılarda Sistemler", oyunlar: [] },
          { no: 4, ad: "Işığın Yansıması ve Renkler", oyunlar: [] },
          { no: 5, ad: "Maddenin Ayırt Edici Özellikleri", oyunlar: [] },
          { no: 6, ad: "Elektriğin İletimi ve Direnç", oyunlar: [] },
          { no: 7, ad: "Sürdürülebilir Yaşam ve Etkileşim", oyunlar: [] },
        ],
      },
      {
        slug: "sosyal-bilgiler",
        ad: "Sosyal Bilgiler",
        ikon: "🗺️",
        uniteler: [
          { no: 1, ad: "Birlikte Yaşamak", oyunlar: [] },
          { no: 2, ad: "Evimiz Dünya", oyunlar: [] },
          { no: 3, ad: "Ortak Mirasımız", oyunlar: [] },
          { no: 4, ad: "Yaşayan Demokrasimiz", oyunlar: [] },
          { no: 5, ad: "Hayatımızdaki Ekonomi", oyunlar: [] },
          { no: 6, ad: "Teknoloji ve Sosyal Bilimler", oyunlar: [] },
        ],
      },
      {
        slug: "ingilizce",
        ad: "İngilizce",
        ikon: "🌍",
        uniteler: [
          { no: 1, ad: "School Life", oyunlar: [] },
          { no: 2, ad: "Classroom Life", oyunlar: [] },
          { no: 3, ad: "Personal Life", oyunlar: [] },
          { no: 4, ad: "Family Life", oyunlar: [] },
          { no: 5, ad: "Life in the Neighbourhood & City", oyunlar: [] },
          { no: 6, ad: "Life in the World & Culture", oyunlar: [] },
          { no: 7, ad: "Life in Nature & Global Problems", oyunlar: [] },
          { no: 8, ad: "Life in the Universe & Future", oyunlar: [] },
        ],
      },
      {
        slug: "almanca",
        ad: "Almanca",
        ikon: "🇩🇪",
        uniteler: [
          { no: 1, ad: "Schulleben", oyunlar: [] },
          { no: 2, ad: "Klassenleben", oyunlar: [] },
          { no: 3, ad: "Persönliches Leben", oyunlar: [] },
          { no: 4, ad: "Familienleben", oyunlar: [] },
          { no: 5, ad: "Leben in der Nachbarschaft & in der Stadt", oyunlar: [] },
          { no: 6, ad: "Leben in der Welt & Kultur", oyunlar: [] },
          { no: 7, ad: "Leben in der Natur & globale Probleme", oyunlar: [] },
          { no: 8, ad: "Leben im Universum & in der Zukunft", oyunlar: [] },
        ],
      },
      {
        slug: "din-kulturu",
        ad: "Din Kültürü ve Ahlak Bilgisi",
        ikon: "🤲",
        uniteler: [
          { no: 1, ad: "Peygamber ve İlahi Kitap İnancı", oyunlar: [] },
          { no: 2, ad: "Ramazan ve Oruç", oyunlar: [] },
          { no: 3, ad: "Ahlaki Davranışlar", oyunlar: [] },
          { no: 4, ad: "Peygamberliğinden Önce Hz. Muhammed", oyunlar: [] },
          { no: 5, ad: "Kültürümüzdeki Dinî Motifler", oyunlar: [] },
        ],
      },
    ],
  },
  {
    id: 7,
    ad: "7. Sınıf",
    ikon: "🔬",
    aciklama: "Bilimsel düşünme ve problem çözme zamanı.",
    dersler: [
      {
        slug: "turkce",
        ad: "Türkçe",
        ikon: "📖",
        uniteler: [
          { no: 1, ad: "Hayat Boyu Gelişim", oyunlar: [] },
          { no: 2, ad: "Bir Hilal Uğruna", oyunlar: [] },
          { no: 3, ad: "İletişim ve Sosyal İlişkiler", oyunlar: [] },
          { no: 4, ad: "Türk Sanatı", oyunlar: [] },
          { no: 5, ad: "Okuma Kültürü", oyunlar: [] },
          { no: 6, ad: "Hak ve Sorumluluklar", oyunlar: [] },
        ],
      },
      {
        slug: "matematik",
        ad: "Matematik",
        ikon: "➗",
        uniteler: [
          { no: 1, ad: "Sayılar ve Nicelikler (1)", oyunlar: [] },
          { no: 2, ad: "Sayılar ve Nicelikler (2)", oyunlar: [] },
          { no: 3, ad: "İşlemlerle Cebirsel Düşünme ve Değişimler", oyunlar: [] },
          { no: 4, ad: "Dönüşüm", oyunlar: [] },
          { no: 5, ad: "Geometrik Nicelikler (1)", oyunlar: [] },
          { no: 6, ad: "Geometrik Nicelikler (2)", oyunlar: [] },
          { no: 7, ad: "Geometrik Şekiller", oyunlar: [] },
          { no: 8, ad: "İstatistiksel Araştırma Süreci", oyunlar: [] },
          { no: 9, ad: "Veriden Olasılığa", oyunlar: [] },
        ],
      },
      {
        slug: "fen-bilimleri",
        ad: "Fen Bilimleri",
        ikon: "🔬",
        uniteler: [
          { no: 1, ad: "Uzay Çağı", oyunlar: [] },
          { no: 2, ad: "Kuvvet ve Enerjiyi Keşfedelim", oyunlar: [] },
          { no: 3, ad: "Vücudumuzdaki Sistemler", oyunlar: [] },
          { no: 4, ad: "Işığın Kırılması ve Mercekler", oyunlar: [] },
          { no: 5, ad: "Maddenin Doğasına Yolculuk", oyunlar: [] },
          { no: 6, ad: "Elektriklenme", oyunlar: [] },
          { no: 7, ad: "Sürdürülebilir Yaşam ve Enerji", oyunlar: [] },
        ],
      },
      {
        slug: "sosyal-bilgiler",
        ad: "Sosyal Bilgiler",
        ikon: "🗺️",
        uniteler: [
          { no: 1, ad: "Birlikte Yaşamak", oyunlar: [] },
          { no: 2, ad: "Evimiz Dünya", oyunlar: [] },
          { no: 3, ad: "Ortak Mirasımız", oyunlar: [] },
          { no: 4, ad: "Yaşayan Demokrasimiz", oyunlar: [] },
          { no: 5, ad: "Hayatımızdaki Ekonomi", oyunlar: [] },
          { no: 6, ad: "Teknoloji ve Sosyal Bilimler", oyunlar: [] },
        ],
      },
      {
        slug: "ingilizce",
        ad: "İngilizce",
        ikon: "🌍",
        uniteler: [
          { no: 1, ad: "School Life & Education", oyunlar: [] },
          { no: 2, ad: "Classroom Life & Learning", oyunlar: [] },
          { no: 3, ad: "Personal Life & Well-Being", oyunlar: [] },
          { no: 4, ad: "Family Life & Home", oyunlar: [] },
          { no: 5, ad: "Life in the Neighbourhood & City", oyunlar: [] },
          { no: 6, ad: "Life in the World & Culture", oyunlar: [] },
          { no: 7, ad: "Life in Nature", oyunlar: [] },
          { no: 8, ad: "Life in the Universe & Future", oyunlar: [] },
        ],
      },
      {
        slug: "almanca",
        ad: "Almanca",
        ikon: "🇩🇪",
        uniteler: [
          { no: 1, ad: "Schulleben & Bildung", oyunlar: [] },
          { no: 2, ad: "Klassenleben & Lernen", oyunlar: [] },
          { no: 3, ad: "Persönliches Leben & Wohlbefinden", oyunlar: [] },
          { no: 4, ad: "Familienleben & Zuhause", oyunlar: [] },
          { no: 5, ad: "Leben in der Nachbarschaft & in der Stadt", oyunlar: [] },
          { no: 6, ad: "Leben in der Welt & Kultur", oyunlar: [] },
          { no: 7, ad: "Leben in der Natur", oyunlar: [] },
          { no: 8, ad: "Leben im Universum & in der Zukunft", oyunlar: [] },
        ],
      },
      {
        slug: "din-kulturu",
        ad: "Din Kültürü ve Ahlak Bilgisi",
        ikon: "🤲",
        uniteler: [
          { no: 1, ad: "Melek ve Ahiret İnancı", oyunlar: [] },
          { no: 2, ad: "Hac, Umre ve Kurban", oyunlar: [] },
          { no: 3, ad: "İslam Düşüncesinde Yorumlar", oyunlar: [] },
          { no: 4, ad: "Peygamber Olarak Hz. Muhammed", oyunlar: [] },
          { no: 5, ad: "Yaşayan Dünya Dinleri", oyunlar: [] },
        ],
      },
    ],
  },
  {
    id: 8,
    ad: "8. Sınıf",
    ikon: "🚀",
    aciklama: "TYMM ve LGS hazırlığı: konuları oyunla pekiştir.",
    dersler: [
      {
        slug: "turkce",
        ad: "Türkçe",
        ikon: "📖",
        uniteler: [
          { no: 1, ad: "İletişim ve Sosyal İlişkiler", oyunlar: [] },
          { no: 2, ad: "Vatan Sevgisi", oyunlar: [] },
          { no: 3, ad: "Doğa ve İnsan", oyunlar: [] },
          { no: 4, ad: "Türk Hikâye Geleneği ve Destanları", oyunlar: [] },
          { no: 5, ad: "Sanat ve Estetik", oyunlar: [] },
          { no: 6, ad: "Akademik Düşünme Dünyası", oyunlar: [] },
        ],
      },
      {
        slug: "matematik",
        ad: "Matematik",
        ikon: "➗",
        uniteler: [
          { no: 1, ad: "Sayılar ve Nicelikler", oyunlar: [] },
          { no: 2, ad: "Cebirsel Düşünme ve Değişimler", oyunlar: [] },
          { no: 3, ad: "Geometrik Şekiller", oyunlar: [] },
          { no: 4, ad: "Geometrik Nicelikler", oyunlar: [] },
          { no: 5, ad: "Dönüşüm", oyunlar: [] },
          { no: 6, ad: "İstatistiksel Araştırma Süreci", oyunlar: [] },
          { no: 7, ad: "Veriden Olasılığa", oyunlar: [] },
        ],
      },
      {
        slug: "fen-bilimleri",
        ad: "Fen Bilimleri",
        ikon: "🔬",
        uniteler: [
          { no: 1, ad: "Mevsimler ve İklim", oyunlar: [] },
          { no: 2, ad: "Yaşamı Kolaylaştıran Kuvvet", oyunlar: [] },
          { no: 3, ad: "Yaşamın Gizemi", oyunlar: [] },
          { no: 4, ad: "Sesin Dünyası", oyunlar: [] },
          { no: 5, ad: "Periyodik Tablo ve Maddenin Etkileşimi", oyunlar: [] },
          { no: 6, ad: "Elektriğin Yolculuğu", oyunlar: [] },
          { no: 7, ad: "Sürdürülebilir Yaşam ve Madde Döngüleri", oyunlar: [] },
        ],
      },
      {
        slug: "inkilap-tarihi",
        ad: "T.C. İnkılap Tarihi ve Atatürkçülük",
        ikon: "🇹🇷",
        uniteler: [
          { no: 1, ad: "Mustafa Kemal'in Hayatı", oyunlar: [] },
          { no: 2, ad: "Birinci Dünya Savaşı", oyunlar: [] },
          { no: 3, ad: "Millî Mücadele", oyunlar: [] },
          { no: 4, ad: "Türkiye Cumhuriyeti'nin Kuruluşu ve İnkılaplar", oyunlar: [] },
        ],
      },
      {
        slug: "ingilizce",
        ad: "İngilizce",
        ikon: "🌍",
        uniteler: [
          { no: 1, ad: "School Life & Education", oyunlar: [] },
          { no: 2, ad: "Classroom Life & Learning", oyunlar: [] },
          { no: 3, ad: "Personal Life & Well-Being", oyunlar: [] },
          { no: 4, ad: "Family Life & Home", oyunlar: [] },
          { no: 5, ad: "Life in the Neighbourhood & City", oyunlar: [] },
          { no: 6, ad: "Life in the World & Culture", oyunlar: [] },
          { no: 7, ad: "Life in Nature & Global Problems", oyunlar: [] },
          { no: 8, ad: "Life in the Universe & Future", oyunlar: [] },
        ],
      },
      {
        slug: "almanca",
        ad: "Almanca",
        ikon: "🇩🇪",
        uniteler: [
          { no: 1, ad: "Schulleben & Bildung", oyunlar: [] },
          { no: 2, ad: "Klassenleben & Lernen", oyunlar: [] },
          { no: 3, ad: "Persönliches Leben & Wohlbefinden", oyunlar: [] },
          { no: 4, ad: "Familienleben & Zuhause", oyunlar: [] },
          { no: 5, ad: "Leben in der Nachbarschaft & in der Stadt", oyunlar: [] },
          { no: 6, ad: "Leben in der Welt & Kultur", oyunlar: [] },
          { no: 7, ad: "Leben in der Natur & globale Probleme", oyunlar: [] },
          { no: 8, ad: "Leben im Universum & in der Zukunft", oyunlar: [] },
        ],
      },
      {
        slug: "din-kulturu",
        ad: "Din Kültürü ve Ahlak Bilgisi",
        ikon: "🤲",
        uniteler: [
          { no: 1, ad: "Kader İnancı", oyunlar: [] },
          { no: 2, ad: "Zekât ve Sadaka", oyunlar: [] },
          { no: 3, ad: "Din ve Sosyal Hayat", oyunlar: [] },
          { no: 4, ad: "Kur'an ve İnsan", oyunlar: [] },
          { no: 5, ad: "Müslümanların Bilim ve Kültüre Katkısı", oyunlar: [] },
        ],
      },
    ],
  },
];

function getSinif(id) {
  return SINIFLAR.find((s) => s.id === id);
}

function getDers(sinif, slug) {
  return sinif?.dersler.find((d) => d.slug === slug);
}

function getUnite(ders, no) {
  return ders?.uniteler.find((u) => u.no === no);
}
