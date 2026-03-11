/**
 * Keyword Dictionary for ArbiScanner Phase 2
 * Maps high-value product keywords to estimated resale values.
 */

const KEYWORD_DICTIONARY = [
  // GPUs
  { keyword: "rtx 4090", category: "gpu", average_resale_value: 1600, minimum_expected_price: 1200 },
  { keyword: "rtx 4080", category: "gpu", average_resale_value: 900, minimum_expected_price: 700 },
  { keyword: "rtx 4070 ti", category: "gpu", average_resale_value: 650, minimum_expected_price: 500 },
  { keyword: "rtx 3090", category: "gpu", average_resale_value: 700, minimum_expected_price: 550 },
  { keyword: "rtx 3080", category: "gpu", average_resale_value: 450, minimum_expected_price: 350 },
  { keyword: "rtx 3070", category: "gpu", average_resale_value: 300, minimum_expected_price: 220 },
  { keyword: "rx 7900 xtx", category: "gpu", average_resale_value: 800, minimum_expected_price: 650 },
  
  // Gaming Consoles
  { keyword: "ps5 slim", category: "gaming_console", average_resale_value: 400, minimum_expected_price: 300 },
  { keyword: "playstation 5", category: "gaming_console", average_resale_value: 450, minimum_expected_price: 350 },
  { keyword: "xbox series x", category: "gaming_console", average_resale_value: 350, minimum_expected_price: 250 },
  { keyword: "nintendo switch oled", category: "gaming_console", average_resale_value: 280, minimum_expected_price: 200 },
  { keyword: "steam deck", category: "gaming_console", average_resale_value: 350, minimum_expected_price: 250 },
  
  // Apple Devices
  { keyword: "iphone 15 pro", category: "apple", average_resale_value: 850, minimum_expected_price: 650 },
  { keyword: "iphone 14 pro", category: "apple", average_resale_value: 700, minimum_expected_price: 550 },
  { keyword: "macbook air m1", category: "apple", average_resale_value: 500, minimum_expected_price: 400 },
  { keyword: "macbook air m2", category: "apple", average_resale_value: 750, minimum_expected_price: 600 },
  { keyword: "macbook pro m3", category: "apple", average_resale_value: 1400, minimum_expected_price: 1100 },
  { keyword: "ipad pro m2", category: "apple", average_resale_value: 700, minimum_expected_price: 550 },
  { keyword: "airpods max", category: "apple", average_resale_value: 350, minimum_expected_price: 250 },
  { keyword: "apple watch ultra", category: "apple", average_resale_value: 550, minimum_expected_price: 450 },

  // Camera Gear
  { keyword: "sony a7iv", category: "camera", average_resale_value: 2000, minimum_expected_price: 1600 },
  { keyword: "sony a7 iii", category: "camera", average_resale_value: 1200, minimum_expected_price: 900 },
  { keyword: "canon eos r6", category: "camera", average_resale_value: 1600, minimum_expected_price: 1300 },
  { keyword: "fujifilm x-t5", category: "camera", average_resale_value: 1400, minimum_expected_price: 1100 },
  { keyword: "dji mavic 3", category: "camera", average_resale_value: 1500, minimum_expected_price: 1100 },
  { keyword: "dji mini 4 pro", category: "camera", average_resale_value: 700, minimum_expected_price: 550 },
  { keyword: "gopro hero 12", category: "camera", average_resale_value: 300, minimum_expected_price: 220 },

  // Power Tools
  { keyword: "milwaukee fuel", category: "tools", average_resale_value: 300, minimum_expected_price: 180 },
  { keyword: "dewalt 20v", category: "tools", average_resale_value: 250, minimum_expected_price: 150 },
  { keyword: "makita lxt", category: "tools", average_resale_value: 250, minimum_expected_price: 150 },
  { keyword: "festool", category: "tools", average_resale_value: 500, minimum_expected_price: 350 },
  { keyword: "snap-on", category: "tools", average_resale_value: 400, minimum_expected_price: 200 },

  // Audio Equipment
  { keyword: "bose nc 700", category: "audio", average_resale_value: 220, minimum_expected_price: 150 },
  { keyword: "sony wh-1000xm5", category: "audio", average_resale_value: 280, minimum_expected_price: 200 },
  { keyword: "sonos era 300", category: "audio", average_resale_value: 350, minimum_expected_price: 250 },
  
  // Fitness & Misc
  { keyword: "concept2", category: "fitness", average_resale_value: 800, minimum_expected_price: 600 },
  { keyword: "peloton bike", category: "fitness", average_resale_value: 700, minimum_expected_price: 450 },
  { keyword: "herman miller aeron", category: "furniture", average_resale_value: 600, minimum_expected_price: 350 },
  { keyword: "steelcase gesture", category: "furniture", average_resale_value: 700, minimum_expected_price: 450 },
  { keyword: "secretlab titan", category: "furniture", average_resale_value: 350, minimum_expected_price: 200 },
  
  // Bicycles
  { keyword: "specialized tarmac", category: "bicycle", average_resale_value: 3000, minimum_expected_price: 2000 },
  { keyword: "trek emonda", category: "bicycle", average_resale_value: 2500, minimum_expected_price: 1500 },
  { keyword: "giant tcr", category: "bicycle", average_resale_value: 2000, minimum_expected_price: 1200 }
];

// Configuration
const DEAL_CONFIG = {
  DEAL_THRESHOLD: 150,
  KEYWORD_MATCH_SENSITIVITY: true,
  MAX_KEYWORDS_PER_LISTING: 5
};
