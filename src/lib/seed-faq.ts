// FAQ drafted strictly from Cyberpoint's own site content. Editable in the admin panel.
type L = { az: string; en: string; ru: string };
/** Entries from this index on were added in seed v2. */
export const FAQ_V2_FROM = 12;
export const FAQ_SEED_VERSION = "2";
export const seedFaq: { service?: string; q: L; a: L }[] = [
  {
    q: { az: "Cyberpoint nə ilə məşğul olur?", en: "What does Cyberpoint do?", ru: "Чем занимается Cyberpoint?" },
    a: {
      az: "Cyberpoint Bakıda fəaliyyət göstərən kibertəhlükəsizlik şirkətidir. 7/24 Təhlükəsizlik Əməliyyatları Mərkəzi (SOC), nüfuzetmə sınaqları, kod təhlükəsizliyinin yoxlanılması, rəqəmsal istintaq, audit, konsultasiya və maarifləndirmə xidmətləri göstərir, həmçinin lider vendorların kibertəhlükəsizlik məhsullarını tətbiq edir.",
      en: "Cyberpoint is a cybersecurity company based in Baku. It provides a 24/7 Security Operations Center (SOC), penetration testing, secure code review, digital forensics, audits, consulting and security awareness training, and deploys cybersecurity products from leading vendors.",
      ru: "Cyberpoint — компания в сфере кибербезопасности из Баку. Она предоставляет центр мониторинга безопасности (SOC) 24/7, тестирование на проникновение, анализ безопасности кода, цифровую криминалистику, аудит, консалтинг и обучение кибергигиене, а также внедряет продукты ведущих вендоров.",
    },
  },
  {
    q: { az: "Xidmətləriniz kimlər üçündür?", en: "Who are your services for?", ru: "Для кого ваши услуги?" },
    a: {
      az: "Həm özəl, həm də dövlət qurumları üçün. Əsas hədəfimiz orta və böyük müəssisələrdir, lakin kiçik müəssisələrə də müdafiələrini gücləndirməyi tövsiyə edirik, çünki statistikaya görə onlar daha tez-tez hədəfə çevrilir.",
      en: "Both private companies and government organisations. Our core clients are medium and large organisations, but we also encourage small businesses to strengthen their defenses, since statistically they are targeted more often.",
      ru: "Для частных компаний и государственных организаций. Основные клиенты — средние и крупные организации, но мы рекомендуем усиливать защиту и малому бизнесу: по статистике, он становится целью чаще.",
    },
  },
  {
    service: "soc",
    q: { az: "7/24 monitorinq xidməti göstərirsiniz?", en: "Do you provide 24/7 security monitoring?", ru: "Вы предоставляете мониторинг безопасности 24/7?" },
    a: {
      az: "Bəli. Təhlükəsizlik Əməliyyatları Mərkəzimiz (SOC) infrastrukturunuzu 7/24 izləyir: loglar SIEM sistemində toplanır, insidentlər araşdırılır və onlara dərhal reaksiya verilir.",
      en: "Yes. Our Security Operations Center (SOC) monitors your infrastructure 24/7: logs are collected in a SIEM platform, incidents are investigated and responded to immediately.",
      ru: "Да. Наш центр мониторинга безопасности (SOC) круглосуточно отслеживает вашу инфраструктуру: логи собираются в SIEM, инциденты расследуются, реагирование происходит немедленно.",
    },
  },
  {
    service: "penetration-testing",
    q: { az: "Hansı növ nüfuzetmə sınaqları aparırsınız?", en: "What types of penetration testing do you offer?", ru: "Какие виды тестирования на проникновение вы проводите?" },
    a: {
      az: "Veb və mobil tətbiqlər, API-lər, daxili və xarici infrastruktur üçün sınaqlar aparırıq. Sınaqlar qara qutu (heç bir məlumat verilmir), ağ qutu (tam məlumat verilir) və boz qutu (məhdud məlumatla) üsulları ilə həyata keçirilir.",
      en: "We test web and mobile applications, APIs, and internal and external infrastructure. Tests are run as black box (no information shared), white box (full information) or grey box (limited insider knowledge).",
      ru: "Мы тестируем веб- и мобильные приложения, API, внутреннюю и внешнюю инфраструктуру. Тесты проводятся методами чёрного ящика (без информации), белого ящика (полная информация) и серого ящика (ограниченные знания инсайдера).",
    },
  },
  {
    service: "attack-simulation",
    q: { az: "Red, Blue və Purple Team nədir?", en: "What are Red, Blue and Purple Teams?", ru: "Что такое Red, Blue и Purple Team?" },
    a: {
      az: "Qırmızı Komanda real hücumçu kimi hücumları planlaşdırır və həyata keçirir, Mavi Komanda müdafiəni təmin edir, Bənövşəyi Komanda isə hər ikisinin birgə işidir. Şərti kiberhücum simulyasiyası xidmətimiz bu məşqlər vasitəsilə şəbəkə müdafiənizi məqsədli hücumlara hazırlayır.",
      en: "The Red Team plans and carries out attacks like a real adversary, the Blue Team defends, and the Purple Team is both working together. Our adversary simulation service uses these exercises to prepare your defenses for targeted attacks.",
      ru: "Red Team планирует и проводит атаки как реальный злоумышленник, Blue Team обеспечивает защиту, а Purple Team — их совместная работа. Наша услуга симуляции кибератак с помощью этих учений готовит защиту к целевым атакам.",
    },
  },
  {
    service: "digital-forensics",
    q: { az: "Artıq baş vermiş kiberhücumu araşdıra bilərsiniz?", en: "Can you investigate a cyber attack that has already happened?", ru: "Можете ли вы расследовать уже произошедшую кибератаку?" },
    a: {
      az: "Bəli. Rəqəmsal istintaq xidmətimiz çərçivəsində kompüter, telefon, yaddaş qurğuları, serverlər və bulud servislərindən sübutları toplayır, analiz edir, hücumun mənbəyini və addımlarını müəyyənləşdirir və detallı hesabat hazırlayırıq.",
      en: "Yes. With our digital forensics service we collect and analyse evidence from computers, phones, storage, servers and cloud services, identify the source and every step of the attack, and deliver a detailed report.",
      ru: "Да. В рамках цифровой криминалистики мы собираем и анализируем доказательства с компьютеров, телефонов, носителей, серверов и облачных сервисов, устанавливаем источник и каждый шаг атаки и готовим подробный отчёт.",
    },
  },
  {
    service: "security-audit",
    q: { az: "Audit zamanı hansı standartlardan istifadə edirsiniz?", en: "Which standards do you use for security audits?", ru: "Какие стандарты вы используете при аудите?" },
    a: {
      az: "Auditlərimiz “CIS Critical Security Controls” standartına və illərin praktik təcrübəsinə əsaslanır. Mütəxəssislərimiz sistemləri real hücumçu kimi düşünərək (“Adversary Mindset”) qiymətləndirir.",
      en: "Our audits are based on the CIS Critical Security Controls and years of practical experience. Our specialists assess systems with an adversary mindset, thinking the way real attackers do.",
      ru: "Наши аудиты основаны на CIS Critical Security Controls и многолетнем практическом опыте. Специалисты оценивают системы с мышлением злоумышленника (Adversary Mindset).",
    },
  },
  {
    service: "security-awareness",
    q: { az: "Əməkdaşlar üçün təlim keçirirsiniz?", en: "Do you train employees?", ru: "Вы проводите обучение сотрудников?" },
    a: {
      az: "Bəli. Kibertəhlükəsizlik maarifləndirmə xidmətimizə fişinq simulyasiyası kampaniyaları, rollara uyğun təlim proqramları və rəhbərlik üçün brifinqlər daxildir.",
      en: "Yes. Our security awareness service includes phishing simulation campaigns, role-based training programmes and executive briefings.",
      ru: "Да. Наша услуга обучения кибергигиене включает фишинг-симуляции, программы обучения по ролям и брифинги для руководства.",
    },
  },
  {
    q: { az: "Cyberpoint hansı sertifikatlara malikdir?", en: "Which certifications does Cyberpoint hold?", ru: "Какие сертификаты есть у Cyberpoint?" },
    a: {
      az: "Şirkətin idarəetmə sistemləri ISO/IEC 27001 və ISO 9001 üzrə Intertek tərəfindən sertifikatlaşdırılıb. Komandamız OSCP, OSWE, CEH, CompTIA Security+, CCNA, eJPT, eWPTX, CRTO və digər beynəlxalq sertifikatlara malikdir.",
      en: "The company's management systems are certified to ISO/IEC 27001 and ISO 9001 by Intertek. Our team holds OSCP, OSWE, CEH, CompTIA Security+, CCNA, eJPT, eWPTX, CRTO and other international certifications.",
      ru: "Системы менеджмента компании сертифицированы Intertek по ISO/IEC 27001 и ISO 9001. Команда имеет сертификаты OSCP, OSWE, CEH, CompTIA Security+, CCNA, eJPT, eWPTX, CRTO и другие.",
    },
  },
  {
    q: { az: "Hansı vendorların məhsullarını təqdim edirsiniz?", en: "Which vendors' products do you supply?", ru: "Продукты каких вендоров вы поставляете?" },
    a: {
      az: "Palo Alto Networks, Fortinet, Check Point, Cisco, CrowdStrike, Splunk, Elastic, CyberArk, Imperva, F5, Forcepoint, Tenable, Rapid7 və digərləri daxil olmaqla 27 qlobal vendorla tərəfdaşıq. Məhsulun seçimi, quraşdırılması və konfiqurasiyasını komandamız həyata keçirir.",
      en: "We partner with 27 global vendors, including Palo Alto Networks, Fortinet, Check Point, Cisco, CrowdStrike, Splunk, Elastic, CyberArk, Imperva, F5, Forcepoint, Tenable and Rapid7. Our team handles selection, deployment and configuration.",
      ru: "Мы сотрудничаем с 27 глобальными вендорами, включая Palo Alto Networks, Fortinet, Check Point, Cisco, CrowdStrike, Splunk, Elastic, CyberArk, Imperva, F5, Forcepoint, Tenable и Rapid7. Подбор, внедрение и настройку выполняет наша команда.",
    },
  },
  {
    q: { az: "Cyberpoint zəifliklər aşkar edibmi?", en: "Has Cyberpoint discovered any vulnerabilities?", ru: "Обнаруживал ли Cyberpoint уязвимости?" },
    a: {
      az: "Bəli. R&D komandamız Windows kernel drayverlərində üç yeni zəiflik aşkarlayıb və onlar rəsmi CVE identifikatorları ilə qeydiyyata alınıb: CVE-2026-19380, CVE-2026-19381 və CVE-2026-19382.",
      en: "Yes. Our R&D team discovered three new vulnerabilities in Windows kernel drivers, registered with official CVE identifiers: CVE-2026-19380, CVE-2026-19381 and CVE-2026-19382.",
      ru: "Да. Наша R&D-команда обнаружила три новые уязвимости в драйверах ядра Windows, зарегистрированные с официальными идентификаторами CVE-2026-19380, CVE-2026-19381 и CVE-2026-19382.",
    },
  },
  {
    q: { az: "Konsultasiya üçün necə müraciət edə bilərəm?", en: "How can I request a consultation?", ru: "Как запросить консультацию?" },
    a: {
      az: "Saytdakı əlaqə formasını doldurun, +994 12 526 33 33 nömrəsinə zəng edin, info@cyberpoint.az ünvanına yazın və ya saytdakı AI köməkçiyə müraciət edin. Mütəxəssislərimiz qısa zamanda sizinlə əlaqə saxlayacaq.",
      en: "Fill in the contact form on the website, call +994 12 526 33 33, email info@cyberpoint.az, or ask the AI assistant on the site. Our specialists will get back to you shortly.",
      ru: "Заполните форму на сайте, позвоните по номеру +994 12 526 33 33, напишите на info@cyberpoint.az или обратитесь к AI-ассистенту на сайте. Наши специалисты скоро свяжутся с вами.",
    },
  },
  // ---- Added in FAQ seed v2 (inserted once into existing databases too) ----
  {
    service: "secure-code-review",
    q: { az: "Proqram təminatımızın mənbə kodunu yoxlaya bilərsiniz?", en: "Can you check the source code of our software?", ru: "Можете ли вы проверить исходный код нашего ПО?" },
    a: {
      az: "Bəli. Veb və mobil tətbiqlərin mənbə kodunu SAST alətləri ilə avtomatlaşdırılmış analiz və ekspert tərəfindən manual baxışla yoxlayırıq. OWASP Top 10 zəiflikləri və məntiq səhvləri aşkarlanır, tərtibatçılarınız üçün konkret düzəliş tövsiyələri hazırlanır.",
      en: "Yes. We review the source code of web and mobile applications with automated SAST analysis plus manual expert review. We look for OWASP Top 10 vulnerabilities and logic flaws, and give your developers concrete fix recommendations.",
      ru: "Да. Мы проверяем исходный код веб- и мобильных приложений с помощью автоматизированного SAST-анализа и ручной экспертной проверки. Выявляем уязвимости из OWASP Top 10 и логические ошибки и даём разработчикам конкретные рекомендации по исправлению.",
    },
  },
  {
    service: "consulting",
    q: { az: "ISO/IEC 27001 kimi standartlara uyğunlaşmağa kömək edirsiniz?", en: "Can you help us comply with standards such as ISO/IEC 27001?", ru: "Помогаете ли вы соответствовать стандартам, например ISO/IEC 27001?" },
    a: {
      az: "Bəli. Konsultasiya xidmətimizə standartlara uyğunluq (ISO 27001 və s.), təhlükəsizlik strategiyası və yol xəritəsinin hazırlanması, təhlükəsiz arxitektura dizaynı və virtual CISO dəstəyi daxildir. Cyberpoint-in özünün idarəetmə sistemləri də ISO/IEC 27001 üzrə sertifikatlaşdırılıb.",
      en: "Yes. Our consulting covers compliance with standards (ISO 27001 and others), security strategy and roadmaps, secure architecture design and virtual CISO support. Cyberpoint's own management systems are certified to ISO/IEC 27001.",
      ru: "Да. Наш консалтинг включает соответствие стандартам (ISO 27001 и другим), разработку стратегии и дорожной карты безопасности, проектирование безопасной архитектуры и поддержку в формате виртуального CISO. Системы менеджмента самой Cyberpoint сертифицированы по ISO/IEC 27001.",
    },
  },
  {
    q: { az: "Hansı sahələrdən olan müştərilərlə işləyirsiniz?", en: "Which sectors do your clients come from?", ru: "С клиентами из каких отраслей вы работаете?" },
    a: {
      az: "Müştərilərimiz müxtəlif sahələri təmsil edir: dövlət qurumları, bank sektoru, tikinti, təhlükəsizlik və digər sahələr.",
      en: "Our clients come from a variety of sectors, including government, banking, construction, security and others.",
      ru: "Наши клиенты представляют самые разные отрасли: государственный сектор, банки, строительство, безопасность и другие.",
    },
  },
  {
    q: { az: "Cyberpoint-də işləmək üçün necə müraciət edə bilərəm?", en: "How can I apply for a job at Cyberpoint?", ru: "Как устроиться на работу в Cyberpoint?" },
    a: {
      az: "“Karyera” səhifəsində qısa formu doldurun, CV-nizi (PDF və ya DOCX) əlavə edin və “Göndər” düyməsini sıxın. Müraciətiniz birbaşa komandamıza çatacaq.",
      en: "On the Careers page, fill in the short form, attach your CV (PDF or DOCX) and click “Send”. Your application goes straight to our team.",
      ru: "На странице «Карьера» заполните короткую форму, приложите резюме (PDF или DOCX) и нажмите «Отправить». Заявка поступит напрямую нашей команде.",
    },
  },
];
