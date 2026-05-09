declare module "react-timeago" {
  import { ComponentType } from "react";

  interface ReactTimeagoProps {
    date: string | number | Date;
    live?: boolean;
    minPeriod?: number;
    maxPeriod?: number;
    component?: string | ComponentType<unknown>;
    title?: string;
    formatter?: (
      value: number,
      unit: string,
      suffix: string,
      epochSeconds: number,
      nextFormatter?: () => string
    ) => string;
  }

  const ReactTimeago: ComponentType<ReactTimeagoProps>;
  export default ReactTimeago;
}
