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

// Sample cabinets for demonstration - these would be populated with actual cabinet data
const sampleCabinets: Cabinet[] = [
  { id: "C001", name: "Cabinet-001" },
  { id: "C002", name: "Cabinet-002" },
  { id: "C003", name: "Cabinet-003" },
  { id: "C004", name: "Cabinet-004" },
  { id: "C005", name: "Cabinet-005" }
];

// Organized location data
export const locationData: Datacenter[] = [
  {
    id: "quebec-canada",
    name: "Quebec, Canada",
    dataHalls: [
      {
        id: "island-1",
        name: "Island 1",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-8",
        name: "Island 8",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-9",
        name: "Island 9",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-10",
        name: "Island 10",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-11",
        name: "Island 11",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-12",
        name: "Island 12",
        cabinets: [...sampleCabinets]
      },
      {
        id: "green-nitrogen",
        name: "Green Nitrogen",
        cabinets: [...sampleCabinets]
      }
    ]
  },
  {
    id: "dallas-usa",
    name: "Dallas, United States",
    dataHalls: [
      {
        id: "island-1",
        name: "Island 1",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-2",
        name: "Island 2",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-3",
        name: "Island 3",
        cabinets: [...sampleCabinets]
      },
      {
        id: "island-4",
        name: "Island 4",
        cabinets: [...sampleCabinets]
      }
    ]
  },
  {
    id: "houston-usa",
    name: "Houston, United States",
    dataHalls: [
      {
        id: "h20-lab",
        name: "H20 Lab",
        cabinets: [...sampleCabinets]
      }
    ]
  },
  {
    id: "enebakk-norway",
    name: "Enebakk, Norway",
    dataHalls: [
      {
        id: "island-1",
        name: "Island 1",
        cabinets: [...sampleCabinets]
      }
    ]
  },
  {
    id: "rjukan-norway",
    name: "Rjukan, Norway",
    dataHalls: [
      {
        id: "island-1",
        name: "Island 1",
        cabinets: [...sampleCabinets]
      }
    ]
  }
];

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