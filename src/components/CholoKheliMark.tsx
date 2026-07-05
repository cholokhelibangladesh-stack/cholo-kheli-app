import markAsset from "@/assets/cholo-kheli-symbol-clean.png.asset.json";

interface Props {
  className?: string;
  /** Kept for API compatibility; unused with raster logo. */
  color?: string;
  accent?: string;
}

/* Official Cholo Kheli mark — cropped at the asset level to avoid transparent
   padding, distortion, or CSS crop glitches in compact headers. */
const CholoKheliMark = ({ className = "" }: Props) => (
  <img
    src={markAsset.url}
    alt="Cholo Kheli"
    className={`block object-contain ${className || "h-[18px] w-[24px]"}`}
    draggable={false}
  />
);

export default CholoKheliMark;
