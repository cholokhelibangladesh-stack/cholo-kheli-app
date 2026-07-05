import markAsset from "@/assets/cholo-kheli-mark-official.png.asset.json";

interface Props {
  className?: string;
  /** Kept for API compatibility; unused with raster logo. */
  color?: string;
  accent?: string;
}

/* Official Cholo Kheli mark — arched swoosh + triangular blade.
   The source PNG includes heavy transparent padding, so this component crops
   to the artwork bounds before applying the requested display size. */
const CholoKheliMark = ({ className = "" }: Props) => (
  <span
    aria-label="Cholo Kheli"
    role="img"
    className={`relative block overflow-hidden ${className || "h-[18px] w-[24px]"}`}
  >
    <img
      src={markAsset.url}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute max-w-none select-none"
      style={{
        width: "359.24%",
        height: "263.64%",
        left: "-132.07%",
        top: "-57.34%",
      }}
      draggable={false}
    />
  </span>
);

export default CholoKheliMark;
