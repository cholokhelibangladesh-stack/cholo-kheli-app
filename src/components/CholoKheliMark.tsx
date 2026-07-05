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
  <span
    aria-label="Cholo Kheli"
    role="img"
    className={`block bg-current ${className || "h-[18px] w-[24px]"}`}
    style={{
      WebkitMaskImage: `url(${markAsset.url})`,
      maskImage: `url(${markAsset.url})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

export default CholoKheliMark;
