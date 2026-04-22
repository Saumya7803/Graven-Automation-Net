export interface CategoryFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  unit?: string;
  helpText?: string;
}

export interface CategoryConfig {
  name: string;
  slug: string;
  description: string;
  fields: CategoryFieldConfig[];
}

// Map category slugs to their configurations
export const categoryFieldConfigs: Record<string, CategoryConfig> = {
  'vfd': {
    name: 'VFD (Variable Frequency Drive)',
    slug: 'vfd',
    description: 'Motor speed control drives',
    fields: [
      { 
        id: 'power_range', 
        label: 'Power Range', 
        type: 'text', 
        required: true, 
        placeholder: 'e.g., 0.75kW - 315kW',
        helpText: 'Specify the power range this VFD supports'
      },
      { 
        id: 'input_voltage', 
        label: 'Input Voltage', 
        type: 'select', 
        required: true,
        options: [
          { value: '1-phase-230v', label: '1-Phase 230V AC' },
          { value: '3-phase-415v', label: '3-Phase 415V AC' },
          { value: '3-phase-480v', label: '3-Phase 480V AC' },
          { value: '3-phase-690v', label: '3-Phase 690V AC' },
        ]
      },
      { 
        id: 'output_voltage', 
        label: 'Output Voltage', 
        type: 'text', 
        placeholder: 'e.g., 3-Phase 415V AC'
      },
      { 
        id: 'control_mode', 
        label: 'Control Mode', 
        type: 'select',
        options: [
          { value: 'v-f', label: 'V/F Control' },
          { value: 'sensorless-vector', label: 'Sensorless Vector Control' },
          { value: 'closed-loop-vector', label: 'Closed Loop Vector Control' },
          { value: 'servo', label: 'Servo Control' },
        ]
      },
      { 
        id: 'overload_capacity', 
        label: 'Overload Capacity', 
        type: 'text', 
        placeholder: 'e.g., 150% for 60 seconds'
      },
      { 
        id: 'motor_hp', 
        label: 'Motor HP Rating', 
        type: 'text', 
        placeholder: 'e.g., 1HP - 425HP'
      },
    ]
  },
  
  'plc': {
    name: 'PLC (Programmable Logic Controller)',
    slug: 'plc',
    description: 'Industrial automation controllers',
    fields: [
      { 
        id: 'io_points', 
        label: 'I/O Points', 
        type: 'text', 
        required: true, 
        placeholder: 'e.g., 32DI/16DO',
        helpText: 'Total digital and analog I/O points'
      },
      { 
        id: 'memory_size', 
        label: 'Memory Size', 
        type: 'text', 
        placeholder: 'e.g., 1MB Program + 512KB Data'
      },
      { 
        id: 'communication_protocols', 
        label: 'Communication Protocols', 
        type: 'text', 
        placeholder: 'e.g., Modbus RTU, Ethernet/IP, Profinet'
      },
      { 
        id: 'program_capacity', 
        label: 'Program Capacity', 
        type: 'text', 
        placeholder: 'e.g., 128K Steps'
      },
      { 
        id: 'expansion_capability', 
        label: 'Expansion Capability', 
        type: 'text', 
        placeholder: 'e.g., Up to 8 expansion modules'
      },
      { 
        id: 'plc_type', 
        label: 'PLC Type', 
        type: 'select',
        options: [
          { value: 'compact', label: 'Compact PLC' },
          { value: 'modular', label: 'Modular PLC' },
          { value: 'rack-mounted', label: 'Rack Mounted PLC' },
          { value: 'micro', label: 'Micro PLC' },
        ]
      },
    ]
  },
  
  'hmi': {
    name: 'HMI (Human Machine Interface)',
    slug: 'hmi',
    description: 'Touch panel displays for machine control',
    fields: [
      { 
        id: 'screen_size', 
        label: 'Screen Size', 
        type: 'select', 
        required: true,
        options: [
          { value: '4-inch', label: '4 inch' },
          { value: '7-inch', label: '7 inch' },
          { value: '10-inch', label: '10 inch' },
          { value: '12-inch', label: '12 inch' },
          { value: '15-inch', label: '15 inch' },
          { value: '21-inch', label: '21 inch' },
        ]
      },
      { 
        id: 'resolution', 
        label: 'Resolution', 
        type: 'text', 
        placeholder: 'e.g., 800x480, 1024x768'
      },
      { 
        id: 'touch_type', 
        label: 'Touch Type', 
        type: 'select',
        options: [
          { value: 'resistive', label: 'Resistive Touch' },
          { value: 'capacitive', label: 'Capacitive Touch' },
          { value: 'non-touch', label: 'Non-Touch (Keys Only)' },
        ]
      },
      { 
        id: 'communication_ports', 
        label: 'Communication Ports', 
        type: 'text', 
        placeholder: 'e.g., RS232, RS485, Ethernet, USB'
      },
      { 
        id: 'display_colors', 
        label: 'Display Colors', 
        type: 'text', 
        placeholder: 'e.g., 65,536 colors (16-bit)'
      },
    ]
  },
  
  'motor': {
    name: 'Motor',
    slug: 'motor',
    description: 'Electric motors for industrial applications',
    fields: [
      { 
        id: 'power_rating', 
        label: 'Power Rating (HP/kW)', 
        type: 'text', 
        required: true, 
        placeholder: 'e.g., 5HP / 3.7kW'
      },
      { 
        id: 'frame_size', 
        label: 'Frame Size', 
        type: 'text', 
        placeholder: 'e.g., D100L, NEMA 56C'
      },
      { 
        id: 'speed_rpm', 
        label: 'Speed (RPM)', 
        type: 'text', 
        placeholder: 'e.g., 1440 RPM, 2880 RPM'
      },
      { 
        id: 'voltage', 
        label: 'Voltage', 
        type: 'text', 
        placeholder: 'e.g., 415V 3-Phase'
      },
      { 
        id: 'enclosure_type', 
        label: 'Enclosure Type', 
        type: 'select',
        options: [
          { value: 'ip55', label: 'IP55 (Dust & Water Protected)' },
          { value: 'ip56', label: 'IP56 (Dust Protected, High Water Jet)' },
          { value: 'ip65', label: 'IP65 (Dust Tight, Water Jet)' },
          { value: 'ip66', label: 'IP66 (Dust Tight, High Pressure Water)' },
          { value: 'ip67', label: 'IP67 (Dust Tight, Immersion)' },
        ]
      },
      { 
        id: 'mounting_type', 
        label: 'Mounting Type', 
        type: 'select',
        options: [
          { value: 'b3', label: 'B3 (Foot Mounted)' },
          { value: 'b5', label: 'B5 (Flange Mounted)' },
          { value: 'b14', label: 'B14 (Face Mounted)' },
          { value: 'b35', label: 'B35 (Foot + Flange)' },
        ]
      },
      { 
        id: 'efficiency_class', 
        label: 'Efficiency Class', 
        type: 'select',
        options: [
          { value: 'ie1', label: 'IE1 (Standard)' },
          { value: 'ie2', label: 'IE2 (High Efficiency)' },
          { value: 'ie3', label: 'IE3 (Premium Efficiency)' },
          { value: 'ie4', label: 'IE4 (Super Premium)' },
        ]
      },
    ]
  },
  
  'relay': {
    name: 'Relay',
    slug: 'relay',
    description: 'Electrical switching relays',
    fields: [
      { 
        id: 'contact_configuration', 
        label: 'Contact Configuration', 
        type: 'select', 
        required: true,
        options: [
          { value: 'spdt', label: 'SPDT (1 C/O)' },
          { value: 'dpdt', label: 'DPDT (2 C/O)' },
          { value: '3pdt', label: '3PDT (3 C/O)' },
          { value: '4pdt', label: '4PDT (4 C/O)' },
          { value: 'spst-no', label: 'SPST-NO' },
          { value: 'spst-nc', label: 'SPST-NC' },
        ]
      },
      { 
        id: 'coil_voltage', 
        label: 'Coil Voltage', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., 24V DC, 230V AC'
      },
      { 
        id: 'current_rating', 
        label: 'Current Rating', 
        type: 'text', 
        placeholder: 'e.g., 10A, 16A'
      },
      { 
        id: 'mounting_type', 
        label: 'Mounting Type', 
        type: 'select',
        options: [
          { value: 'din-rail', label: 'DIN Rail Mount' },
          { value: 'pcb', label: 'PCB Mount' },
          { value: 'socket', label: 'Socket Mount' },
          { value: 'panel', label: 'Panel Mount' },
        ]
      },
      { 
        id: 'relay_type', 
        label: 'Relay Type', 
        type: 'select',
        options: [
          { value: 'electromechanical', label: 'Electromechanical' },
          { value: 'solid-state', label: 'Solid State (SSR)' },
          { value: 'reed', label: 'Reed Relay' },
          { value: 'latching', label: 'Latching Relay' },
        ]
      },
    ]
  },
  
  'digital-input-module': {
    name: 'Digital Input Module',
    slug: 'digital-input-module',
    description: 'Discrete input modules for PLCs and automation',
    fields: [
      { 
        id: 'number_of_channels', 
        label: 'Number of Channels', 
        type: 'select', 
        required: true,
        options: [
          { value: '4', label: '4 Channels' },
          { value: '8', label: '8 Channels' },
          { value: '16', label: '16 Channels' },
          { value: '32', label: '32 Channels' },
          { value: '64', label: '64 Channels' },
        ]
      },
      { 
        id: 'input_voltage_range', 
        label: 'Input Voltage Range', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., 24V DC, 100-240V AC'
      },
      { 
        id: 'isolation_type', 
        label: 'Isolation Type', 
        type: 'select',
        options: [
          { value: 'none', label: 'Non-Isolated' },
          { value: 'channel', label: 'Channel-to-Channel' },
          { value: 'group', label: 'Group Isolation' },
          { value: 'full', label: 'Full Isolation' },
        ]
      },
      { 
        id: 'connection_type', 
        label: 'Connection Type', 
        type: 'select',
        options: [
          { value: 'screw-terminal', label: 'Screw Terminal' },
          { value: 'spring-clamp', label: 'Spring Clamp' },
          { value: 'connector', label: 'Connector Based' },
          { value: 'solder', label: 'Solder Points' },
        ]
      },
      { 
        id: 'input_type', 
        label: 'Input Type', 
        type: 'select',
        options: [
          { value: 'sink', label: 'Sink (NPN)' },
          { value: 'source', label: 'Source (PNP)' },
          { value: 'sink-source', label: 'Sink/Source (Universal)' },
        ]
      },
    ]
  },
  
  'digital-output-module': {
    name: 'Digital Output Module',
    slug: 'digital-output-module',
    description: 'Discrete output modules for PLCs and automation',
    fields: [
      { 
        id: 'number_of_channels', 
        label: 'Number of Channels', 
        type: 'select', 
        required: true,
        options: [
          { value: '4', label: '4 Channels' },
          { value: '8', label: '8 Channels' },
          { value: '16', label: '16 Channels' },
          { value: '32', label: '32 Channels' },
        ]
      },
      { 
        id: 'output_type', 
        label: 'Output Type', 
        type: 'select', 
        required: true,
        options: [
          { value: 'relay', label: 'Relay Output' },
          { value: 'transistor', label: 'Transistor Output' },
          { value: 'triac', label: 'Triac Output' },
          { value: 'ssr', label: 'Solid State Relay' },
        ]
      },
      { 
        id: 'current_per_channel', 
        label: 'Current per Channel', 
        type: 'text', 
        placeholder: 'e.g., 0.5A, 2A'
      },
      { 
        id: 'voltage_rating', 
        label: 'Voltage Rating', 
        type: 'text', 
        placeholder: 'e.g., 24V DC, 230V AC'
      },
      { 
        id: 'isolation_type', 
        label: 'Isolation Type', 
        type: 'select',
        options: [
          { value: 'none', label: 'Non-Isolated' },
          { value: 'channel', label: 'Channel-to-Channel' },
          { value: 'group', label: 'Group Isolation' },
        ]
      },
    ]
  },
  
  'analog-input-module': {
    name: 'Analog Input Module',
    slug: 'analog-input-module',
    description: 'Analog signal input modules',
    fields: [
      { 
        id: 'number_of_channels', 
        label: 'Number of Channels', 
        type: 'select', 
        required: true,
        options: [
          { value: '2', label: '2 Channels' },
          { value: '4', label: '4 Channels' },
          { value: '8', label: '8 Channels' },
          { value: '16', label: '16 Channels' },
        ]
      },
      { 
        id: 'input_type', 
        label: 'Input Type', 
        type: 'select', 
        required: true,
        options: [
          { value: '4-20ma', label: '4-20mA Current' },
          { value: '0-20ma', label: '0-20mA Current' },
          { value: '0-10v', label: '0-10V Voltage' },
          { value: '-10-10v', label: '±10V Voltage' },
          { value: 'thermocouple', label: 'Thermocouple' },
          { value: 'rtd', label: 'RTD (PT100/PT1000)' },
          { value: 'universal', label: 'Universal (Configurable)' },
        ]
      },
      { 
        id: 'resolution', 
        label: 'Resolution (bits)', 
        type: 'select',
        options: [
          { value: '12-bit', label: '12-bit' },
          { value: '14-bit', label: '14-bit' },
          { value: '16-bit', label: '16-bit' },
          { value: '24-bit', label: '24-bit' },
        ]
      },
      { 
        id: 'isolation', 
        label: 'Isolation', 
        type: 'select',
        options: [
          { value: 'none', label: 'Non-Isolated' },
          { value: 'channel', label: 'Channel Isolated' },
          { value: 'group', label: 'Group Isolated' },
        ]
      },
      { 
        id: 'sampling_rate', 
        label: 'Sampling Rate', 
        type: 'text', 
        placeholder: 'e.g., 1ms, 10ms per channel'
      },
    ]
  },
  
  'analog-output-module': {
    name: 'Analog Output Module',
    slug: 'analog-output-module',
    description: 'Analog signal output modules',
    fields: [
      { 
        id: 'number_of_channels', 
        label: 'Number of Channels', 
        type: 'select', 
        required: true,
        options: [
          { value: '2', label: '2 Channels' },
          { value: '4', label: '4 Channels' },
          { value: '8', label: '8 Channels' },
        ]
      },
      { 
        id: 'output_type', 
        label: 'Output Type', 
        type: 'select', 
        required: true,
        options: [
          { value: '4-20ma', label: '4-20mA Current' },
          { value: '0-20ma', label: '0-20mA Current' },
          { value: '0-10v', label: '0-10V Voltage' },
          { value: '-10-10v', label: '±10V Voltage' },
          { value: 'universal', label: 'Universal (Configurable)' },
        ]
      },
      { 
        id: 'resolution', 
        label: 'Resolution', 
        type: 'select',
        options: [
          { value: '12-bit', label: '12-bit' },
          { value: '14-bit', label: '14-bit' },
          { value: '16-bit', label: '16-bit' },
        ]
      },
      { 
        id: 'load_capacity', 
        label: 'Load Capacity', 
        type: 'text', 
        placeholder: 'e.g., 500Ω for current, 10kΩ for voltage'
      },
      { 
        id: 'isolation', 
        label: 'Isolation', 
        type: 'select',
        options: [
          { value: 'none', label: 'Non-Isolated' },
          { value: 'channel', label: 'Channel Isolated' },
        ]
      },
    ]
  },
  
  'genset': {
    name: 'Genset (Generator Set)',
    slug: 'genset',
    description: 'Diesel/gas generator sets for power backup',
    fields: [
      { 
        id: 'power_rating', 
        label: 'Power Rating (kVA/kW)', 
        type: 'text', 
        required: true, 
        placeholder: 'e.g., 500kVA / 400kW'
      },
      { 
        id: 'fuel_type', 
        label: 'Fuel Type', 
        type: 'select', 
        required: true,
        options: [
          { value: 'diesel', label: 'Diesel' },
          { value: 'natural-gas', label: 'Natural Gas' },
          { value: 'lpg', label: 'LPG' },
          { value: 'dual-fuel', label: 'Dual Fuel' },
          { value: 'petrol', label: 'Petrol' },
        ]
      },
      { 
        id: 'phase_configuration', 
        label: 'Phase Configuration', 
        type: 'select',
        options: [
          { value: 'single-phase', label: 'Single Phase' },
          { value: 'three-phase', label: 'Three Phase' },
        ]
      },
      { 
        id: 'engine_make', 
        label: 'Engine Make/Model', 
        type: 'text', 
        placeholder: 'e.g., Cummins QSK60, Perkins 1104'
      },
      { 
        id: 'alternator_make', 
        label: 'Alternator Make', 
        type: 'text', 
        placeholder: 'e.g., Stamford, Leroy Somer'
      },
      { 
        id: 'voltage_output', 
        label: 'Output Voltage', 
        type: 'text', 
        placeholder: 'e.g., 415V 3-Phase'
      },
      { 
        id: 'frequency', 
        label: 'Frequency', 
        type: 'select',
        options: [
          { value: '50hz', label: '50 Hz' },
          { value: '60hz', label: '60 Hz' },
        ]
      },
    ]
  },
  
  'transformer': {
    name: 'Transformer',
    slug: 'transformer',
    description: 'Power and distribution transformers',
    fields: [
      { 
        id: 'power_rating', 
        label: 'Power Rating (kVA)', 
        type: 'text', 
        required: true, 
        placeholder: 'e.g., 1000kVA, 2500kVA'
      },
      { 
        id: 'primary_voltage', 
        label: 'Primary Voltage', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., 11kV, 33kV'
      },
      { 
        id: 'secondary_voltage', 
        label: 'Secondary Voltage', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., 415V, 690V'
      },
      { 
        id: 'cooling_type', 
        label: 'Cooling Type', 
        type: 'select',
        options: [
          { value: 'onan', label: 'ONAN (Oil Natural Air Natural)' },
          { value: 'onaf', label: 'ONAF (Oil Natural Air Forced)' },
          { value: 'ofaf', label: 'OFAF (Oil Forced Air Forced)' },
          { value: 'dry-type', label: 'Dry Type (Air Cooled)' },
        ]
      },
      { 
        id: 'winding_material', 
        label: 'Winding Material', 
        type: 'select',
        options: [
          { value: 'copper', label: 'Copper' },
          { value: 'aluminum', label: 'Aluminum' },
        ]
      },
      { 
        id: 'tap_changer', 
        label: 'Tap Changer', 
        type: 'select',
        options: [
          { value: 'off-load', label: 'Off-Load Tap Changer' },
          { value: 'on-load', label: 'On-Load Tap Changer (OLTC)' },
          { value: 'none', label: 'No Tap Changer' },
        ]
      },
      { 
        id: 'impedance', 
        label: 'Impedance (%)', 
        type: 'text', 
        placeholder: 'e.g., 5%, 6.25%'
      },
    ]
  },
  
  'standard-panel': {
    name: 'Standard Panel',
    slug: 'standard-panel',
    description: 'Electrical control and distribution panels',
    fields: [
      { 
        id: 'panel_type', 
        label: 'Panel Type', 
        type: 'select', 
        required: true,
        options: [
          { value: 'mcc', label: 'MCC (Motor Control Center)' },
          { value: 'pcc', label: 'PCC (Power Control Center)' },
          { value: 'db', label: 'Distribution Board' },
          { value: 'apfc', label: 'APFC Panel' },
          { value: 'ats', label: 'ATS Panel' },
          { value: 'vfd-panel', label: 'VFD Panel' },
          { value: 'plc-panel', label: 'PLC Control Panel' },
          { value: 'soft-starter', label: 'Soft Starter Panel' },
        ]
      },
      { 
        id: 'voltage_rating', 
        label: 'Voltage Rating', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., 415V AC, 690V AC'
      },
      { 
        id: 'enclosure_rating', 
        label: 'Enclosure Rating (IP)', 
        type: 'select',
        options: [
          { value: 'ip42', label: 'IP42' },
          { value: 'ip54', label: 'IP54' },
          { value: 'ip55', label: 'IP55' },
          { value: 'ip65', label: 'IP65' },
          { value: 'ip66', label: 'IP66' },
        ]
      },
      { 
        id: 'dimensions', 
        label: 'Dimensions (HxWxD)', 
        type: 'text', 
        placeholder: 'e.g., 2000x800x600mm'
      },
      { 
        id: 'bus_bar_rating', 
        label: 'Bus Bar Rating', 
        type: 'text', 
        placeholder: 'e.g., 2500A, 4000A'
      },
      { 
        id: 'incomer_type', 
        label: 'Incomer Type', 
        type: 'select',
        options: [
          { value: 'acb', label: 'ACB (Air Circuit Breaker)' },
          { value: 'mccb', label: 'MCCB' },
          { value: 'lbs', label: 'LBS (Load Break Switch)' },
          { value: 'fuse-switch', label: 'Fuse Switch' },
        ]
      },
    ]
  },

  'servo': {
    name: 'Servo Motors, Servo Drives & Motion Control',
    slug: 'servo',
    description: 'Servo motors and drive systems for precision motion control',
    fields: [
      { 
        id: 'power_range', 
        label: 'Power Rating', 
        type: 'text', 
        placeholder: 'e.g., 0.1kW - 7.5kW',
        helpText: 'Motor power output rating'
      },
      { 
        id: 'rated_torque', 
        label: 'Rated Torque', 
        type: 'text', 
        placeholder: 'e.g., 3 Nm (100K)'
      },
      { 
        id: 'rated_speed', 
        label: 'Rated Speed', 
        type: 'text', 
        placeholder: 'e.g., 6000 rpm'
      },
      { 
        id: 'encoder_type', 
        label: 'Encoder Type', 
        type: 'select',
        options: [
          { value: 'incremental', label: 'Incremental Encoder' },
          { value: 'absolute-single', label: 'Absolute Single-turn' },
          { value: 'absolute-multi', label: 'Absolute Multi-turn' },
          { value: 'resolver', label: 'Resolver' },
        ]
      },
      { 
        id: 'cooling_method', 
        label: 'Cooling Method', 
        type: 'select',
        options: [
          { value: 'natural', label: 'Natural Cooling' },
          { value: 'forced', label: 'Forced Air Cooling' },
        ]
      },
      { 
        id: 'protection_class', 
        label: 'Protection Class (IP)', 
        type: 'select',
        options: [
          { value: 'ip64', label: 'IP64' },
          { value: 'ip65', label: 'IP65' },
          { value: 'ip67', label: 'IP67' },
        ]
      },
      { 
        id: 'inertia', 
        label: 'Rotor Inertia', 
        type: 'text', 
        placeholder: 'e.g., 0.28 kg·cm²'
      },
    ]
  },
};

