import { useState } from "react";

const LOW_RES_MIN_WIDTH = 700;
const LOW_RES_MIN_HEIGHT = 480;

export default function SmartServiceImage({
  src,
  alt,
  wrapperClassName = "",
  imageClassName = "",
  lowResImageClassName = "",
  highResImageClassName = "",
}) {
  const [isLowRes, setIsLowRes] = useState(false);

  function handleLoad(event) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth < LOW_RES_MIN_WIDTH || naturalHeight < LOW_RES_MIN_HEIGHT) {
      setIsLowRes(true);
    }
  }

  return (
    <div
      className={`${wrapperClassName} ${
        isLowRes
          ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(244,229,217,0.92)_62%,rgba(235,213,198,0.95))] p-5"
          : ""
      }`}
    >
      <img
        src={src}
        alt={alt}
        draggable="false"
        onLoad={handleLoad}
        className={`${imageClassName} ${
          isLowRes
            ? `object-contain ${lowResImageClassName}`
            : `object-cover ${highResImageClassName}`
        }`}
      />
    </div>
  );
}
