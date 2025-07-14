import rawCsv from './dcTrackRackslocationfull.csv?raw';

// Location data for actual data centers
export interface Cabinet {
  id: string;
  name: string;
}

export interface DataHall {
  id: string;
  name: string;
  cabinets: Cabinet[];
}

export interface Datacenter {
  id: string;
  name: string;
  dataHalls: DataHall[];
}

const datacenterMap: Record<string, { id: string; name: string }> = {
  "Quebec - Canada": { id: "quebec-canada", name: "Quebec, Canada" },
  "Enebakk - Norway": { id: "enebakk-norway", name: "Enebakk, Norway" },
  "Rjukan - Norway": { id: "rjukan-norway", name: "Rjukan, Norway" },
  "Dallas - United States": { id: "dallas-usa", name: "Dallas, United States" },
  "Houston - United States": { id: "houston-usa", name: "Houston, United States" },
};

export const locationData: Datacenter[] = (() => {
  const lines = rawCsv.trim().split('\n').slice(1);
  const data: [string, string, string][] = lines
    .map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length !== 3) return null;
      return parts as [string, string, string];
    })
    .filter((item): item is [string, string, string] => item !== null);

  const map = new Map<string, Map<string, Set<string>>>();
  for (const [dc, dh, cab] of data) {
    if (!map.has(dc)) map.set(dc, new Map());
    const dhMap = map.get(dc)!;
    if (!dhMap.has(dh)) dhMap.set(dh, new Set());
    dhMap.get(dh)!.add(cab);
  }

  const locData: Datacenter[] = [];
  for (const [csvDc, info] of Object.entries(datacenterMap)) {
    const dc: Datacenter = { id: info.id, name: info.name, dataHalls: [] };
    const dhMap = map.get(csvDc);
    if (dhMap) {
      const dhList = Array.from(dhMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      for (const [dhName, cabSet] of dhList) {
        const dhId = dhName.toLowerCase().replace(/\s+/g, '-');
        const cabinets: Cabinet[] = Array.from(cabSet)
          .sort((a, b) => a.localeCompare(b))
          .map((c) => ({ id: c, name: `Cabinet ${c}` }));
        dc.dataHalls.push({ id: dhId, name: dhName, cabinets });
      }
    }
    locData.push(dc);
  }
  return locData.sort((a, b) => a.name.localeCompare(b.name));
})();

// Helper function to get data halls by datacenter ID
export const getDataHallsByDatacenter = (datacenterId: string): DataHall[] => {
  const datacenter = locationData.find(dc => dc.id === datacenterId);
  return datacenter ? datacenter.dataHalls : [];
};

// Helper function to get datacenter by ID
export const getDatacenterById = (datacenterId: string): Datacenter | undefined => {
  return locationData.find(dc => dc.id === datacenterId);
};

// Helper function to get cabinets by data hall ID
export const getCabinetsByDataHall = (datacenterId: string, dataHallId: string): Cabinet[] => {
  const datacenter = locationData.find(dc => dc.id === datacenterId);
  if (!datacenter) return [];
  
  const dataHall = datacenter.dataHalls.find(dh => dh.id === dataHallId);
  return dataHall ? dataHall.cabinets : [];
};