export interface Region {
  id: string;
  name: string;
  /** [south, west, north, east] */
  bbox: [number, number, number, number];
  blurb: string;
  /** Whether the box is mostly land or mostly ocean */
  type: 'land' | 'ocean';
}

export interface Variable {
  id: string;
  name: string;
  unit: string;
  /** Giovanni product and variable to download */
  giovanni: string;
  /** Plain-language definition for students */
  definition: string;
  /** First and last year available in the source product */
  years: string;
  /** Multiply raw CSV values by this to get the displayed unit (default 1) */
  scale?: number;
  /** Added after scaling (default 0) */
  offset?: number;
  /** Heading used in the dropdown */
  domain: 'land' | 'ocean' | 'atmosphere';
  /** Which kinds of region data files exist for */
  regionTypes: Array<'land' | 'ocean'>;
}

export const REGIONS: Region[] = [
  {
    id: 'amazon',
    name: 'Southern Amazon',
    bbox: [-12, -60, -4, -50],
    blurb: 'Rain forest on the "arc of deforestation" with a lengthening dry season.',
    type: 'land',
  },
  {
    id: 'iberia',
    name: 'Iberian Peninsula',
    bbox: [36, -9, 42, 0],
    blurb: 'Mediterranean climate that is warming and drying.',
    type: 'land',
  },
  {
    id: 'california',
    name: 'California Central Valley',
    bbox: [35, -122.5, 40, -118.5],
    blurb: 'Major farming region that depends on groundwater.',
    type: 'land',
  },
  {
    id: 'india',
    name: 'Indo-Gangetic Plain',
    bbox: [24, 74, 30, 88],
    blurb: 'Dense population, heavy irrigation and growing emissions.',
    type: 'land',
  },
  {
    id: 'china',
    name: 'North China Plain',
    bbox: [32, 112, 40, 120],
    blurb: 'Industrial region with strong air-quality policy since 2013.',
    type: 'land',
  },
  {
    id: 'useast',
    name: 'Eastern United States',
    bbox: [36, -90, 42, -80],
    blurb: 'Region where clean-air regulations have cut pollution.',
    type: 'land',
  },
  {
    id: 'nino34',
    name: 'Tropical Pacific (Nino 3.4)',
    bbox: [-5, -170, 5, -120],
    blurb: 'The ocean box used to track El Nino and La Nina.',
    type: 'ocean',
  },
  {
    id: 'natlantic',
    name: 'North Atlantic',
    bbox: [40, -60, 60, -20],
    blurb: 'Open North Atlantic, a key region for ocean heat and currents.',
    type: 'ocean',
  },
  {
    id: 'barents',
    name: 'Barents Sea',
    bbox: [70, 20, 78, 50],
    blurb: 'Arctic sea north of Norway and Russia, where warming is fast.',
    type: 'ocean',
  },
];

export const VARIABLES: Variable[] = [
  {
    id: 't2m',
    name: 'Near-surface air temperature',
    unit: '°C',
    offset: -273.15,
    domain: 'atmosphere',
    regionTypes: ['land'],
    giovanni: 'MERRA-2 M2TMNXSLV v5.12.4 monthly, 2-meter air temperature; K converted to °C',
    definition:
      'Air temperature about 2 m above the ground, from the MERRA-2 reanalysis, which blends satellite and surface observations in a weather model.',
    years: '1980 to present',
  },
  {
    id: 'precip',
    name: 'Precipitation rate',
    unit: 'mm/day',
    scale: 24,
    domain: 'atmosphere',
    regionTypes: ['land'],
    giovanni: 'GPM IMERG Final Run monthly (GPM_3IMERGM v07), merged satellite-gauge precipitation; mm/hr x 24 = mm/day',
    definition:
      'Average rainfall and snowfall estimated from the Global Precipitation Measurement constellation of satellites.',
    years: '2000 to present',
  },
  {
    id: 'tws',
    name: 'Terrestrial water storage',
    unit: 'mm',
    domain: 'land',
    regionTypes: ['land'],
    giovanni: 'GLDAS Catchment CLSM025 DA1 daily v2.2, terrestrial water storage (averaged to monthly by the app)',
    definition:
      'All water held on land: soil moisture, groundwater, snow and surface water, as a depth of water in mm. Falling values mean the land is drying.',
    years: '2003 to present',
  },
  {
    id: 'no2',
    name: 'Tropospheric NO2 column',
    unit: '×10¹⁵ molecules/cm²',
    scale: 1e-15,
    domain: 'atmosphere',
    regionTypes: ['land'],
    giovanni: 'OMI OMNO2d v004 daily, NO2 tropospheric column (30% cloud screened); the app averages days to months',
    definition:
      'The amount of nitrogen dioxide, a pollutant from traffic, power plants and industry, in the lower atmosphere above a spot, measured by the Ozone Monitoring Instrument.',
    years: '2004 to present',
  },
  {
    id: 'sst',
    name: 'Sea surface temperature',
    unit: '°C',
    domain: 'ocean',
    regionTypes: ['ocean'],
    giovanni: 'MODIS-Aqua monthly 9 km, Sea Surface Temperature at 11 microns (Day), water only (MODISA_L3m_SST_Monthly_9km)',
    definition:
      'The temperature of the top layer of the ocean, measured by the MODIS instrument on NASA\'s Aqua satellite using infrared light. Ocean warming affects weather, sea ice and marine life.',
    years: '2002 to present',
  },
  {
    id: 'air850',
    name: 'Air temperature, lower atmosphere (850 hPa)',
    unit: '°C',
    offset: -273.15,
    domain: 'atmosphere',
    regionTypes: ['ocean'],
    giovanni: 'AIRS3STM v7.0 monthly, Air Temperature (Daytime/Ascending, AIRS-only), level 850 hPa, K converted to C',
    definition:
      'Air temperature about 1.5 km above the surface (the 850 hPa pressure level), measured by the AIRS infrared sounder on NASA\'s Aqua satellite.',
    years: '2002 to present',
  },
  {
    id: 'air300',
    name: 'Air temperature, upper atmosphere (300 hPa)',
    unit: '°C',
    offset: -273.15,
    domain: 'atmosphere',
    regionTypes: ['ocean'],
    giovanni: 'AIRS3STM v7.0 monthly, Air Temperature (Daytime/Ascending, AIRS-only), level 300 hPa, K converted to C',
    definition:
      'Air temperature about 9 km above the surface (the 300 hPa pressure level, near the top of the weather layer), measured by the AIRS infrared sounder on NASA\'s Aqua satellite.',
    years: '2002 to present',
  },
];

