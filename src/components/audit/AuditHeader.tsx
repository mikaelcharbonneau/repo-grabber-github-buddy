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
    </div>;
};
export default AuditHeader;