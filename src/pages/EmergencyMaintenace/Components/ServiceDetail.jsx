import React from 'react'
import { getBackgroundColor } from './HelperFunction';
import DetailItem from './DetailsField';

const ServiceDetail = ({ service }) => (
    <div
      className="mb-4 p-4 rounded-lg"
      style={{ backgroundColor: getBackgroundColor(service.serviceType) }}
    >
      <div className="grid grid-cols-2 gap-1">
        <DetailItem label="Service Code" value={service?.service_code} />
        <DetailItem label="Repair Cost" value={service?.repairCost} />
        <DetailItem label="Sales Tax" value={service?.sales_tax} />
        <DetailItem label="Further Tax" value={service?.further_tax} />
        <DetailItem label="Other Costs" value={service?.other_costs} />
        <DetailItem label="Repair Amount" value={service?.net_value} />
        <DetailItem label="Remarks" value={service?.remarks} />
        <DetailItem label="Description" value={service?.description} />
      </div>
    </div>
  );

export default ServiceDetail
