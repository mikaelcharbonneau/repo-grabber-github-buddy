
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Rack {
  id: number;
  name: string;
}

interface Issue {
  key: string;
  rackId: number;
  deviceType: string;
  alertType: string;
  severity: string;
  timestamp: string;
}

interface IssueSummaryProps {
  issues: Issue[];
  racks: Rack[];
}

const IssueSummary = ({ issues, racks }: IssueSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Summary ({issues.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No issues logged yet. Select issues from the matrix above.
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => {
              const rack = racks.find(r => r.id === issue.rackId);
              return (
                <div key={issue.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{rack?.name || `Rack-${issue.rackId}`}</span>
                    <span className="text-gray-600">{issue.deviceType}</span>
                    <span className="text-gray-600">{issue.alertType}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueSummary;