export interface DemoStep {
  regionId: string;
  variableId: string;
  /** Optional second variable to compare against */
  compareVariableId?: string;
  title: string;
  text: string;
  sources?: Array<{ label: string; url: string }>;
}

// Numbers below come from the data in public/data (seasonal cycle removed,
// Theil-Sen slope, Mann-Kendall test). Re-check them if you replace any file.
export const DEMOS: DemoStep[] = [
  {
    regionId: 'china',
    variableId: 'no2',
    title: 'Pollution rose, then fell',
    text: 'Tropospheric NO2 over the North China Plain averaged about 10.5 (units of ×10¹⁵ molecules/cm²) in 2004, peaked near 13.3 in 2011, then fell to roughly 6 to 7 in 2024 to 2026. The overall trend is about -2.1 per decade (-22% per decade) and is significant, but one straight line hides the turning point. Published studies of satellite NO2 find the same rise to about 2011 and fall afterwards, and link the decline to air-pollution controls. This tool shows what changed, not why.',
    sources: [
      { label: 'Scientific Reports (2016): satellite NO2 and China NOx goals', url: 'https://www.nature.com/articles/srep35912' },
      { label: 'Remote Sensing (2023): NO2, SO2 and AOD trends over South and East Asia', url: 'https://www.mdpi.com/2072-4292/15/20/5069' },
    ],
  },
  {
    regionId: 'india',
    variableId: 'no2',
    title: 'Same pollutant, opposite direction',
    text: 'NO2 over the Indo-Gangetic Plain is rising by about 0.27 per decade (+12%), significant. Over the same years it is falling in the North China Plain (-22% per decade), the eastern US (-22%), California (-19%) and Iberia (-11%). The Amazon shows no clear trend. Click those regions on the map to compare. The data shows where NO2 is rising or falling, but not the reasons, which would need emissions records for each place.',
  },
  {
    regionId: 'amazon',
    variableId: 'tws',
    compareVariableId: 'precip',
    title: 'A drying Amazon',
    text: 'In the southern Amazon, stored land water is falling by about 74 mm per decade (-4.3%) and rainfall by about 0.21 mm/day per decade (-3.9%); both are significant. Air temperature there rose by about 0.4 °C per decade over 1980 to 2026 (select Near-surface air temperature to see it). Month to month, water storage and rain move together (r = 0.35 after removing trends). Less rain and more heat are consistent with drier land, but land use and other factors were not tested, and the water-storage series is from a land model.',
  },
  {
    regionId: 'barents',
    variableId: 'sst',
    compareVariableId: 'air850',
    title: 'Fast warming in the Arctic',
    text: 'In the Barents Sea the sea surface is warming by about 0.24 °C per decade, and the air 1.5 km up (850 hPa) by about 0.60 °C per decade, the fastest temperature trend in this tool. Air near 9 km (300 hPa) is warming by about 0.32 °C per decade. All three are significant. The sea-surface record has fewer months (265) because the Arctic winter leaves gaps.',
  },
  {
    regionId: 'natlantic',
    variableId: 'sst',
    compareVariableId: 'air850',
    title: 'Air warms, sea surface does not (yet)',
    text: 'Over the North Atlantic box, air temperature is rising significantly at 850 hPa (about +0.23 °C per decade) and at 300 hPa (+0.27), but the sea surface trend (+0.06) is not significant. Month to month, sea and air above it are moderately linked (r = 0.48). A trend can be missing in one variable and clear in another, and a longer record could change the sea-surface result.',
  },
  {
    regionId: 'india',
    variableId: 'tws',
    compareVariableId: 't2m',
    title: 'Warming in five regions, but not India',
    text: 'Air temperature has risen significantly over 1980 to 2026 in the southern Amazon (+0.40 °C per decade), the eastern US (+0.37), California (+0.32), Iberia (+0.29) and China (+0.26). In the Indo-Gangetic Plain there is no clear trend (-0.03). Yet stored land water there is falling by about 54 mm per decade (-6.4%), significant. So falling water storage does not require a warming trend, and different regions can behave differently.',
  },
];
