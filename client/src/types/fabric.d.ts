declare module 'fabric' {
  export class Canvas {
    constructor(elementId: string, options?: any);
    add(...objects: Object[]): Canvas;
    remove(...objects: Object[]): Canvas;
    renderAll(): Canvas;
    getObjects(): Object[];
    setActiveObject(object: Object): Canvas;
    discardActiveObject(): Canvas;
    clear(): Canvas;
    toDataURL(options?: { format?: string; quality?: number }): string;
    loadFromJSON(json: string, callback?: Function): Canvas;
    setWidth(width: number): Canvas;
    setHeight(height: number): Canvas;
    setDimensions(dimensions: { width: number; height: number }): Canvas;
    setZoom(zoom: number): Canvas;
    centerObject(object: Object): Canvas;
    dispose(): void;
    on(event: string, handler: Function): Canvas;
    width: number;
    height: number;
  }

  export class Object {
    set(properties: any): Object;
    get(property: string): any;
    scale(scale: number): Object;
    clone(callback: (cloned: Object) => void): void;
    applyFilters(): Object;
    type?: string;
    id?: string;
    name?: string;
    visible?: boolean;
    selectable?: boolean;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    fill?: string | any;
    stroke?: string;
    strokeWidth?: number;
    shadow?: any;
    opacity?: number;
    fontFamily?: string;
    fontSize?: number;
    filters?: any[];
  }

  export class Text extends Object {
    constructor(text: string, options?: any);
    text: string;
  }

  export class Image extends Object {
    static fromURL(url: string, callback: (image: Image) => void): void;
    filters: any[];
  }

  export namespace Image {
    export namespace filters {
      export class Grayscale {
        constructor(options?: any);
      }
      export class Sepia {
        constructor(options?: any);
      }
      export class Invert {
        constructor(options?: any);
      }
      export class Blur {
        constructor(options?: { blur?: number });
      }
      export class Brightness {
        constructor(options?: { brightness?: number });
      }
      export class Contrast {
        constructor(options?: { contrast?: number });
      }
    }
  }
}