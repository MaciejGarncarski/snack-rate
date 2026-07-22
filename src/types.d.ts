interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: readonly { x: number; y: number }[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  static getSupportedFormats(): Promise<string[]>;
}

declare module "@tanstack/router-core" {
  interface FilebaseRouteOptionsInterface<
    TRegister,
    TParentRoute,
    TId,
    TPath,
    TSearchValidator,
    TParams,
    TLoaderDeps,
    TLoaderFn,
    TRouterContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TRemountDepsFn,
    TSSR,
    TServerMiddlewares,
    THandlers,
  > {
    server?: {
      handlers?: Partial<
        Record<
          "HEAD" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
          (opts: { request: Request }) => Response | Promise<Response>
        >
      >;
    };
  }
}
