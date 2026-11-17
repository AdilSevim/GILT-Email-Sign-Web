# GİLT İmza Stüdyosu

GİLT üyeleri için bireysel ve kulüp e-posta imzası oluşturucusu. Statik HTML, CSS ve JavaScript ile çalışır. Giriş, paket kurulumu ve sunucu tarafında form işleme gerekmez.

- `index.html` imza stüdyosu
- `kilavuz.html` stüdyo ekran görüntüleriyle Gmail ve Outlook kullanım kılavuzu
- `app.js` e-posta için satır içi stillerle imza üretimi, kopyalama ve HTML indirme
- `style.css` stüdyo ve kılavuz stilleri

İki imza türü de özgün GİLT yazılı logosunu kullanır. İmzalardaki ortak e-posta ve sosyal bağlantılar, `index.html` dosyasının altındaki iletişim bölümünden alınır. [Kulüp e-postası](https://www.khas.edu.tr/ogrenci-kulupleri/), [sosyal hesaplar](https://linktr.ee/khas_gilt) ve [Öğrenci Dekanlığı telefonu](https://www.khas.edu.tr/odek/) ilgili kurum sayfalarında listelenir.

## Yerel önizleme

```sh
python3 -m http.server 8000
```

Tarayıcıda [localhost:8000](http://localhost:8000) adresini aç.

## GitHub Pages

[Pages ayarlarında](https://github.com/AdilSevim/GILT-Email-Sign-Web/settings/pages) **Source → Deploy from a branch → main → /(root) → Save** seç. İlk yayın tamamlandığında GitHub aynı sayfada ziyaret adresini gösterir.

Beklenen adres: https://adilsevim.github.io/GILT-Email-Sign-Web/
