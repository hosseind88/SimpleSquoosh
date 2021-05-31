import React, { useState } from "react";

export default function RotateWasm({
  bitMapArr,
  width,
  height,
  canvas,
  pointer,
  buffer,
  module
}) {
  const [loading, setLoading] = useState(false);

  const onStartConverting = async (e) => {
    e.preventDefault();

    setLoading(false);

    const byteSize = width * height * 4;

    canvas.height = height;
    canvas.width = width;
    const context = canvas.getContext("2d");
    const usub = new Uint8ClampedArray(buffer, pointer, byteSize);
    usub.set(bitMapArr, 0);
    const imageData = new ImageData(usub, width, height);
    module.rotate_180(pointer, width, height);
    context.putImageData(imageData, 0, 0);
    setLoading(false);
  };

  return (
    <div>
      <div>
        <button className="rotate-btn" onClick={onStartConverting}>Rotate 180deg</button>
        <br />
        {loading ? "wait for it..." : ""}
        <br />
      </div>
    </div>
  );
}
