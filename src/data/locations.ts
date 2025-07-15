const staticDatacenters = [
  { id: 'dc1', name: 'Quebec, Canada' },
  { id: 'dc2', name: 'London, UK' },
  { id: 'dc3', name: 'New York, USA' },
];

const staticDataHalls = {
  'dc1': [
    { id: 'dh1', name: 'Hall A' },
    { id: 'dh2', name: 'Hall B' },
  ],
  'dc2': [
    { id: 'dh3', name: 'Hall C' },
  ],
  'dc3': [
    { id: 'dh4', name: 'Hall D' },
  ],
};

const staticCabinets = {
  'dh1': [
    { id: 'cab1', name: 'Cabinet 001' },
    { id: 'cab2', name: 'Cabinet 002' },
  ],
  'dh2': [
    { id: 'cab3', name: 'Cabinet 003' },
  ],
  'dh3': [
    { id: 'cab4', name: 'Cabinet 004' },
  ],
  'dh4': [
    { id: 'cab5', name: 'Cabinet 005' },
  ],
};

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

// Fetch all datacenters
export async function fetchDatacenters() {
  return staticDatacenters;
}

// Fetch data halls for a given datacenter id
export async function fetchDataHalls(datacenterId: string) {
  return staticDataHalls[datacenterId] || [];
}

// Fetch cabinets for a given data hall id
export async function fetchCabinets(dataHallId: string) {
  return staticCabinets[dataHallId] || [];
}