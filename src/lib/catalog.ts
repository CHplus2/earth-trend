export interface Region {
  id: string;
  name: string;
  /** [south, west, north, east] */
  bbox: [number, number, number, number];
  blurb: string;
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
}

export const REGIONS: Region[] = [
  {
    id: 'amazon',
    name: 'Southern Amazon',
    bbox: [-12, -60, -4, -50],
    blurb: 'Rain forest on the "arc of deforestation" with a lengthening dry season.',
  },
  {
    id: 'iberia',
    name: 'Iberian Peninsula',
    bbox: [36, -9, 42, 0],
    blurb: 'Mediterranean climate that is warming and drying.',
  },
  {
    id: 'california',
    name: 'California Central Valley',
    bbox: [35, -122.5, 40, -118.5],
    blurb: 'Major farming region that depends on groundwater.',
  },
  {
    id: 'india',
    name: 'Indo-Gangetic Plain',
    bbox: [24, 74, 30, 88],
    blurb: 'Dense population, heavy irrigation and growing emissions.',
  },
  {
    id: 'china',
    name: 'North China Plain',
    bbox: [32, 112, 40, 120],
    blurb: 'Industrial region with strong air-quality policy since 2013.',
  },
  {
    id: 'useast',
    name: 'Eastern United States',
    bbox: [36, -90, 42, -80],
    blurb: 'Region where clean-air regulations have cut pollution.',
  },
];

export const VARIABLES: Variable[] = [
  {
    id: 't2m',
    name: 'Near-surface air temperature',
    unit: '°C',
    giovanni: 'MERRA-2 M2TMNXSLV (monthly), 2-meter air temperature, converted from K to °C',
    definition:
      'Air temperature about 2 m above the ground, from the MERRA-2 reanalysis, which blends satellite and surface observations in a weather model.',
    years: '1980 to present',
  },
  {
    id: 'precip',
    name: 'Precipitation rate',
    unit: 'mm/day',
    giovanni: 'GPM IMERG Final monthly (GPM_3IMERGM v07), precipitation',
    definition:
      'Average rainfall and snowfall estimated from the Global Precipitation Measurement constellation of satellites.',
    years: '2000 to present',
  },
  {
    id: 'tws',
    name: 'Terrestrial water storage',
    unit: 'mm',
    giovanni: 'GLDAS Catchment CLSM025 DA1 daily v2.2, terrestrial water storage (averaged to monthly by the app)',
    definition:
      'All water held on land: soil moisture, groundwater, snow and surface water, as a depth of water in mm. Falling values mean the land is drying.',
    years: '2003 to present',
  },
  {
    id: 'no2',
    name: 'Tropospheric NO2 column',
    unit: '1e15 molecules/cm²',
    scale: 1e-15,
    giovanni: 'OMI OMNO2d v004 (or monthly equivalent), tropospheric column, 30% cloud screened',
    definition:
      'The amount of nitrogen dioxide, a pollutant from traffic, power plants and industry, in the lower atmosphere above a spot, measured by the Ozone Monitoring Instrument.',
    years: '2004 to present',
  },
];

export interface DemoStep {
  regionId: string;
  variableId: string;
  title: string;
  text: string;
}

export const DEMOS: DemoStep[] = [
  {
    regionId: 'china',
    variableId: 'no2',
    title: 'Example 1: Pollution falls in China',
    text: 'NO2 over the North China Plain rose until about 2011, then dropped after clean-air policy began. Watch how the straight-line trend is smaller than the real change because the series bends.',
  },
  {
    regionId: 'india',
    variableId: 'no2',
    title: 'Example 2: Same pollutant, opposite direction',
    text: 'Over the Indo-Gangetic Plain NO2 rises. The same variable trends down in China and the eastern US, yet each region follows its own causes.',
  },
  {
    regionId: 'california',
    variableId: 'tws',
    title: 'Example 3: A drying valley',
    text: 'Water storage in the Central Valley falls as groundwater is pumped during drought. Check whether the trend is significant after removing the seasonal cycle.',
  },
];
