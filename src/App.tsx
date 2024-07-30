import { useEffect, useRef, useState } from "react";
// import css from "./App.module.css";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import bell0 from "./assets/bell0.png";
import bell1 from "./assets/bell1.png";
import bell2 from "./assets/bell2.png";
import bell3 from "./assets/bell3.png";
const bells = [bell0, bell1, bell2, bell3];

function App() {
  const [url, setUrl] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const bellFrames = useRef<HTMLImageElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement>();

  useEffect(() => {
    let readyCount = 0;
    for (let i = 0; i < bells.length; i++) {
      bellFrames.current[i] = document.createElement("img");
      bellFrames.current[i].onload = () => {
        readyCount++;
        if (readyCount === bells.length) {
          setIsReady(true);
        }
      };
      bellFrames.current[i].src = bells[i];
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const size = 128;

    const encoder = GIFEncoder();

    function writeData(data: ImageData) {
      // Quantize your colors to a 256-color RGB palette palette
      const palette = quantize(data.data, 256, {
        format: "rgba4444",
        oneBitAlpha: true,
      });

      // Get an indexed bitmap by reducing each pixel to the nearest color palette
      const index = applyPalette(data.data, palette, "rgba4444");
      encoder.writeFrame(index, data.width, data.height, {
        palette,
        transparent: true,
      });
    }

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      console.error("Couldn't create ctx");
      return;
    }

    function drawBackground() {
      ctx!.clearRect(0, 0, size, size);
      if (backgroundImage) {
        ctx!.drawImage(
          backgroundImage,
          canvas.width > backgroundImage.width
            ? (canvas.width - backgroundImage.width) / 2
            : canvas.width * 0.1,
          canvas.height > backgroundImage.height
            ? (canvas.height - backgroundImage.height) / 2
            : canvas.height * 0.1,
          canvas.height > backgroundImage.height
            ? backgroundImage.height
            : canvas.height * 0.8,
          canvas.width > backgroundImage.width
            ? backgroundImage.width
            : canvas.width * 0.8
        );
      }
    }

    function drawForeground(i: number) {
      ctx!.drawImage(
        bellFrames.current[i],
        canvas.width * 0.05,
        canvas.height * 0.05,
        bellFrames.current[i].width,
        bellFrames.current[i].height
      );
    }

    drawBackground();
    // ctx.fillStyle = "#ff0000";
    // ctx.fillRect(0, 0, half, half);
    drawForeground(0);
    writeData(ctx.getImageData(0, 0, size, size));

    drawBackground();
    // ctx.fillStyle = "#00ff00";
    // ctx.fillRect(half, 0, half, half);
    drawForeground(1);
    writeData(ctx.getImageData(0, 0, size, size));

    drawBackground();
    // ctx.fillStyle = "#0000ff";
    // ctx.fillRect(half, half, half, half);
    drawForeground(2);
    writeData(ctx.getImageData(0, 0, size, size));

    drawBackground();
    // ctx.fillStyle = "#ffff00";
    // ctx.fillRect(0, half, half, half);
    drawForeground(3);
    writeData(ctx.getImageData(0, 0, size, size));

    encoder.finish();

    const buffer = encoder.bytes();
    const objectURL = URL.createObjectURL(new Blob([buffer]));
    setUrl(objectURL);
  }, [isReady, backgroundImage]);

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url!;
    a.download = "shame.gif";
    a.click();
  };

  return (
    <>
      {url ? <img src={url} /> : null}
      <input type="file" onChange={onImageChange} />
      <button onClick={download}>Download</button>
    </>
  );
}

export default App;
