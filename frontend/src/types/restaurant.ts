export type Restaurant = {
  id: number;
  name: string;
  address?: string;
  cuisine?: string;
  wait_time?: number | null;
  report_count?: number;
  confidence?: string;
  last_updated?: string;
  distance?: number;
};
