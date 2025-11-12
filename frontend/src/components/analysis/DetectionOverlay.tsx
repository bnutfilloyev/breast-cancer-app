import type { CSSProperties } from "react";

type Detection = {
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

type DetectionOverlayProps = {
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
  strokeColor?: string;
};

export function DetectionOverlay({
  detections,
  imageWidth,
  imageHeight,
  strokeColor = "#22c55e"
}: DetectionOverlayProps) {
  return (
    <div className="absolute inset-0">
      {detections.map((detection, index) => {
        const { x1, y1, x2, y2 } = detection.bbox;

        // Convert pixel coordinates to percentages
        const left = (x1 / imageWidth) * 100;
        const top = (y1 / imageHeight) * 100;
        const width = ((x2 - x1) / imageWidth) * 100;
        const height = ((y2 - y1) / imageHeight) * 100;

        const style: CSSProperties = {
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
          borderColor: strokeColor,
        };

        return (
          <div
            key={`${detection.label}-${index}`}
            className="absolute rounded-xl border-2 bg-emerald-500/10 backdrop-blur-sm"
            style={style}
          >
            <span className="absolute -top-6 left-0 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
              {detection.label} {(detection.confidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
