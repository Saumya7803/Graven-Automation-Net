// Brand and Series configuration for each product category
// This provides precise product categorization based on brand + category

export interface SeriesInfo {
  value: string;
  label: string;
  description?: string;
}

export interface BrandConfig {
  name: string;
  slug: string;
  logo?: string;
  categories: {
    [categorySlug: string]: SeriesInfo[];
  };
}

// Comprehensive brand-series mapping for industrial automation products
export const brandSeriesConfig: Record<string, BrandConfig> = {
  'schneider-electric': {
    name: 'Schneider Electric',
    slug: 'schneider-electric',
    categories: {
      'vfd': [
        { value: 'altivar-12', label: 'Altivar 12 (ATV12)', description: 'Compact drives for simple machines' },
        { value: 'altivar-312', label: 'Altivar 312 (ATV312)', description: 'Speed drives for asynchronous motors' },
        { value: 'altivar-320', label: 'Altivar Machine 320 (ATV320)', description: 'Variable speed drives for machines' },
        { value: 'altivar-340', label: 'Altivar Machine 340 (ATV340)', description: 'High-performance machine drives' },
        { value: 'altivar-600', label: 'Altivar Process 600 (ATV600)', description: 'Process drives for pumps and fans' },
        { value: 'altivar-630', label: 'Altivar Process 630 (ATV630)', description: 'Variable speed drives for process applications' },
        { value: 'altivar-900', label: 'Altivar Process 900 (ATV900)', description: 'High-power process drives' },
        { value: 'altivar-930', label: 'Altivar Machine 930 (ATV930)', description: 'High-performance machine drives' },
        { value: 'altistart-22', label: 'Altistart 22 (ATS22)', description: 'Soft starters' },
        { value: 'altistart-48', label: 'Altistart 48 (ATS48)', description: 'Advanced soft starters' },
      ],
      'plc': [
        { value: 'modicon-m221', label: 'Modicon M221', description: 'Compact logic controller' },
        { value: 'modicon-m241', label: 'Modicon M241', description: 'Performance logic controller' },
        { value: 'modicon-m251', label: 'Modicon M251', description: 'Communication logic controller' },
        { value: 'modicon-m262', label: 'Modicon M262', description: 'Motion & IIoT controller' },
        { value: 'modicon-m340', label: 'Modicon M340', description: 'Mid-range PAC' },
        { value: 'modicon-m580', label: 'Modicon M580', description: 'ePAC for process automation' },
        { value: 'zelio-logic', label: 'Zelio Logic', description: 'Smart relays' },
      ],
      'hmi': [
        { value: 'magelis-gto', label: 'Magelis GTO', description: 'Optimum touchscreen panels' },
        { value: 'magelis-gtu', label: 'Magelis GTU', description: 'Universal touchscreen panels' },
        { value: 'magelis-sto', label: 'Magelis STO', description: 'Small touchscreen panels' },
        { value: 'magelis-xbt', label: 'Magelis XBT', description: 'Advanced touchscreen panels' },
        { value: 'harmony-ipc', label: 'Harmony IPC', description: 'Industrial PCs' },
      ],
      'motor': [
        { value: 'tesys', label: 'TeSys Motor Starters', description: 'Motor control and protection' },
        { value: 'lexium', label: 'Lexium Servo Motors', description: 'Servo motor systems' },
      ],
      'relay': [
        { value: 'zelio-relay', label: 'Zelio Relay', description: 'Industrial relays' },
        { value: 'harmony-relay', label: 'Harmony Relay', description: 'Universal relays' },
      ],
    },
  },

  'siemens': {
    name: 'Siemens',
    slug: 'siemens',
    categories: {
      'vfd': [
        { value: 'sinamics-v20', label: 'SINAMICS V20', description: 'Basic performance converter' },
        { value: 'sinamics-g110', label: 'SINAMICS G110', description: 'Entry-level drives' },
        { value: 'sinamics-g120', label: 'SINAMICS G120', description: 'Modular frequency converter' },
        { value: 'sinamics-g120c', label: 'SINAMICS G120C', description: 'Compact frequency converter' },
        { value: 'sinamics-g120x', label: 'SINAMICS G120X', description: 'Infrastructure drives' },
        { value: 'sinamics-s110', label: 'SINAMICS S110', description: 'Positioning drives' },
        { value: 'sinamics-s120', label: 'SINAMICS S120', description: 'High-performance drives' },
        { value: 'sinamics-s210', label: 'SINAMICS S210', description: 'Servo drive system' },
        { value: 'micromaster-420', label: 'MICROMASTER 420', description: 'Legacy basic drives' },
        { value: 'micromaster-440', label: 'MICROMASTER 440', description: 'Legacy variable speed drives' },
      ],
      'plc': [
        { value: 's7-200', label: 'SIMATIC S7-200', description: 'Micro PLC' },
        { value: 's7-200-smart', label: 'SIMATIC S7-200 SMART', description: 'Smart micro PLC' },
        { value: 's7-300', label: 'SIMATIC S7-300', description: 'Modular PLC' },
        { value: 's7-400', label: 'SIMATIC S7-400', description: 'High-end PLC' },
        { value: 's7-1200', label: 'SIMATIC S7-1200', description: 'Compact controller' },
        { value: 's7-1500', label: 'SIMATIC S7-1500', description: 'Advanced controller' },
        { value: 'logo', label: 'LOGO!', description: 'Logic module' },
      ],
      'hmi': [
        { value: 'basic-panel', label: 'SIMATIC Basic Panel', description: 'Entry-level HMI' },
        { value: 'comfort-panel', label: 'SIMATIC Comfort Panel', description: 'High-performance HMI' },
        { value: 'unified-comfort', label: 'SIMATIC Unified Comfort Panel', description: 'Next-gen HMI' },
        { value: 'mobile-panel', label: 'SIMATIC Mobile Panel', description: 'Wireless HMI' },
        { value: 'ktp-series', label: 'KTP Series', description: 'Key touch panels' },
      ],
      'motor': [
        { value: 'simotics-gp', label: 'SIMOTICS GP', description: 'General purpose motors' },
        { value: 'simotics-sd', label: 'SIMOTICS SD', description: 'Severe duty motors' },
        { value: 'simotics-s', label: 'SIMOTICS S', description: 'Servomotors' },
      ],
      'relay': [
        { value: 'sirius', label: 'SIRIUS Relays', description: 'Industrial switching devices' },
      ],
    },
  },

  'abb': {
    name: 'ABB',
    slug: 'abb',
    categories: {
      'vfd': [
        { value: 'acs310', label: 'ACS310', description: 'HVAC drives' },
        { value: 'acs355', label: 'ACS355', description: 'General purpose drives' },
        { value: 'acs380', label: 'ACS380', description: 'Machinery drives' },
        { value: 'acs480', label: 'ACS480', description: 'General purpose drives' },
        { value: 'acs580', label: 'ACS580', description: 'General purpose drives' },
        { value: 'acs800', label: 'ACS800', description: 'Industrial drives' },
        { value: 'acs880', label: 'ACS880', description: 'Industrial drives' },
        { value: 'ach580', label: 'ACH580', description: 'HVAC drives' },
        { value: 'acq580', label: 'ACQ580', description: 'Water and wastewater drives' },
      ],
      'plc': [
        { value: 'ac500', label: 'AC500', description: 'Scalable PLC' },
        { value: 'ac500-eco', label: 'AC500-eCo', description: 'Compact PLC' },
        { value: 'freelance', label: 'Freelance', description: 'Distributed control system' },
      ],
      'hmi': [
        { value: 'cp600', label: 'CP600', description: 'Control panels' },
        { value: 'cp600-eco', label: 'CP600-eCo', description: 'Compact control panels' },
      ],
      'motor': [
        { value: 'ie2-motors', label: 'IE2 Motors', description: 'High efficiency motors' },
        { value: 'ie3-motors', label: 'IE3 Motors', description: 'Premium efficiency motors' },
        { value: 'ie4-motors', label: 'IE4 Motors', description: 'Super premium motors' },
      ],
      'relay': [
        { value: 'cr-range', label: 'CR Range', description: 'Interface relays' },
      ],
    },
  },

  'allen-bradley': {
    name: 'Allen Bradley (Rockwell)',
    slug: 'allen-bradley',
    categories: {
      'vfd': [
        { value: 'powerflex-4', label: 'PowerFlex 4', description: 'Component class drives' },
        { value: 'powerflex-40', label: 'PowerFlex 40', description: 'Component class drives' },
        { value: 'powerflex-400', label: 'PowerFlex 400', description: 'Fan and pump drives' },
        { value: 'powerflex-523', label: 'PowerFlex 523', description: 'Compact drives' },
        { value: 'powerflex-525', label: 'PowerFlex 525', description: 'Compact drives' },
        { value: 'powerflex-527', label: 'PowerFlex 527', description: 'Motion drives' },
        { value: 'powerflex-700', label: 'PowerFlex 700', description: 'AC drives' },
        { value: 'powerflex-753', label: 'PowerFlex 753', description: 'AC drives' },
        { value: 'powerflex-755', label: 'PowerFlex 755', description: 'High-performance drives' },
      ],
      'plc': [
        { value: 'micrologix', label: 'MicroLogix', description: 'Micro PLCs' },
        { value: 'compactlogix', label: 'CompactLogix', description: 'Mid-range controllers' },
        { value: 'controllogix', label: 'ControlLogix', description: 'Large-scale controllers' },
        { value: 'micro800', label: 'Micro800', description: 'Smart micro PLCs' },
        { value: 'micro850', label: 'Micro850', description: 'Enhanced micro PLCs' },
      ],
      'hmi': [
        { value: 'panelview-plus', label: 'PanelView Plus', description: 'Graphic terminals' },
        { value: 'panelview-800', label: 'PanelView 800', description: 'Compact HMI' },
        { value: 'panelview-5000', label: 'PanelView 5000', description: 'Next-gen HMI' },
      ],
      'relay': [
        { value: 'bulletin-700', label: 'Bulletin 700', description: 'Industrial relays' },
      ],
    },
  },

  'mitsubishi': {
    name: 'Mitsubishi Electric',
    slug: 'mitsubishi',
    categories: {
      'vfd': [
        { value: 'fr-d700', label: 'FR-D700', description: 'Compact inverters' },
        { value: 'fr-e700', label: 'FR-E700', description: 'General purpose inverters' },
        { value: 'fr-e800', label: 'FR-E800', description: 'Compact general purpose inverters' },
        { value: 'fr-a700', label: 'FR-A700', description: 'Advanced inverters' },
        { value: 'fr-a800', label: 'FR-A800', description: 'High-performance inverters' },
        { value: 'fr-f800', label: 'FR-F800', description: 'Fan and pump inverters' },
      ],
      'plc': [
        { value: 'fx5', label: 'MELSEC iQ-F (FX5)', description: 'Compact PLCs' },
        { value: 'fx3', label: 'MELSEC FX3', description: 'Micro PLCs' },
        { value: 'iq-r', label: 'MELSEC iQ-R', description: 'Modular PLCs' },
        { value: 'q-series', label: 'MELSEC Q Series', description: 'Multi-CPU PLCs' },
        { value: 'l-series', label: 'MELSEC L Series', description: 'Compact modular PLCs' },
      ],
      'hmi': [
        { value: 'got2000', label: 'GOT2000 Series', description: 'Graphic operation terminal' },
        { value: 'got-simple', label: 'GOT Simple', description: 'Simple HMI' },
        { value: 'gt27', label: 'GT27', description: 'High-performance HMI' },
        { value: 'gt25', label: 'GT25', description: 'Wide screen HMI' },
      ],
      'motor': [
        { value: 'sf-jr', label: 'SF-JR Series', description: 'Standard motors' },
        { value: 'sf-pr', label: 'SF-PR Series', description: 'Premium efficiency motors' },
      ],
    },
  },

  'delta': {
    name: 'Delta Electronics',
    slug: 'delta',
    categories: {
      'vfd': [
        { value: 'vfd-el', label: 'VFD-EL', description: 'Compact AC drives' },
        { value: 'vfd-e', label: 'VFD-E Series', description: 'Sensorless vector drives' },
        { value: 'ms300', label: 'MS300', description: 'Standard drives' },
        { value: 'mh300', label: 'MH300', description: 'High-performance drives' },
        { value: 'c2000', label: 'C2000', description: 'Advanced vector drives' },
        { value: 'c2000-plus', label: 'C2000 Plus', description: 'Enhanced vector drives' },
        { value: 'cp2000', label: 'CP2000', description: 'Premium drives' },
        { value: 'ch2000', label: 'CH2000', description: 'Heavy-duty drives' },
      ],
      'plc': [
        { value: 'dvp-es2', label: 'DVP-ES2', description: 'Slim PLCs' },
        { value: 'dvp-sx2', label: 'DVP-SX2', description: 'High-speed PLCs' },
        { value: 'dvp-ss2', label: 'DVP-SS2', description: 'Standard PLCs' },
        { value: 'dvp-sa2', label: 'DVP-SA2', description: 'Advanced PLCs' },
        { value: 'as-series', label: 'AS Series', description: 'Mid-range PLCs' },
        { value: 'ah-series', label: 'AH Series', description: 'High-end PLCs' },
      ],
      'hmi': [
        { value: 'dop-100', label: 'DOP-100', description: 'Basic HMI' },
        { value: 'dop-b', label: 'DOP-B Series', description: 'Standard HMI' },
        { value: 'dop-w', label: 'DOP-W Series', description: 'Wide screen HMI' },
      ],
      'motor': [
        { value: 'ecmd', label: 'ECMD Series', description: 'Servo motors' },
      ],
    },
  },

  'yaskawa': {
    name: 'Yaskawa',
    slug: 'yaskawa',
    categories: {
      'vfd': [
        { value: 'j1000', label: 'J1000', description: 'Compact drives' },
        { value: 'v1000', label: 'V1000', description: 'Compact vector drives' },
        { value: 'a1000', label: 'A1000', description: 'High-performance drives' },
        { value: 'ga700', label: 'GA700', description: 'Industrial drives' },
        { value: 'ga800', label: 'GA800', description: 'Premium drives' },
        { value: 'u1000', label: 'U1000', description: 'Matrix drives' },
      ],
      'plc': [
        { value: 'mp3000', label: 'MP3000', description: 'Machine controllers' },
        { value: 'sigma-7', label: 'Sigma-7', description: 'Servo systems' },
      ],
    },
  },

  'danfoss': {
    name: 'Danfoss',
    slug: 'danfoss',
    categories: {
      'vfd': [
        { value: 'vlt-micro', label: 'VLT Micro Drive (FC 51)', description: 'Compact drives' },
        { value: 'vlt-hvac', label: 'VLT HVAC Drive (FC 102)', description: 'HVAC drives' },
        { value: 'vlt-aqua', label: 'VLT AQUA Drive (FC 202)', description: 'Water drives' },
        { value: 'vlt-automation', label: 'VLT AutomationDrive (FC 302)', description: 'Universal drives' },
        { value: 'vlt-decentral', label: 'VLT Decentral (FCD 302)', description: 'Distributed drives' },
        { value: 'vacon-100', label: 'VACON 100', description: 'Industrial drives' },
        { value: 'vacon-100x', label: 'VACON 100X', description: 'Enclosed drives' },
      ],
    },
  },

  'fuji': {
    name: 'Fuji Electric',
    slug: 'fuji',
    categories: {
      'vfd': [
        { value: 'frenic-mini', label: 'FRENIC-Mini', description: 'Compact inverters' },
        { value: 'frenic-multi', label: 'FRENIC-Multi', description: 'Multi-purpose inverters' },
        { value: 'frenic-ace', label: 'FRENIC-Ace', description: 'High-performance inverters' },
        { value: 'frenic-mega', label: 'FRENIC-MEGA', description: 'High-power inverters' },
        { value: 'frenic-hvac', label: 'FRENIC-HVAC', description: 'HVAC inverters' },
      ],
      'plc': [
        { value: 'micrex-sx', label: 'MICREX-SX', description: 'Programmable controllers' },
        { value: 'micrex-f', label: 'MICREX-F', description: 'Compact PLCs' },
      ],
      'hmi': [
        { value: 'monitouch', label: 'MONITOUCH', description: 'Touch panels' },
      ],
    },
  },

  'omron': {
    name: 'Omron',
    slug: 'omron',
    categories: {
      'plc': [
        { value: 'cp1', label: 'CP1 Series', description: 'Compact PLCs' },
        { value: 'cj2', label: 'CJ2 Series', description: 'Modular PLCs' },
        { value: 'nx-series', label: 'NX Series', description: 'Machine automation controllers' },
        { value: 'nj-series', label: 'NJ Series', description: 'Automation controllers' },
      ],
      'hmi': [
        { value: 'na-series', label: 'NA Series', description: 'Industrial PC' },
        { value: 'nb-series', label: 'NB Series', description: 'Programmable terminals' },
        { value: 'ns-series', label: 'NS Series', description: 'Touch screens' },
      ],
      'relay': [
        { value: 'my-series', label: 'MY Series', description: 'General purpose relays' },
        { value: 'g2r-series', label: 'G2R Series', description: 'Power relays' },
        { value: 'g3na', label: 'G3NA', description: 'Solid state relays' },
      ],
    },
  },

  'lenze': {
    name: 'Lenze',
    slug: 'lenze',
    categories: {
      'vfd': [
        { value: 'i500', label: 'i500', description: 'Frequency inverters' },
        { value: 'i550', label: 'i550', description: 'Cabinet inverters' },
        { value: 'i700', label: 'i700', description: 'Servo inverters' },
        { value: 'i950', label: 'i950', description: 'Motion controllers' },
      ],
    },
  },

  'weg': {
    name: 'WEG',
    slug: 'weg',
    categories: {
      'vfd': [
        { value: 'cfw100', label: 'CFW100', description: 'Micro drives' },
        { value: 'cfw300', label: 'CFW300', description: 'Variable speed drives' },
        { value: 'cfw500', label: 'CFW500', description: 'General purpose drives' },
        { value: 'cfw700', label: 'CFW700', description: 'High-performance drives' },
        { value: 'cfw11', label: 'CFW11', description: 'Standard drives' },
      ],
      'motor': [
        { value: 'w22', label: 'W22 Motors', description: 'Premium efficiency motors' },
        { value: 'w60', label: 'W60 Motors', description: 'Severe duty motors' },
      ],
    },
  },

  'teco': {
    name: 'TECO',
    slug: 'teco',
    categories: {
      'vfd': [
        { value: 'e510', label: 'E510', description: 'Sensorless vector drives' },
        { value: 'f510', label: 'F510', description: 'Fan and pump drives' },
        { value: 'a510', label: 'A510', description: 'Advanced vector drives' },
        { value: 'l510', label: 'L510', description: 'Compact drives' },
      ],
      'motor': [
        { value: 'aehf', label: 'AEHF Series', description: 'High efficiency motors' },
        { value: 'aehl', label: 'AEHL Series', description: 'Premium motors' },
      ],
    },
  },

  'phoenix-contact': {
    name: 'Phoenix Contact',
    slug: 'phoenix-contact',
    categories: {
      'relay': [
        { value: 'plc-interface', label: 'PLC Interface Relays', description: 'PLC relay modules' },
        { value: 'rif-series', label: 'RIF Series', description: 'Relay interface modules' },
      ],
      'digital-input-module': [
        { value: 'axioline', label: 'Axioline', description: 'I/O system' },
        { value: 'inline', label: 'Inline', description: 'Modular I/O' },
      ],
      'digital-output-module': [
        { value: 'axioline', label: 'Axioline', description: 'I/O system' },
        { value: 'inline', label: 'Inline', description: 'Modular I/O' },
      ],
    },
  },

  'weidmuller': {
    name: 'Weidmuller',
    slug: 'weidmuller',
    categories: {
      'relay': [
        { value: 'riderseries', label: 'RIDERSERIES', description: 'Relay modules' },
        { value: 'termseries', label: 'TERMSERIES', description: 'Solid state relays' },
      ],
      'analog-input-module': [
        { value: 'u-remote', label: 'u-remote', description: 'Remote I/O' },
      ],
      'analog-output-module': [
        { value: 'u-remote', label: 'u-remote', description: 'Remote I/O' },
      ],
    },
  },

  'wago': {
    name: 'WAGO',
    slug: 'wago',
    categories: {
      'plc': [
        { value: 'pfc100', label: 'PFC100', description: 'Compact controllers' },
        { value: 'pfc200', label: 'PFC200', description: 'Advanced controllers' },
      ],
      'digital-input-module': [
        { value: '750-series', label: '750 Series', description: 'WAGO-I/O-SYSTEM' },
        { value: '753-series', label: '753 Series', description: 'WAGO-I/O-PRO' },
      ],
      'digital-output-module': [
        { value: '750-series', label: '750 Series', description: 'WAGO-I/O-SYSTEM' },
        { value: '753-series', label: '753 Series', description: 'WAGO-I/O-PRO' },
      ],
    },
  },

  'weintek': {
    name: 'Weintek',
    slug: 'weintek',
    categories: {
      'hmi': [
        { value: 'mt8000', label: 'MT8000', description: 'iE Series HMI' },
        { value: 'cmt-series', label: 'cMT Series', description: 'IoT HMI' },
        { value: 'eview', label: 'eView Series', description: 'Standard HMI' },
      ],
    },
  },

  'beijer': {
    name: 'Beijer Electronics',
    slug: 'beijer',
    categories: {
      'hmi': [
        { value: 'ix-series', label: 'iX Series', description: 'HMI panels' },
        { value: 'x2-series', label: 'X2 Series', description: 'Extreme HMI' },
      ],
    },
  },

  'keyence': {
    name: 'Keyence',
    slug: 'keyence',
    categories: {
      'plc': [
        { value: 'kv-series', label: 'KV Series', description: 'Programmable controllers' },
        { value: 'kv-7000', label: 'KV-7000', description: 'High-speed controllers' },
      ],
    },
  },

  'br-automation': {
    name: 'B&R Automation',
    slug: 'br-automation',
    categories: {
      'plc': [
        { value: 'x20', label: 'X20 System', description: 'Modular I/O' },
        { value: 'x67', label: 'X67 System', description: 'IP67 I/O' },
      ],
      'hmi': [
        { value: 'power-panel', label: 'Power Panel', description: 'Panel PCs' },
        { value: 'automation-panel', label: 'Automation Panel', description: 'Industrial displays' },
      ],
    },
  },

  'other': {
    name: 'Other',
    slug: 'other',
    categories: {},
  },
};

