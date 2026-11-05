// Service content. AZ bodies come from cyberpoint.az; EN/RU are translations for client review.
// Body format: paragraphs separated by a blank line; "- " starts a bullet. Features: one per line.

export const seedServices = [
  {
    slug: "soc", phase: "respond", icon: "radar",
    title: { az: "Təhlükəsizlik Əməliyyatları Mərkəzi (SOC)", en: "Security Operations Center (SOC)", ru: "Центр мониторинга безопасности (SOC)" },
    short: { az: "7/24 infrastruktur monitorinqi və insidentlərə reaksiya", en: "24/7 infrastructure monitoring and incident response", ru: "Мониторинг 24/7 и реагирование на инциденты" },
    body: {
      az: "Təhlükəsizlik Əməliyyatları Mərkəzi bütün infrastrukturun 7/24 monitorinqini həyata keçirən mərkəzdir. Sistem, şəbəkə və təhlükəsizlik avadanlıqlarına və proqram təminatlarına aid hadisələr (loglar) mərkəzi monitorinq sistemi olan SIEM-də (Security Information and Event Management) toplanır.\n\nSOC komandası şəbəkələrdə, serverlərdə, verilənlər bazalarında, proqram təminatlarında, vebsaytlarda və digər informasiya sistemlərində baş verən insidentlərə nəzarət edir, təhlükəsizlik pozuntularını araşdırır və dərhal reaksiya verir. Mütəxəssislərimiz həm hadisələr baş verməzdən əvvəl, həm də sonra vəziyyətin təhlili ilə məşğul olur.",
      en: "Our Security Operations Center monitors your entire infrastructure around the clock. Events (logs) from systems, networks, security appliances and software are collected in a central SIEM (Security Information and Event Management) platform.\n\nThe SOC team watches for incidents across networks, servers, databases, applications, websites and other information systems, investigates security breaches and responds immediately. Our analysts work both before incidents happen and after, analysing what occurred and how to prevent it.",
      ru: "Центр мониторинга безопасности круглосуточно отслеживает всю вашу инфраструктуру. События (логи) систем, сетей, средств защиты и программного обеспечения собираются в центральной SIEM-платформе (Security Information and Event Management).\n\nКоманда SOC контролирует инциденты в сетях, на серверах, в базах данных, приложениях, на веб-сайтах и в других информационных системах, расследует нарушения безопасности и немедленно реагирует. Наши аналитики работают как до инцидентов, так и после них, анализируя произошедшее.",
    },
    features: {
      az: "7/24 monitorinq və növbətçilik\nSIEM əsaslı log toplanması və korrelyasiya\nİnsidentlərə operativ reaksiya və eskalasiya\nAylıq hesabatlar və tövsiyələr",
      en: "24/7 monitoring and on-call analysts\nSIEM-based log collection and correlation\nRapid incident response and escalation\nMonthly reports and recommendations",
      ru: "Мониторинг и дежурство 24/7\nСбор и корреляция логов на базе SIEM\nОперативное реагирование и эскалация\nЕжемесячные отчёты и рекомендации",
    },
  },
  {
    slug: "penetration-testing", phase: "assess", icon: "target",
    title: { az: "Nüfuzetmə sınaqları", en: "Penetration testing", ru: "Тестирование на проникновение" },
    short: { az: "Qara, ağ və boz qutu üsulu ilə zəifliklərin aşkarlanması", en: "Black, white and grey box vulnerability discovery", ru: "Поиск уязвимостей методами black, white и grey box" },
    body: {
      az: "Mobil tətbiqlərdə, infrastrukturda, veb tətbiq və servislərdə mövcud təhlükəsizlik boşluqlarının sınaqdan keçirilərək aşkarlanması və risklərin müəyyən edilməsi xidmətidir. “Penetration test” adlanan bu xidmət şirkətlərin mövcud şəbəkə, sistem və proqram təminatlarının təhlükəsizlik səviyyəsini və potensial təhdidləri öyrənməsi üçün həyata keçirilir. Bu yolla şirkətlər təhlükəsizlik açıqlarından xəbərdar olur və onları zərər dəymədən aradan qaldırır.\n\nPentest 3 üsulla həyata keçirilir:\n- Qara qutu: sistemlər haqqında heç bir məlumat paylaşılmır, sınaq ictimaiyyətə açıq məlumatlarla aparılır.\n- Ağ qutu: şirkətin sistemləri haqqında tam məlumat verilir.\n- Boz qutu: icazəsiz istifadəçinin bildiyi məlumat və imtiyazlarla aparılan, ağ və qara qutu arasında olan sınaq.",
      en: "We test mobile applications, infrastructure, web applications and services to discover existing security weaknesses and assess the risks. Penetration testing shows an organisation the real security level of its networks, systems and software and the threats it faces, so weaknesses can be fixed before they cause damage.\n\nWe run penetration tests in three ways:\n- Black box: no information about the systems is shared; the test uses only publicly available information.\n- White box: full information about the systems is provided.\n- Grey box: a middle ground, using the knowledge and privileges an unauthorised insider might have.",
      ru: "Мы тестируем мобильные приложения, инфраструктуру, веб-приложения и сервисы, чтобы выявить существующие уязвимости и оценить риски. Пентест показывает реальный уровень защищённости сетей, систем и ПО и потенциальные угрозы, чтобы устранить слабые места до нанесения ущерба.\n\nПентест проводится тремя способами:\n- Чёрный ящик: информация о системах не предоставляется, используются только открытые данные.\n- Белый ящик: предоставляется полная информация о системах.\n- Серый ящик: промежуточный вариант с теми знаниями и привилегиями, которые есть у неавторизованного инсайдера.",
    },
    features: {
      az: "Veb, mobil və API sınaqları\nDaxili və xarici infrastruktur sınağı\nRisk səviyyəsinə görə prioritetləşdirilmiş hesabat\nDüzəlişlərdən sonra təkrar sınaq",
      en: "Web, mobile and API testing\nInternal and external infrastructure testing\nRisk-prioritised report\nRetest after remediation",
      ru: "Тестирование веб, мобильных приложений и API\nВнутренний и внешний пентест инфраструктуры\nОтчёт с приоритизацией по риску\nПовторная проверка после исправлений",
    },
  },
  {
    slug: "secure-code-review", phase: "assess", icon: "code",
    title: { az: "Kod təhlükəsizliyinin yoxlanılması", en: "Secure code review", ru: "Анализ безопасности кода" },
    short: { az: "Veb və mobil tətbiqlərin mənbə kodunun analizi", en: "Source code analysis for web and mobile apps", ru: "Анализ исходного кода веб- и мобильных приложений" },
    body: {
      az: "Veb və mobil tətbiqlərin mənbə kodlarının təhlükəsizlik analizi və boşluqların aşkarlanması xidmətidir. Bu, proqram təminatının hazırlanmasını sürətləndirmək, kod keyfiyyətini yaxşılaşdırmaq, səhvləri və zəiflikləri aşkar edərək müvafiq həllər təklif etmək baxımından çox effektiv üsuldur.\n\nTəhlükəsiz kod baxışı tətbiqin mənbə kodunu araşdıran manual və ya avtomatlaşdırılmış prosesdir və xüsusilə məntiq səhvlərinə diqqət yetirir. Manual baxış təcrübəli mütəxəssis tərəfindən bütün kod bazasının hərtərəfli nəzərdən keçirilməsidir. Avtomatlaşdırılmış baxış əvvəlcədən müəyyən edilmiş qaydalarla problemli kodu daha sürətli tapır, manual baxış isə kodlaşdırma qərarlarının kontekstini aydınlaşdırır.",
      en: "We analyse the source code of web and mobile applications to find security weaknesses. It is an effective way to speed up development, improve code quality, and catch bugs and vulnerabilities early with concrete fixes.\n\nSecure code review is a manual or automated examination of an application's source code, with special attention to logic flaws. Manual review means an experienced specialist goes through the whole code base; automated review uses predefined rules to find problematic code faster. Combining both gives speed and the context behind coding decisions.",
      ru: "Мы анализируем исходный код веб- и мобильных приложений на предмет уязвимостей. Это эффективный способ ускорить разработку, повысить качество кода и выявить ошибки и уязвимости на ранней стадии с конкретными рекомендациями.\n\nАнализ безопасности кода — ручная или автоматизированная проверка исходного кода с особым вниманием к логическим ошибкам. При ручной проверке опытный специалист изучает всю кодовую базу; автоматизированная проверка по заданным правилам быстрее находит проблемный код. Сочетание обоих подходов даёт и скорость, и понимание контекста.",
    },
    features: {
      az: "SAST alətləri ilə avtomatlaşdırılmış analiz\nEkspert tərəfindən manual baxış\nOWASP Top 10 və məntiq səhvləri\nTərtibatçılar üçün düzəliş tövsiyələri",
      en: "Automated analysis with SAST tools\nManual review by experts\nOWASP Top 10 and logic flaws\nFix guidance for developers",
      ru: "Автоматизированный анализ инструментами SAST\nРучная экспертная проверка\nOWASP Top 10 и логические ошибки\nРекомендации по исправлению для разработчиков",
    },
  },
  {
    slug: "security-awareness", phase: "protect", icon: "users",
    title: { az: "Kibertəhlükəsizlik maarifləndirməsi", en: "Security awareness training", ru: "Обучение кибергигиене" },
    short: { az: "Əməkdaşların fişinq və sosial mühəndisliyə hazırlığı", en: "Preparing staff for phishing and social engineering", ru: "Подготовка сотрудников к фишингу и социальной инженерии" },
    body: {
      az: "Kibertəhlükəsizlik maarifləndirmə xidməti istifadəçilərə təhdid və risklərlə qarşılaşdıqda addımlarını düzgün atmaq üçün yol göstərir. Kiber maarifləndirmə daha çox təhdidin qarşısını almağa kömək edir.\n\nE-poçt vasitəsilə ötürülən təhdidlər həmişə insanları hədəf alır: onları linklərə klikləməyə, qoşmaları açmağa, parolları və şəxsi məlumatları paylaşmağa yönəldir. Ən son alətlərə nə qədər sərmayə qoymağınızın əhəmiyyəti yoxdur: istifadəçiləriniz şübhəli linki və ya saxta e-poçtu tanıya bilmirsə, müdafiənin zəifləməsi ehtimalı yüksəkdir.",
      en: "Security awareness training shows people how to act correctly when they face threats and risks. Awareness prevents a large share of attacks.\n\nEmail-borne threats always target people: they push users to click links, open attachments, or share passwords and personal data. However much you invest in the latest tools, if your users cannot recognise a suspicious link or a fake email, your defenses are likely to be weakened.",
      ru: "Обучение кибергигиене помогает сотрудникам правильно действовать при столкновении с угрозами и рисками. Осведомлённость предотвращает значительную часть атак.\n\nУгрозы по электронной почте всегда нацелены на людей: они побуждают переходить по ссылкам, открывать вложения, сообщать пароли и личные данные. Сколько бы вы ни вкладывали в новейшие инструменты, если сотрудники не распознают подозрительную ссылку или поддельное письмо, защита будет ослаблена.",
    },
    features: {
      az: "Fişinq simulyasiyası kampaniyaları\nRollara uyğun təlim proqramları\nRəhbərlik üçün brifinqlər\nNəticələrin ölçülməsi və hesabat",
      en: "Phishing simulation campaigns\nRole-based training programmes\nExecutive briefings\nMeasured results and reporting",
      ru: "Кампании фишинг-симуляций\nПрограммы обучения по ролям\nБрифинги для руководства\nИзмерение результатов и отчётность",
    },
  },
  {
    slug: "attack-simulation", phase: "assess", icon: "swords",
    title: { az: "Şərti kiberhücum simulyasiyası", en: "Adversary simulation", ru: "Симуляция кибератак" },
    short: { az: "Red, Blue və Purple Team məşqləri", en: "Red, Blue and Purple Team exercises", ru: "Учения Red, Blue и Purple Team" },
    body: {
      az: "Şərti kiberhücum simulyasiyası real kibercinayətkar qruplaşmaların istifadə etdiyi texnikalara əsaslanan hücumların simulyasiyasıdır. Əsas hədəf məqsədli hücumlara qarşı şəbəkə müdafiəsini hazırlamaqdır.\n\n- Qırmızı Komanda hücumu planlaşdırmaq və həyata keçirmək üçün mümkün yolları araşdırır və potensial hücumçuların düşüncə tərzi ilə hərəkət edir.\n- Mavi Komanda həm real hücumçulara, həm də Qırmızı Komandaya qarşı müdafiəni təmin edir.\n- Bənövşəyi Komanda hər iki komandanın birgə işidir: birlikdə işlədikdə onların bacarıqları və prosesləri güclənir.",
      en: "Adversary simulation reproduces attacks based on the techniques real cybercriminal groups use. The goal is to prepare your network defenses for targeted attacks.\n\n- The Red Team researches ways to plan and carry out an attack and acts with the mindset of a real attacker.\n- The Blue Team defends against both real attackers and the Red Team.\n- The Purple Team is the two working together, which strengthens the skills and processes of both.",
      ru: "Симуляция кибератак воспроизводит атаки на основе техник реальных киберпреступных группировок. Цель — подготовить защиту сети к целевым атакам.\n\n- Red Team исследует способы планирования и проведения атаки и действует с мышлением реального злоумышленника.\n- Blue Team обеспечивает защиту как от реальных атакующих, так и от Red Team.\n- Purple Team — совместная работа обеих команд, усиливающая навыки и процессы каждой.",
    },
    features: {
      az: "MITRE ATT&CK əsaslı ssenarilər\nRed Team kampaniyaları\nPurple Team məşqləri və aşkarlama boşluqlarının analizi\nMüdafiənin gücləndirilməsi üzrə yol xəritəsi",
      en: "Scenarios mapped to MITRE ATT&CK\nRed Team campaigns\nPurple Team exercises and detection gap analysis\nDefense improvement roadmap",
      ru: "Сценарии на основе MITRE ATT&CK\nКампании Red Team\nУчения Purple Team и анализ пробелов обнаружения\nДорожная карта усиления защиты",
    },
  },
  {
    slug: "digital-forensics", phase: "respond", icon: "search",
    title: { az: "Rəqəmsal istintaq", en: "Digital forensics", ru: "Цифровая криминалистика" },
    short: { az: "Kiberhücumların və məlumat itkilərinin araşdırılması", en: "Investigating attacks and data breaches", ru: "Расследование атак и утечек данных" },
    body: {
      az: "Rəqəmsal istintaq (Digital Forensics) kibertəhlükəsizlik hadisələrinin araşdırılmasıdır. Bu xidmət çərçivəsində şirkətinizdə baş vermiş kiberhücumları və təhlükəsizlik pozuntularını araşdırır, məlumat itkilərinin səbəblərini aydınlaşdırırıq.\n\nBunun üçün rəqəmsal cihazlarınızdan (kompüterlər, telefonlar, yaddaş qurğuları) və şəbəkələrinizdən (bulud servisləri, serverlər) məlumatları toplayır və analiz edirik. Əldə etdiyimiz məlumatlar əsasında detallı hesabat hazırlayırıq. Təhlükəsizlik hadisəsi zamanı məlumatlarınızı qorumaq, mənbəyini müəyyənləşdirmək və hər addımı aşkar etmək bizim məsuliyyətimizdir.",
      en: "Digital forensics is the investigation of cybersecurity incidents. We investigate attacks and security breaches in your organisation and establish the causes of data loss.\n\nWe collect and analyse data from your digital devices (computers, phones, storage media) and networks (cloud services, servers), and prepare a detailed report based on the findings. During an incident, protecting your data, identifying the source and uncovering every step of the attack is our responsibility.",
      ru: "Цифровая криминалистика (Digital Forensics) — расследование инцидентов кибербезопасности. Мы расследуем атаки и нарушения безопасности в вашей организации и выясняем причины утечек данных.\n\nМы собираем и анализируем данные с ваших цифровых устройств (компьютеры, телефоны, носители) и из сетей (облачные сервисы, серверы) и готовим подробный отчёт. Во время инцидента защита данных, установление источника и восстановление каждого шага атаки — наша ответственность.",
    },
    features: {
      az: "Sübutların qorunması və toplanması\nCihaz, yaddaş və şəbəkə analizi\nHücum xronologiyasının bərpası\nDetallı ekspert hesabatı",
      en: "Evidence preservation and collection\nDevice, memory and network analysis\nAttack timeline reconstruction\nDetailed expert report",
      ru: "Сохранение и сбор доказательств\nАнализ устройств, памяти и сети\nВосстановление хронологии атаки\nПодробный экспертный отчёт",
    },
  },
  {
    slug: "solution-implementation", phase: "protect", icon: "layers",
    title: { az: "Kibertəhlükəsizlik həllərinin tətbiqi", en: "Security solution implementation", ru: "Внедрение решений безопасности" },
    short: { az: "Təhlükəsiz infrastruktur dizaynı və konfiqurasiya", en: "Secure infrastructure design and configuration", ru: "Проектирование и настройка защищённой инфраструктуры" },
    body: {
      az: "Kibertəhlükəsizlik həllərinin tətbiqi şəbəkə, sistem və tətbiq təhlükəsizliyi həllərinin quraşdırılması, konfiqurasiyası və təhlükəsiz infrastruktur dizaynıdır. Şirkət sistem məlumatlarını saxlayan və emal edən bütün komponentlərin aydın və dəqiq təsvirinə malik olmalıdır.\n\nStatistikaya görə, kiberhücumların bir çoxu daxildən həyata keçirilir. Bu səbəbdən daxili təhdidlərin də qarşısı alınmalıdır.",
      en: "Security solution implementation covers installing and configuring network, system and application security solutions, as well as designing secure infrastructure. An organisation needs a clear, accurate picture of every component that stores or processes its data.\n\nStatistics show that many attacks originate from inside, so insider threats must be addressed too.",
      ru: "Внедрение решений безопасности включает установку и настройку средств защиты сетей, систем и приложений, а также проектирование защищённой инфраструктуры. Организация должна чётко представлять все компоненты, которые хранят или обрабатывают её данные.\n\nПо статистике, многие атаки происходят изнутри, поэтому необходимо противодействовать и внутренним угрозам.",
    },
    features: {
      az: "Arxitektura və həll seçimi\nQuraşdırma və konfiqurasiya\nƏn yaxşı praktikalara uyğun sərtləşdirmə\nKomandanız üçün təlim və sənədləşmə",
      en: "Architecture and solution selection\nInstallation and configuration\nHardening to best practice\nTraining and documentation for your team",
      ru: "Выбор архитектуры и решений\nУстановка и настройка\nУсиление защиты по лучшим практикам\nОбучение и документация для вашей команды",
    },
  },
  {
    slug: "security-audit", phase: "assess", icon: "clipboard",
    title: { az: "Kibertəhlükəsizlik auditi", en: "Cybersecurity audit", ru: "Аудит кибербезопасности" },
    short: { az: "CIS Controls əsasında sistematik qiymətləndirmə", en: "Systematic assessment based on CIS Controls", ru: "Системная оценка на основе CIS Controls" },
    body: {
      az: "Müəssisənin informasiya sistemlərinin müəyyən edilmiş meyarlar toplusu ilə müqayisə edilərək sistematik qiymətləndirilməsi xidmətidir. Audit zamanı illərin təcrübəsinə əsaslanan tətbiq, dizayn və prinsiplər, eləcə də “CIS Critical Security Controls” standartı əsas götürülür.\n\nYoxlamalar zamanı əməkdaşlarımız “Adversary Mindset” yanaşması ilə, yəni real kibercinayətkarlar kimi düşünərək təhdidləri modelləşdirir, sistemləri analiz edir və lazımi qiymətləndirmələri aparır.",
      en: "A systematic assessment of your information systems against a defined set of criteria. Our audits are based on years of practical experience in implementation, design and principles, and on the CIS Critical Security Controls standard.\n\nOur specialists audit with an adversary mindset: they model threats the way real cybercriminals think, analyse your systems and make the necessary assessments.",
      ru: "Системная оценка информационных систем организации на соответствие определённому набору критериев. Аудит опирается на многолетний практический опыт внедрения и проектирования, а также на стандарт CIS Critical Security Controls.\n\nНаши специалисты проводят проверку с мышлением злоумышленника (Adversary Mindset): моделируют угрозы так, как это сделали бы реальные киберпреступники, анализируют системы и дают оценку.",
    },
    features: {
      az: "CIS Controls əsasında qiymətləndirmə\nKonfiqurasiya və siyasətlərin yoxlanılması\nRisk reyestri və boşluq analizi\nPrioritetləşdirilmiş düzəliş planı",
      en: "Assessment based on CIS Controls\nConfiguration and policy review\nRisk register and gap analysis\nPrioritised remediation plan",
      ru: "Оценка на основе CIS Controls\nПроверка конфигураций и политик\nРеестр рисков и анализ разрывов\nПриоритизированный план устранения",
    },
  },
  {
    slug: "consulting", phase: "protect", icon: "chat",
    title: { az: "Kibertəhlükəsizlik konsultasiyası", en: "Cybersecurity consulting", ru: "Консалтинг по кибербезопасности" },
    short: { az: "Təhlükəsiz arxitektura və ekspert məsləhəti", en: "Secure architecture and expert advice", ru: "Безопасная архитектура и экспертные консультации" },
    body: {
      az: "Bir çox müəssisə gündəlik olaraq müxtəlif kibertəhlükəsizlik problemləri ilə qarşılaşır. Onların bəziləri kiçik miqyaslı olsa da, bəzilərinin həlli ətraflı araşdırma, yüksək analitika və ekspertiza tələb edir. Yüksək ixtisaslı mütəxəssislərimizin konsultasiya xidmətləri problemlərin qısa zamanda həllini təklif edir.\n\nBu xidmətə yeni qurulacaq sistemlərin, şəbəkələrin və hazırlanan proqram təminatlarının təhlükəsizlik tələblərinə uyğun arxitekturasının qurulması, mövcud təhlükəsizlik mexanizmlərinə ediləcək dəyişikliklərin müzakirəsi də daxildir.",
      en: "Organisations face cybersecurity problems every day. Some are small, but others require in-depth research, strong analytics and expertise. Our highly qualified specialists help you solve them quickly.\n\nThe service also covers designing secure architecture for new systems, networks and software, and reviewing planned changes to your existing security controls.",
      ru: "Организации ежедневно сталкиваются с проблемами кибербезопасности. Некоторые из них незначительны, другие требуют глубокого исследования, аналитики и экспертизы. Наши высококвалифицированные специалисты помогают решить их в короткие сроки.\n\nУслуга также включает проектирование безопасной архитектуры новых систем, сетей и ПО и обсуждение планируемых изменений существующих механизмов защиты.",
    },
    features: {
      az: "Təhlükəsizlik strategiyası və yol xəritəsi\nTəhlükəsiz arxitektura dizaynı\nStandartlara uyğunluq (ISO 27001 və s.)\nVirtual CISO dəstəyi",
      en: "Security strategy and roadmap\nSecure architecture design\nCompliance support (ISO 27001 and more)\nVirtual CISO support",
      ru: "Стратегия и дорожная карта безопасности\nПроектирование безопасной архитектуры\nПоддержка соответствия (ISO 27001 и др.)\nПоддержка в формате виртуального CISO",
    },
  },
];
