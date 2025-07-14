// Mock Supabase client for demo purposes
// In a real app, you would use actual Supabase configuration

export const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      order: (column: string, options: any) => ({
        limit: (count: number) => Promise.resolve({
          data: getMockData(table, count),
          error: null
        })
      })
    })
  })
};

// Mock data for demo
const getMockData = (table: string, limit: number) => {
  switch (table) {
    case 'audits':
      return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: `AUD-2024-${String(i + 1).padStart(3, '0')}`,
        location: `Quebec, Canada / Island ${i + 1}`,
        technician: ['Mikael Charbonneau', 'Javier Montoya', 'Clifford Chimezie', 'Leena Saini', 'Sarah Wilson'][i % 5],
        date: `2024-01-${15 - i}`,
        time: '14:30',
        issues: Math.floor(Math.random() * 5),
        severity: ['Low', 'Medium', 'Critical'][Math.floor(Math.random() * 3)],
        status: ['Completed', 'In Progress', 'Under Review'][Math.floor(Math.random() * 3)],
        created_at: new Date(2024, 0, 15 - i).toISOString()
      }));
    
    case 'incidents':
      return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: `INC-2024-${String(45 - i).padStart(3, '0')}`,
        description: [
          'PDU overcurrent alarm triggered',
          'Temperature sensor offline',
          'HVAC system malfunction',
          'Battery backup test failure',
          'Network connectivity issues'
        ][i % 5],
        location: `DC-EAST / Hall-A / Rack-${15 + i}`,
        assignee: ['Tech Team Alpha', 'Tech Team Beta', 'Facilities Team', 'Tech Team Gamma', 'Network Team'][i % 5],
        severity: ['Critical', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
        status: ['Open', 'In Progress', 'Resolved'][Math.floor(Math.random() * 3)],
        created_at: new Date(2024, 0, 15 - i).toISOString()
      }));
    
    case 'reports':
      return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
        id: `RPT-2024-${String(i + 1).padStart(3, '0')}`,
        reportType: ['Audit Summary', 'Incident Detail', 'Compliance'][i % 3],
        location: ['All Locations', 'DC-EAST', 'DC-WEST'][i % 3],
        description: [
          'January Audit Summary Report',
          'Critical Incidents Q1 Analysis',
          'DC-EAST Compliance Assessment'
        ][i % 3],
        generated: `2024-01-${15 - i}`,
        size: ['2.3 MB', '1.8 MB', '945 KB'][i % 3],
        format: ['PDF', 'CSV', 'PDF'][i % 3],
        generated_at: new Date(2024, 0, 15 - i).toISOString()
      }));
    
    default:
      return [];
  }
};