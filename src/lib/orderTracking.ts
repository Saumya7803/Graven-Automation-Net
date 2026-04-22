import { addDays } from "date-fns";

export const carrierUrls: Record<string, string> = {
  dhl: 'https://www.dhl.com/in-en/home/tracking.html?tracking-id=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  bluedart: 'https://www.bluedart.com/tracking?trackFor=',
  dtdc: 'https://www.dtdc.in/tracking.asp?Ttype=0&strCnno=',
  indiapost: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=',
};

export const getCarrierTrackingUrl = (carrier: string, trackingNumber: string): string => {
  const baseUrl = carrierUrls[carrier.toLowerCase()] || '';
  return baseUrl ? `${baseUrl}${trackingNumber}` : '';
};

export const calculateEstimatedDelivery = (shippedAt: Date, carrier: string): Date => {
  const deliveryDays: Record<string, number> = {
    dhl: 3,
    fedex: 2,
    bluedart: 4,
    dtdc: 5,
    indiapost: 7,
  };
  const days = deliveryDays[carrier.toLowerCase()] || 5;
  return addDays(shippedAt, days);
};

export const getStatusProgress = (status: string): number => {
  const statusOrder: Record<string, number> = {
    pending: 20,
    confirmed: 40,
    processing: 60,
    shipped: 80,
    delivered: 100,
    cancelled: 0,
  };
  return statusOrder[status] || 0;
};

export const statusFlow = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export const getStatusIndex = (status: string): number => {
  return statusFlow.findIndex(s => s.key === status);
};
