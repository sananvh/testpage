// MEDIA RADAR: Cyberpoint R&D product (texts based on https://new.mediaradar.io/). Editable in the admin.
type L = { az: string; en: string; ru: string };

export const mediaRadarProduct = {
  name: "MEDIA RADAR",
  url: "https://new.mediaradar.io/",
  logo: "/products/mediaradar-logo.svg",
  logo_dark: "/products/mediaradar-logo-light.svg",
  app_ios: "https://apps.apple.com/az/app/mediaradar-az/id6748363960",
  app_android: "https://play.google.com/store/apps/details?id=io.mediaradar.app",
  tagline: {
    az: "Canlı media monitorinqi",
    en: "Live media monitoring",
    ru: "Мониторинг СМИ в реальном времени",
  } as L,
  description: {
    az: "MEDIA RADAR xəbər saytlarını, Telegram, YouTube, Facebook və TikTok-u fasiləsiz izləyir, mətni təmizləyir, tonu və mövzunu müəyyən edir və sizə yalnız vacib olanı çatdırır.",
    en: "MEDIA RADAR watches news sites, Telegram, YouTube, Facebook and TikTok around the clock, cleans the text, detects tone and topic, and brings you only what matters.",
    ru: "MEDIA RADAR круглосуточно следит за новостными сайтами, Telegram, YouTube, Facebook и TikTok, очищает текст, определяет тональность и тему и приносит вам только важное.",
  } as L,
  features: {
    az: "Xəbər saytları, Telegram, YouTube, Facebook və TikTok 7/24\nTon, mövzu və dil avtomatik müəyyən edilir\nXəbəri ilk kimin verdiyi və necə yayıldığı\nDərhal bildirişlər və gündəlik xülasə\nVideodan mətn və kampaniyaların aşkarlanması\niOS və Android tətbiqləri",
    en: "News sites, Telegram, YouTube, Facebook and TikTok, 24/7\nTone, topic and language detected automatically\nWho reported first and how the story spread\nInstant alerts and a daily digest\nVideo to text and campaign detection\niOS and Android apps",
    ru: "Новостные сайты, Telegram, YouTube, Facebook и TikTok 24/7\nТональность, тема и язык определяются автоматически\nКто опубликовал первым и как распространялась новость\nМгновенные уведомления и ежедневная сводка\nТекст из видео и выявление кампаний\nПриложения для iOS и Android",
  } as L,
};

export const mediaRadarNews = {
  slug: "mediaradar",
  date: "2026-11-18",
  image: "/news/mediaradar.jpg",
  title: {
    az: "Cyberpoint R&D Mərkəzi yeni məhsulunu təqdim edir: MEDIA RADAR",
    en: "Cyberpoint R&D launches MEDIA RADAR, a live media monitoring platform",
    ru: "R&D-центр Cyberpoint представляет MEDIA RADAR — платформу мониторинга СМИ в реальном времени",
  } as L,
  body: {
    az: `Cyberpoint-in Tədqiqat və İnkişaf (R&D) Mərkəzi yeni məhsulunu təqdim edir: MEDIA RADAR, medianın və sosial şəbəkələrin canlı monitorinqi platforması.

MEDIA RADAR xəbər saytlarını, Telegram, YouTube, Facebook və TikTok-u fasiləsiz izləyir, mətni təmizləyir, tonu və mövzunu müəyyən edir və istifadəçiyə yalnız vacib olanı çatdırır.

## Necə işləyir
- Toplayır: xəbər saytları, Telegram kanalları, YouTube, Facebook və TikTok dayanmadan oxunur; YouTube və TikTok videolarındakı danışıq nitqi tanıma modeli ilə mətnə çevrilir.
- Təmizləyir: reklam, «abunə olun» çağırışları, sayt vidcetləri və emoji yığınları silinir, yalnız xəbərin özü qalır.
- Anlayır: dil, kateqoriya və ton avtomatik müəyyən edilir; eyni hekayə müxtəlif mənbələrdə tanınır və birləşdirilir.
- Xəbər verir: mövzunuza uyğun xəbər dərhal bildiriş və ya gündəlik xülasə kimi tətbiqə, telefona və e-poçta gəlir.

## Xəbəri ilk kim verdi?
MEDIA RADAR eyni hekayəni bütün platformalarda tanıyır, onu ilk kimin verdiyini və necə yayıldığını dəqiqəbədəqiqə göstərir. Tonallıq, oxşar xəbərlərin birləşdirilməsi, heşteq kampaniyalarının aşkarlanması və hesabatlar da platformanın imkanlarındandır.

## Kimlər üçündür
Dövlət qurumları, PR agentlikləri, şirkətlər və jurnalistlər, yəni media ilə işləyən hər kəs üçün. iOS və Android tətbiqləri bildirişi xəbər çıxan anda çatdırır.

Ətraflı məlumat və qeydiyyat: https://new.mediaradar.io/`,
    en: `Cyberpoint's Research & Development (R&D) Center introduces its new product: MEDIA RADAR, a platform for live monitoring of news and social media.

MEDIA RADAR watches news sites, Telegram, YouTube, Facebook and TikTok around the clock, cleans the text, detects tone and topic, and brings users only what matters.

## How it works
- Collect: news sites, Telegram channels, YouTube, Facebook and TikTok are read non-stop; speech in YouTube and TikTok videos is turned into text by a speech-to-text model.
- Clean: ads, "subscribe" calls, site widgets and emoji runs are removed, so only the story stays.
- Understand: language, category and tone are detected automatically; the same story is recognised across sources and grouped.
- Alert: a story that matches your topic arrives at once or in a daily digest, in the app, on your phone and by email.

## Who reported first?
MEDIA RADAR recognises the same story on every platform and shows who broke it and how it spread, minute by minute. Tone analysis, merging of similar stories, hashtag campaign detection and reports are also part of the platform.

## Who it is for
Government bodies, PR agencies, companies and journalists: everyone who works with the media. The iOS and Android apps deliver the alert the moment a story breaks.

More information and sign-up: https://new.mediaradar.io/`,
    ru: `Центр исследований и разработок (R&D) Cyberpoint представляет новый продукт: MEDIA RADAR, платформу мониторинга СМИ и социальных сетей в реальном времени.

MEDIA RADAR круглосуточно следит за новостными сайтами, Telegram, YouTube, Facebook и TikTok, очищает текст, определяет тональность и тему и приносит пользователю только важное.

## Как это работает
- Собирает: новостные сайты, Telegram-каналы, YouTube, Facebook и TikTok читаются без остановки; речь в видео YouTube и TikTok превращается в текст моделью распознавания речи.
- Очищает: реклама, призывы «подписывайтесь», виджеты сайтов и цепочки эмодзи удаляются, остаётся только сама новость.
- Понимает: язык, категория и тональность определяются автоматически; одна и та же история узнаётся в разных источниках и объединяется.
- Сообщает: новость по вашей теме приходит сразу или в ежедневной сводке — в приложении, на телефоне и по почте.

## Кто опубликовал первым?
MEDIA RADAR узнаёт одну и ту же историю на всех платформах и показывает, кто опубликовал её первым и как она распространялась, поминутно. Тональность, объединение похожих новостей, выявление хештег-кампаний и отчёты также входят в возможности платформы.

## Для кого
Для госучреждений, PR-агентств, компаний и журналистов — для всех, кто работает со СМИ. Приложения для iOS и Android присылают уведомление в момент появления новости.

Подробнее и регистрация: https://new.mediaradar.io/`,
  } as L,
};
