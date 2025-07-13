import { MapPin } from "lucide-react";
interface AuditHeaderProps {
  datacenter: string;
  dataHall: string;
}
const AuditHeader = ({
  datacenter,
  dataHall
}: AuditHeaderProps) => {
  return <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Log Incidents</h1>
      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>{datacenter} / {dataHall}</span>
      </div>
    </div>;
};
export default AuditHeader;