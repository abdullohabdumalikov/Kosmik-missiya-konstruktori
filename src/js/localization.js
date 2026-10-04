// Localization system for English, Russian, and Uzbek
export const translations = {
  en: {
    // Header & Navigation
    app_title: "Astra Horizon",
    view_designer: "Vehicle Designer",
    view_missions: "Mission Control",
    view_crafting: "Blueprint Board",
    view_flight: "Launch Complex",
    view_records: "Agency Records",
    view_profile: "Director Dossier",
    view_settings: "Settings",
    tier_label: "Tier",
    funds_label: "Funds",
    science_label: "Science",

    // Designer
    designer_title: "Vehicle Designer",
    category_booster: "Boosters",
    category_upper_stage: "Upper Stage",
    category_engine: "Main Engine",
    category_main_tank: "Fuel Tank",
    category_wings: "Fins & Aerodynamics",
    category_nose: "Fairing & Nose",
    category_payload: "Payload",
    
    supplementary_booster: "Supplementary Booster",
    booster_none: "None",
    booster_2x: "2x SRBs",
    booster_4x: "4x SRBs",
    select_part: "Equip Component",
    selected_badge: "EQUIPPED",
    rocket_name_placeholder: "Enter Rocket Name...",
    
    stats_mass: "Mass",
    stats_thrust: "Thrust",
    stats_reliability: "Reliability",
    stats_fuel: "Fuel Capacity",
    stats_burn_rate: "Burn Rate",
    stats_build_time: "Build Time",
    stats_cost: "Cost",
    stats_months: "Months",
    
    summary_payload: "PAYLOAD",
    summary_upper_stage: "UPPER STAGE",
    summary_booster: "BOOSTER STAGE",
    summary_minimum: "Minimum",
    summary_target_orbit: "Target Orbit",
    summary_launchpad: "Medium Launchpad",
    summary_launch_reliability: "Launch Reliability",
    summary_total_cost: "Total Build Cost",
    btn_plan_launch: "AUTHORIZE & LAUNCH",
    btn_save_design: "SAVE DESIGN",

    // Crafting / Blueprint Board
    crafting_title: "Rocket Engineering & Blueprint Board",
    crafting_subtitle: "Combine 4 identical components of the same level to engineer a Tier+1 upgraded component.",
    crafting_filter_all: "All Components",
    crafting_slot_empty: "Select 4 matching parts to fuse",
    crafting_btn_fuse: "FUSE 4-TO-1 UPGRADE",
    crafting_level_max: "MAX LEVEL (LV 5)",
    crafting_need_more: "Need {count} more to upgrade",
    crafting_ready: "Ready to Upgrade!",
    crafting_success: "ENGINEERING BREAKTHROUGH!",
    crafting_upgraded_to: "Upgraded to Level {level} {rarity}!",

    // Missions
    missions_title: "Space Exploration Contracts",
    mission_active: "CURRENT MISSION",
    mission_completed: "ACCOMPLISHED",
    mission_select: "SELECT CONTRACT",
    mission_req_altitude: "Target Altitude",
    mission_req_payload: "Payload Required",
    mission_reward_funds: "Contract Bounty",
    mission_reward_science: "Science Yield",

    // Flight HUD & Simulation
    hud_altitude: "ALTITUDE",
    hud_max_altitude: "MAX ALTITUDE",
    hud_speed: "SPEED",
    hud_fuel: "STAGE FUEL",
    hud_thrust: "THRUST",
    hud_stability: "STABILITY",
    hud_integrity: "INTEGRITY",
    hud_stage: "ACTIVE STAGE",
    hud_controls_guide: "A / ◄ STEER LEFT   ·   D / ► STEER RIGHT   ·   SPACE BOOST",
    hud_countdown_ready: "SYSTEMS NOMINAL",
    hud_countdown_ignition: "MAIN ENGINE IGNITION!",
    hud_stage_separation: "STAGE {stage} SEPARATION CONFIRMED!",
    hud_boost_active: "OXIDIZER BOOST ENGAGED",
    hud_new_record_banner: "🏆 NEW ALTITUDE RECORD!",
    hud_record_flag: "RECORD",
    
    // Altitude Zones
    zone_1: "Zone 1 · Launch Complex & Troposphere",
    zone_2: "Zone 2 · Lower Atmosphere & Cloud Layer",
    zone_3: "Zone 3 · Upper Atmosphere & Jet Stream",
    zone_4: "Zone 4 · Stratosphere & Ozone Boundary",
    zone_5: "Zone 5 · Mesosphere & Atmospheric Blue Limb",
    zone_6: "Zone 6 · Kármán Line & Near Space Boundary",
    zone_7: "Zone 7 · Low Earth Orbit & Debris Field",
    zone_8: "Zone 8 · High Orbital Exosphere & Lunar Horizon",
    zone_9: "Zone 9 · Deep Space Void & Asteroid Belt",
    zone_10: "Zone 10 · Interplanetary Void & Cosmic Expanse",

    // Flight Debriefing Modal
    debrief_title: "MISSION DEBRIEFING",
    debrief_altitude: "Peak Altitude Reached",
    debrief_flight_time: "Flight Duration",
    debrief_top_speed: "Maximum Speed",
    debrief_bounty: "Mission Rewards",
    debrief_science: "Science Discovered",
    debrief_discovery: "SALVAGED COMPONENT DISCOVERY!",
    debrief_no_discovery: "No salvage recovered on this trajectory.",
    debrief_btn_continue: "RETURN TO MISSION CONTROL",

    // Records
    records_title: "Flight Records & Milestones",
    record_best_altitude: "Highest Altitude Achieved",
    record_longest_flight: "Longest Sustained Flight",
    record_top_speed: "Absolute Speed Record",
    record_total_launches: "Total Launches Initiated",
    record_success_rate: "Mission Success Rate",
    record_best_rocket: "Most Decorated Vehicle",
    records_milestones_title: "Altitude Milestone Markers",

    // Profile & Auth
    profile_title: "Director Dossier",
    profile_username: "Director Callsign",
    profile_agency: "Space Agency Name",
    profile_level: "Agency Clearance Level",
    profile_save_btn: "Update Dossier",
    auth_login_title: "Director Authorization",
    auth_register_title: "Commission New Space Agency",
    auth_btn_login: "Access Terminal",
    auth_btn_register: "Commission Agency",
    auth_btn_guest: "Quick Launch as Guest",
    auth_logout: "Sign Out",
    auth_switch_to_register: "Need to establish a new space program? Register here",
    auth_switch_to_login: "Already have agency credentials? Login here",

    // Settings
    settings_title: "Agency Operations Settings",
    settings_language: "Interface Language",
    settings_sound: "Sound Effects Volume",
    settings_music: "Atmospheric Audio Volume",
    settings_graphics: "Simulation Visual Fidelity",
    settings_btn_reset: "Reset Interface Settings",
    settings_controls_info: "Steering: A / D or Arrow Keys. Boost: Spacebar. Escape / P to pause simulation.",

    // General Rarities
    rarity_common: "Standard",
    rarity_uncommon: "Advanced",
    rarity_rare: "Prototype",
    rarity_epic: "Military-Spec",
    rarity_legendary: "Experimental"
  },

  ru: {
    // Header & Navigation
    app_title: "Astra Horizon",
    view_designer: "Конструктор ракет",
    view_missions: "Центр управления",
    view_crafting: "Чертёжный стол",
    view_flight: "Стартовый комплекс",
    view_records: "Рекорды агентства",
    view_profile: "Досье директора",
    view_settings: "Настройки",
    tier_label: "Ранг",
    funds_label: "Бюджет",
    science_label: "Наука",

    // Designer
    designer_title: "Конструктор ракет",
    category_booster: "Ускорители",
    category_upper_stage: "Верхняя ступень",
    category_engine: "Главный двигатель",
    category_main_tank: "Топливный бак",
    category_wings: "Крылья и стабилизаторы",
    category_nose: "Обтекатель и нос",
    category_payload: "Полезная нагрузка",
    
    supplementary_booster: "Дополнительные ускорители",
    booster_none: "Нет",
    booster_2x: "2x ТТУ",
    booster_4x: "4x ТТУ",
    select_part: "Установить деталь",
    selected_badge: "УСТАНОВЛЕНО",
    rocket_name_placeholder: "Название ракеты...",
    
    stats_mass: "Масса",
    stats_thrust: "Тяга",
    stats_reliability: "Надёжность",
    stats_fuel: "Запас топлива",
    stats_burn_rate: "Расход топлива",
    stats_build_time: "Срок сборки",
    stats_cost: "Стоимость",
    stats_months: "мес.",
    
    summary_payload: "ПОЛЕЗНАЯ НАГРУЗКА",
    summary_upper_stage: "ВЕРХНЯЯ СТУПЕНЬ",
    summary_booster: "ПЕРВАЯ СТУПЕНЬ",
    summary_minimum: "Минимум",
    summary_target_orbit: "Целевая орбита",
    summary_launchpad: "Средний стартовый стол",
    summary_launch_reliability: "Надёжность запуска",
    summary_total_cost: "Итоговая стоимость",
    btn_plan_launch: "УТВЕРДИТЬ И ЗАПУСТИТЬ",
    btn_save_design: "СОХРАНИТЬ ПРОЕКТ",

    // Crafting / Blueprint Board
    crafting_title: "Инженерный чертёжный стол",
    crafting_subtitle: "Объединяйте 4 одинаковые детали одного уровня для создания детали более высокого уровня.",
    crafting_filter_all: "Все компоненты",
    crafting_slot_empty: "Выберите 4 одинаковые детали",
    crafting_btn_fuse: "МОДЕРНИЗИРОВАТЬ 4 В 1",
    crafting_level_max: "МАКСИМАЛЬНЫЙ УРОВЕНЬ (УР 5)",
    crafting_need_more: "Требуется ещё {count} шт.",
    crafting_ready: "Готово к модернизации!",
    crafting_success: "ИНЖЕНЕРНЫЙ ПРОРЫВ!",
    crafting_upgraded_to: "Улучшено до Уровня {level} ({rarity})!",

    // Missions
    missions_title: "Космические контракты и миссии",
    mission_active: "ТЕКУЩИЙ КОНТРАКТ",
    mission_completed: "ВЫПОЛНЕНО",
    mission_select: "ВЫБРАТЬ КОНТРАКТ",
    mission_req_altitude: "Целевая высота",
    mission_req_payload: "Требуемая нагрузка",
    mission_reward_funds: "Награда за контракт",
    mission_reward_science: "Научные очки",

    // Flight HUD & Simulation
    hud_altitude: "ВЫСОТА",
    hud_max_altitude: "МАКС. ВЫСОТА",
    hud_speed: "СКОРОСТЬ",
    hud_fuel: "ТОПЛИВО СТУПЕНИ",
    hud_thrust: "ТЯГА",
    hud_stability: "СТАБИЛЬНОСТЬ",
    hud_integrity: "ПРОЧНОСТЬ",
    hud_stage: "АКТИВНАЯ СТУПЕНЬ",
    hud_controls_guide: "A / ◄ ВЛЕВО   ·   D / ► ВПРАВО   ·   ПРОБЕЛ ФОРСАЖ",
    hud_countdown_ready: "СИСТЕМЫ В НОРМЕ",
    hud_countdown_ignition: "ЗАЖИГАНИЕ ДВИГАТЕЛЕЙ!",
    hud_stage_separation: "ОТДЕЛЕНИЕ СТУПЕНИ {stage} ПОДТВЕРЖДЕНО!",
    hud_boost_active: "КИСЛОРОДНЫЙ ФОРСАЖ ВКЛЮЧЁН",
    hud_new_record_banner: "🏆 НОВЫЙ РЕКОРД ВЫСОТЫ!",
    hud_record_flag: "РЕКОРД",
    
    // Altitude Zones
    zone_1: "Зона 1 · Стартовый комплекс и тропосфера",
    zone_2: "Зона 2 · Нижняя атмосфера и облака",
    zone_3: "Зона 3 · Верхняя атмосфера и струйные течения",
    zone_4: "Зона 4 · Стратосфера и озоновый слой",
    zone_5: "Зона 5 · Мезосфера и свечение атмосферы",
    zone_6: "Зона 6 · Линия Кармана и ближний космос",
    zone_7: "Зона 7 · Низкая околоземная орбита",
    zone_8: "Зона 8 · Высокая орбита и лунный горизонт",
    zone_9: "Зона 9 · Глубокий космос и пояс астероидов",
    zone_10: "Зона 10 · Межпланетный вакуум и просторы галактики",

    // Flight Debriefing Modal
    debrief_title: "ОТЧЁТ О ЗАПУСКЕ",
    debrief_altitude: "Достигнутая высота",
    debrief_flight_time: "Время полёта",
    debrief_top_speed: "Максимальная скорость",
    debrief_bounty: "Получено средств",
    debrief_science: "Научные данные",
    debrief_discovery: "ОБНАРУЖЕНА РЕДКАЯ ДЕТАЛЬ!",
    debrief_no_discovery: "На этой траектории ценных находок нет.",
    debrief_btn_continue: "ВЕРНУТЬСЯ В ЦЕНТР УПРАВЛЕНИЯ",

    // Records
    records_title: "Рекорды и достижения",
    record_best_altitude: "Рекорд высоты полета",
    record_longest_flight: "Самый долгий полет",
    record_top_speed: "Абсолютный рекорд скорости",
    record_total_launches: "Всего запусков",
    record_success_rate: "Успешность миссий",
    record_best_rocket: "Лучший ракетоноситель",
    records_milestones_title: "Высотные вехи",

    // Profile & Auth
    profile_title: "Личное дело директора",
    profile_username: "Позывной директора",
    profile_agency: "Название космического агентства",
    profile_level: "Уровень допуска",
    profile_save_btn: "Сохранить профиль",
    auth_login_title: "Авторизация директора",
    auth_register_title: "Создать космическую программу",
    auth_btn_login: "Войти в систему",
    auth_btn_register: "Учредить агентство",
    auth_btn_guest: "Быстрый старт (Гость)",
    auth_logout: "Выйти из системы",
    auth_switch_to_register: "Новое агентство? Зарегистрируйтесь здесь",
    auth_switch_to_login: "Уже есть учетная запись? Войдите",

    // Settings
    settings_title: "Параметры агентства",
    settings_language: "Язык интерфейса",
    settings_sound: "Громкость эффектов",
    settings_music: "Громкость фоновой музыки",
    settings_graphics: "Качество графики",
    settings_btn_reset: "Сбросить локальные настройки",
    settings_controls_info: "Управление: A / D или Стрелки. Форсаж: Пробел. Пауза: Esc / P.",

    // General Rarities
    rarity_common: "Стандартный",
    rarity_uncommon: "Улучшенный",
    rarity_rare: "Прототип",
    rarity_epic: "Спецзаказ",
    rarity_legendary: "Экспериментальный"
  },

  uz: {
    // Header & Navigation
    app_title: "Astra Horizon",
    view_designer: "Raketa Konstruktori",
    view_missions: "Boshqaruv Markazi",
    view_crafting: "Chizma Stoli",
    view_flight: "Uchirish Maydoni",
    view_records: "Agentlik Rekordlari",
    view_profile: "Direktor Fayli",
    view_settings: "Sozlamalar",
    tier_label: "Daraja",
    funds_label: "Byudjet",
    science_label: "Ilm-fan",

    // Designer
    designer_title: "Raketa Konstruktori",
    category_booster: "Tezlatkichlar",
    category_upper_stage: "Yuqori Bosqich",
    category_engine: "Asosiy Dvigatel",
    category_main_tank: "Yoqilg'i Baki",
    category_wings: "Qanotlar va Stabilizator",
    category_nose: "Bosh Qism (Fairing)",
    category_payload: "Foydali Yuk",
    
    supplementary_booster: "Qo'shimcha Tezlatkichlar",
    booster_none: "Yo'q",
    booster_2x: "2x Qattiq Yoqilg'ili",
    booster_4x: "4x Qattiq Yoqilg'ili",
    select_part: "Qismni O'rnatish",
    selected_badge: "O'RNATILGAN",
    rocket_name_placeholder: "Raketa nomini kiriting...",
    
    stats_mass: "Og'irlik",
    stats_thrust: "Tortish Kuchi",
    stats_reliability: "Ishonchlilik",
    stats_fuel: "Yoqilg'i Sig'imi",
    stats_burn_rate: "Sarflanish",
    stats_build_time: "Yig'ish Vaqti",
    stats_cost: "Narxi",
    stats_months: "oy",
    
    summary_payload: "FOYDALI YUK",
    summary_upper_stage: "YUQORI BOSQICH",
    summary_booster: "ASOSIY BOSQICH",
    summary_minimum: "Minimal",
    summary_target_orbit: "Mo'ljal Orbitasi",
    summary_launchpad: "O'rtacha Uchirish Maydoni",
    summary_launch_reliability: "Uchirish Ishonchliligi",
    summary_total_cost: "Umumiy Narx",
    btn_plan_launch: "TASDIQLASH VA UCHIRISH",
    btn_save_design: "LOYIHANI SAQLASH",

    // Crafting / Blueprint Board
    crafting_title: "Muhandislik va Chizma Stoli",
    crafting_subtitle: "Yuqoriroq darajadagi qism yaratish uchun bir xil darajadagi 4 ta qismni birlashtiring.",
    crafting_filter_all: "Barcha Qismlar",
    crafting_slot_empty: "4 ta bir xil qismni tanlang",
    crafting_btn_fuse: "4 NI 1 GA BIRLASHTIRISH",
    crafting_level_max: "MAKSIMAL DARAJA (LV 5)",
    crafting_need_more: "Yana {count} ta kerak",
    crafting_ready: "Yangilanishga tayyor!",
    crafting_success: "MUHANDISLIK YUTUG'I!",
    crafting_upgraded_to: "{level}-Darajaga ({rarity}) yangilandi!",

    // Missions
    missions_title: "Koinot Vazifalari va Shartnomalar",
    mission_active: "JORIY VAZIFA",
    mission_completed: "BAJARILDI",
    mission_select: "SHARTNOMANI TANLASH",
    mission_req_altitude: "Maqsadli Balandlik",
    mission_req_payload: "Kerakli Yuk",
    mission_reward_funds: "Mukofot Puli",
    mission_reward_science: "Ilmiy Ballar",

    // Flight HUD & Simulation
    hud_altitude: "BALANDLIK",
    hud_max_altitude: "MAKS. BALANDLIK",
    hud_speed: "TEZLIK",
    hud_fuel: "BOSQICH YOQILG'ISI",
    hud_thrust: "TORTISH",
    hud_stability: "BARQARORLIK",
    hud_integrity: "BUTUNLIK",
    hud_stage: "FAOL BOSQICH",
    hud_controls_guide: "A / ◄ CHAPGA   ·   D / ► O'NGGA   ·   BO'SH JOY TEZLASH",
    hud_countdown_ready: "TIZIMLAR TAYYOR",
    hud_countdown_ignition: "ASOSIY DVIGATEL O'T OLDI!",
    hud_stage_separation: "{stage}-BOSQICH AJRATILDI!",
    hud_boost_active: "FORSAJ YOQILDI",
    hud_new_record_banner: "🏆 YANGI BALANDLIK REKORDI!",
    hud_record_flag: "REKORD",
    
    // Altitude Zones
    zone_1: "1-Zona · Uchirish Maydoni va Troposfera",
    zone_2: "2-Zona · Quyi Atmosfera va Bulutlar",
    zone_3: "3-Zona · Yuqori Atmosfera va Shamol Oqimlari",
    zone_4: "4-Zona · Stratosfera va Ozon Qatlami",
    zone_5: "5-Zona · Mezosfera va Moviy Chegara",
    zone_6: "6-Zona · Karman Chizig'i va Yaqin Koinot",
    zone_7: "7-Zona · Quyi Yer Orbitasi va Chiqindilar",
    zone_8: "8-Zona · Yuqori Orbita va Oy Ufq chizig'i",
    zone_9: "9-Zona · Chuqur Koinot va Asteroidlar",
    zone_10: "10-Zona · Sayyoralararo Bo'shliq va Galaktika",

    // Flight Debriefing Modal
    debrief_title: "PARVOZ HISOBOTI",
    debrief_altitude: "Erishilgan Balandlik",
    debrief_flight_time: "Parvoz Davomiyligi",
    debrief_top_speed: "Eng Yuqori Tezlik",
    debrief_bounty: "Qo'lga Kiritilgan Mablag'",
    debrief_science: "Ilmiy Ma'lumotlar",
    debrief_discovery: "NOYOB QISM TOPILDI!",
    debrief_no_discovery: "Ushbu parvozda yangi qismlar topilmadi.",
    debrief_btn_continue: "BOSHQARUVGA QAYTISH",

    // Records
    records_title: "Parvoz Rekordlari",
    record_best_altitude: "Eng Yuqori Balandlik",
    record_longest_flight: "Eng Uzoq Parvoz",
    record_top_speed: "Eng Katta Tezlik",
    record_total_launches: "Jami Uchirishlar",
    record_success_rate: "Muvaffaqiyat Foizi",
    record_best_rocket: "Eng Yaxshi Raketa",
    records_milestones_title: "Balandlik Marralari",

    // Profile & Auth
    profile_title: "Direktor Dossyesi",
    profile_username: "Direktor Chaqiruv Nomi",
    profile_agency: "Koinot Agentligi Nomi",
    profile_level: "Ruxsat Darajasi",
    profile_save_btn: "Dossyeni Saqlash",
    auth_login_title: "Direktor Kirishi",
    auth_register_title: "Yangi Dastur Ochish",
    auth_btn_login: "Tizimga Kirish",
    auth_btn_register: "Dasturni Ro'yxatdan O'tkazish",
    auth_btn_guest: "Tezkor Kirish (Mehmon)",
    auth_logout: "Tizimdan Chiqish",
    auth_switch_to_register: "Yangi dastur ochmoqchimisiz? Ro'yxatdan o'ting",
    auth_switch_to_login: "Hisobingiz bormi? Kiring",

    // Settings
    settings_title: "Agentlik Sozlamalari",
    settings_language: "Interfeys Tili",
    settings_sound: "Tovush Balandligi",
    settings_music: "Musiqa Balandligi",
    settings_graphics: "Grafika Sifati",
    settings_btn_reset: "Sozlamalarni Qaytarish",
    settings_controls_info: "Boshqarish: A / D yoki Yo'nalish tugmalari. Forsaj: Bo'sh joy (Space). To'xtatish: Esc / P.",

    // General Rarities
    rarity_common: "Oddiy",
    rarity_uncommon: "Ilg'or",
    rarity_rare: "Prototip",
    rarity_epic: "Harbiy Daraja",
    rarity_legendary: "Eksperimental"
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('astra_lang', lang);
    updateDOMTranslations();
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(key, params = {}) {
  const dict = translations[currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return text;
}

export function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.setAttribute('placeholder', t(key));
    }
  });
}
