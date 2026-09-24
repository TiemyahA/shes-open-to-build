import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Download, ImagePlus, Sparkles, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";

const ringTexts = ["#OPENTOBUILD", "#BUILDING", "#IMADETHAT", "#NOCODENOPROBLEM", "#WHUT"];
const ringColors = [
  { value: "#FF2D78", label: "Hot pink" },
  { value: "#FF5FA0", label: "Bubblegum" },
  { value: "#B6178F", label: "Magenta" },
  { value: "#111111", label: "Black" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "#OpenToBuild — SheBuilds Profile Picture Maker" },
      {
        name: "description",
        content: "Add a hot-pink #OpenToBuild ring to your profile picture and download it in seconds.",
      },
      { property: "og:title", content: "#OpenToBuild — SheBuilds Profile Picture Maker" },
      {
        property: "og:description",
        content: "Change your ring colour. Show the world you're building something.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpenToBuild,
});

function drawArcText(
  context: CanvasRenderingContext2D,
  text: string,
  center: number,
  radius: number,
) {
  const letters = [...text];
  const fontSize = text.length > 16 ? 42 : 49;
  context.font = `800 ${fontSize}px Arial, sans-serif`;
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const widths = letters.map((letter) => context.measureText(letter).width);
  const textWidth = widths.reduce((total, width) => total + width, 0);
  const centerAngle = Math.PI * 0.69;
  let travelled = 0;

  letters.forEach((letter, index) => {
    const letterWidth = widths[index] ?? 0;
    const characterCenter = travelled + letterWidth / 2;
    const angle = centerAngle + (textWidth / 2 - characterCenter) / radius;
    context.save();
    context.translate(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
    context.rotate(angle - Math.PI / 2);
    context.fillText(letter, 0, 0);
    context.restore();
    travelled += letterWidth;
  });
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
}

function drawSoftArc(
  context: CanvasRenderingContext2D,
  color: string,
  center: number,
  radius: number,
) {
  const { red, green, blue } = hexToRgb(color);
  const start = Math.PI * 0.17;
  const end = Math.PI * 1.13;
  const startStop = start / (Math.PI * 2);
  const endStop = end / (Math.PI * 2);
  const fadeLength = 0.035;
  const gradient = context.createConicGradient(0, center, center);
  gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0)`);
  gradient.addColorStop(startStop, `rgba(${red}, ${green}, ${blue}, 0)`);
  gradient.addColorStop(startStop + fadeLength, `rgba(${red}, ${green}, ${blue}, 1)`);
  gradient.addColorStop(endStop - fadeLength, `rgba(${red}, ${green}, ${blue}, 1)`);
  gradient.addColorStop(endStop, `rgba(${red}, ${green}, ${blue}, 0)`);
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

  context.save();
  context.shadowColor = "rgba(17, 17, 17, 0.16)";
  context.shadowBlur = 14;
  context.strokeStyle = gradient;
  context.lineWidth = 70;
  context.lineCap = "butt";
  context.beginPath();
  context.arc(center, center, radius, start, end);
  context.stroke();
  context.restore();
}

function renderCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  color: string,
  text: string,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  const center = size / 2;

  context.clearRect(0, 0, size, size);
  context.save();
  context.beginPath();
  context.arc(center, center, center, 0, Math.PI * 2);
  context.clip();

  if (image) {
    const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  } else {
    context.fillStyle = "#f7eaf0";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#1f1c21";
    context.beginPath();
    context.arc(center, 283, 116, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(center, 692, 275, 300, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ff167d";
    context.beginPath();
    context.arc(center - 92, 210, 42, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(center + 108, 272, 25, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#f7eaf0";
    context.lineWidth = 16;
    context.lineCap = "round";
    context.beginPath();
    context.arc(center, 302, 45, Math.PI * 0.18, Math.PI * 0.82);
    context.stroke();
  }
  context.restore();

  context.save();
  context.beginPath();
  context.arc(center, center, center, 0, Math.PI * 2);
  context.clip();
  drawSoftArc(context, color, center, center - 35);
  drawArcText(context, text, center, center - 40);
  context.restore();
}

function OpenToBuild() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ringText, setRingText] = useState("#OPENTOBUILD");
  const [ringColor, setRingColor] = useState("#FF2D78");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (canvasRef.current) renderCanvas(canvasRef.current, image, ringColor, ringText);
  }, [image, ringColor, ringText]);

  const loadPhoto = useCallback((file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    const photo = new Image();
    photo.onload = () => {
      setImage(photo);
      setFileName(file.name);
      URL.revokeObjectURL(objectUrl);
    };
    photo.src = objectUrl;
  }, []);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    loadPhoto(event.dataTransfer.files[0]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "open-to-build-profile.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="font-display text-lg font-bold text-foreground" aria-label="OpenToBuild home">
            <span className="text-primary">#</span>OpenToBuild<span className="text-primary">.</span>
          </a>
          <a
            href="https://shebuilds.lovable.app/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-extrabold uppercase text-foreground transition-colors hover:text-primary"
          >
            SheBuilds <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </header>

      <section id="top" className="px-5 pb-12 pt-10 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs font-extrabold uppercase text-primary">Made for women who make things</p>
            <h1 className="max-w-5xl font-display text-5xl font-bold leading-[.96] text-foreground sm:text-7xl lg:text-[6.4rem]">
              Change your<br />ring colour<span className="text-primary">.</span>
            </h1>
            <p className="mt-5 font-display text-2xl font-bold text-primary sm:text-3xl">#OpenToBuild</p>
          </div>
          <p className="max-w-xl border-l-2 border-primary pl-5 text-base leading-relaxed text-muted-foreground lg:mb-2 lg:text-lg">
            Green means you're looking for a job. Pink means you're <strong className="text-foreground">(that girl)</strong> building one. Drop in your photo, download, make it your profile picture.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card px-5 py-10 lg:px-8 lg:py-16">
        <div className="mx-auto mb-9 flex max-w-7xl items-end justify-between border-b border-border pb-5">
          <div><span className="text-xs font-extrabold text-primary">01</span><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Make your mark.</h2></div>
          <p className="hidden text-xs font-bold uppercase text-muted-foreground sm:block">Your photo stays on your device</p>
        </div>
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] lg:gap-20">
          <div className="lg:sticky lg:top-8">
            <div className="relative mx-auto aspect-square w-full max-w-[620px]">
              <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                className="relative aspect-square w-full rounded-full bg-muted shadow-frame"
                aria-label={`Profile picture preview with ${ringText} ring`}
              />
            </div>
            <p className="mt-6 text-center text-xs font-bold uppercase text-muted-foreground">Square PNG · Ready for LinkedIn</p>
          </div>

          <div className="border border-border bg-card p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
               <div><p className="text-xs font-extrabold uppercase text-primary">Profile studio</p><h3 className="mt-1 font-display text-2xl font-bold text-card-foreground">Make it yours.</h3></div>
              <Sparkles className="size-7 text-primary" aria-hidden="true" />
            </div>

            <div className="py-6">
              <p className="control-label"><span>01</span> Add your photo</p>
              <div
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
                role="button"
                tabIndex={0}
                className={`mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 text-center transition-colors ${isDragging ? "border-primary bg-accent" : "border-border bg-secondary hover:border-primary"}`}
              >
                <Upload className="mb-2 size-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">{fileName || "Click to upload or drop it here"}</span>
                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG or WEBP</span>
                <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => loadPhoto(event.target.files?.[0])} />
              </div>
            </div>

            <div className="border-t border-border py-6">
              <p className="control-label"><span>02</span> Pick your energy</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ringTexts.map((text) => (
                  <Button key={text} type="button" variant={ringText === text ? "default" : "outline"} size="sm" onClick={() => setRingText(text)} className="rounded-full">
                    {text}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-border py-6">
              <p className="control-label"><span>03</span> Choose your pink</p>
              <div className="mt-3 flex gap-3">
                {ringColors.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="swatch"
                    size="iconLg"
                    aria-label={color.label}
                    aria-pressed={ringColor === color.value}
                    onClick={() => setRingColor(color.value)}
                    className={ringColor === color.value ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}
                  >
                    <span className="size-8 rounded-full border border-foreground/10" style={{ backgroundColor: color.value }} />
                  </Button>
                ))}
              </div>
            </div>

            <Button type="button" size="xl" onClick={download} className="w-full">
              <Download /> Download profile picture
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase text-primary">Then make it real</p>
          <div className="mt-5 grid gap-x-10 md:grid-cols-3">
          <a href="https://shebuilds.lovable.app/" target="_blank" rel="noreferrer" className="step-block">
            <span className="step-number">01</span>
            <div><h3>Apply to SheBuilds ↗</h3><p>No code needed. Let's build, girlies! ✨ 🔨 ✨</p></div>
          </a>
          <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noreferrer" className="step-block">
            <span className="step-number">02</span>
            <div><h3>Update your LinkedIn ↗</h3><p>Download your new profile picture and put it live.</p></div>
          </a>
          <div className="step-block">
            <span className="step-number">03</span>
            <div><h3>Call on your tribe</h3><p>Share what you're building. Tag it #OpenToBuild.</p></div>
          </div>
          </div>
        </div>
      </section>
    </main>
  );
}