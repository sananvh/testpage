// From Cyberpoint's R&D announcement (October 2026). Seed data only: CVEs are edited in the admin panel (CVE-lər).
export const cves = [
  { id: "CVE-2026-19380", product: "Mullvad WireGuard", driver: "wireguard.sys" },
  { id: "CVE-2026-19381", product: "Kingston FURY CTRL", driver: "NTIOLib_KSFX.sys" },
  { id: "CVE-2026-19382", product: "Almico SpeedFan", driver: "speedfan.sys" },
] as const;

export const cveImpacts: { az: string[]; en: string[]; ru: string[] } = {
  az: ["Resursların idarəsi ilə bağlı zəiflik; sistemin sabitliyinə və əlçatanlığına təsir edə bilər.", "Yüksək riskli boşluq; lokal səlahiyyətlərin artırılmasına (privilege escalation) imkan yarada bilər.", "Yaddaş sızması; resursların tükənməsinə və xidmətin dayanmasına səbəb ola bilər."],
  en: ["Resource-management flaw that can affect system stability and availability.", "High-risk flaw that can allow local privilege escalation.", "Memory leak that can exhaust resources and cause denial of service."],
  ru: ["Ошибка управления ресурсами; может повлиять на стабильность и доступность системы.", "Уязвимость высокого риска; может позволить локальное повышение привилегий.", "Утечка памяти; может привести к исчерпанию ресурсов и отказу в обслуживании."],
};
