export interface DesignTemplate {
  name: string;
  font: string;
  fontSize: number;
  color: string;
  colorName?: string;
  effect: string;
  strokeWidth: number;
  strokeColor?: string;
  bgColor?: string;
}

export interface Design {
  id: number;
  name: string;
  data: string;
  userId: number | null;
  createdAt: string;
}

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  obj: any;
}

export interface TextEffect {
  name: string;
  icon: string;
}