// Get all category slugs for matching
export const getCategorySlugByName = (categoryName: string): string | undefined => {
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Direct slug match
  if (categoryFieldConfigs[normalizedName]) {
    return normalizedName;
  }
  
  // Check against category names
  for (const [slug, config] of Object.entries(categoryFieldConfigs)) {
    if (config.name.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(slug) ||
        normalizedName.includes(config.name.toLowerCase())) {
      return slug;
    }
  }
  
  // Common aliases
  const aliases: Record<string, string> = {
    'variable frequency drive': 'vfd',
    'drive': 'vfd',
    'inverter': 'vfd',
    'programmable logic controller': 'plc',
    'controller': 'plc',
    'human machine interface': 'hmi',
    'touch panel': 'hmi',
    'display': 'hmi',
    'generator': 'genset',
    'dg set': 'genset',
    'generator set': 'genset',
    'di module': 'digital-input-module',
    'do module': 'digital-output-module',
    'ai module': 'analog-input-module',
    'ao module': 'analog-output-module',
    'panel': 'standard-panel',
    'control panel': 'standard-panel',
  };
  
  for (const [alias, slug] of Object.entries(aliases)) {
    if (normalizedName.includes(alias) || alias.includes(normalizedName)) {
      return slug;
    }
  }
  
  return undefined;
};

// Get fields for a category
export const getFieldsForCategory = (categorySlug: string): CategoryFieldConfig[] => {
  return categoryFieldConfigs[categorySlug]?.fields || [];
};

// Check if a category has specific fields defined
export const hasSpecificFields = (categorySlug: string): boolean => {
  return !!categoryFieldConfigs[categorySlug];
};

// Get all available categories with their configs
export const getAllCategoryConfigs = (): CategoryConfig[] => {
  return Object.values(categoryFieldConfigs);
};
