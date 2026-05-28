export interface Unit {
  id: number;
  name: string;
}

export interface UnitsResponse {
  success: boolean;
  message: string;
  data: Unit[];
}

export interface UnitPayload {
  name: string;
}