// Get all available brands
export const getAllBrands = (): { value: string; label: string }[] => {
  return Object.entries(brandSeriesConfig).map(([slug, config]) => ({
    value: slug,
    label: config.name,
  }));
};

// Get brands available for a specific category
export const getBrandsForCategory = (categorySlug: string): { value: string; label: string }[] => {
  return Object.entries(brandSeriesConfig)
    .filter(([_, config]) => 
      config.categories[categorySlug] && config.categories[categorySlug].length > 0
    )
    .map(([slug, config]) => ({
      value: slug,
      label: config.name,
    }));
};

// Get series for a specific brand and category
export const getSeriesForBrandCategory = (brandSlug: string, categorySlug: string): SeriesInfo[] => {
  const brand = brandSeriesConfig[brandSlug];
  if (!brand || !brand.categories[categorySlug]) {
    return [];
  }
  return brand.categories[categorySlug];
};

// Get brand name from slug
export const getBrandName = (brandSlug: string): string => {
  return brandSeriesConfig[brandSlug]?.name || brandSlug;
};

// Check if a brand has series for a category
export const brandHasCategory = (brandSlug: string, categorySlug: string): boolean => {
  const brand = brandSeriesConfig[brandSlug];
  return brand?.categories[categorySlug]?.length > 0;
};
