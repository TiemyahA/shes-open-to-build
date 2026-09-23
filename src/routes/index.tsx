import { createFileRoute } from "@tanstack/react-router";
import { Download, ImagePlus, Linkedin, Sparkles, Upload } from "lucide-react";
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
  const fontSize = text.length > 16 ? 47 : 58;
  context.font = `900 ${fontSize}px Arial, sans-serif`;
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const width = context.measureText(text).width;
  const totalAngle = Math.min(width / radius, Math.PI * 0.78);
  const letterAngle = totalAngle / letters.length;

  letters.forEach((letter, index) => {
    const angle = Math.PI / 2 + totalAngle / 2 - letterAngle * (index + 0.5);
    context.save();
    context.translate(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius);
    context.rotate(angle - Math.PI / 2);
    context.fillText(letter, 0, 0);
    context.restore();
  });
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
    context.fillStyle = "#f3e9ed";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "#d8bcc8";
    context.beginPath();
    context.arc(center, 275, 125, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(center, 690, 285, 300, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  context.strokeStyle = color;
  context.lineWidth = 128;
  context.beginPath();
  context.arc(center, center, center - 64, 0, Math.PI * 2);
  context.stroke();
  drawArcText(context, text, center, center - 68);
}

function OpenToBuild() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ringText, setRingText] = useState(ringTexts[0]);
  const [ringColor, setRingColor] = useState(ringColors[0].value);
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
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="font-display text-xl text-foreground" aria-label="OpenToBuild home">
            <span className="text-primary">#</span>OpenToBuild
          </a>
          <a
            href="https://shebuilds.lovable.app/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4"
          >
            SheBuilds ↗
          </a>
        </div>
      </header>

      <section id="top" className="border-b border-border px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-black uppercase text-primary">Made for women who make things</p>
          <h1 className="max-w-5xl font-display text-5xl leading-none text-foreground sm:text-7xl lg:text-8xl">
            Change your ring colour.
            <span className="mt-2 block text-primary">#OpenToBuild</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Green means you're looking for a job. Pink means you're <strong className="text-foreground">(that girl)</strong> building one. Drop in your photo, download, make it your profile picture.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(370px,.92fr)] lg:gap-16">
          <div className="lg:sticky lg:top-8">
            <div className="relative mx-auto aspect-square w-full max-w-[620px]">
              <div className="absolute -inset-3 rounded-full border border-dashed border-primary/40" aria-hidden="true" />
              <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                className="relative aspect-square w-full rounded-full bg-muted shadow-frame"
                aria-label={`Profile picture preview with ${ringText} ring`}
              />
              {!image && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="mt-8 flex flex-col items-center text-center text-foreground/65">
                    <ImagePlus className="mb-3 size-9" strokeWidth={1.6} />
                    <span className="text-sm font-bold">Your photo goes here</span>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-6 text-center text-xs font-bold uppercase text-muted-foreground">Square PNG · Ready for LinkedIn</p>
          </div>

          <div className="border border-border bg-card p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="text-xs font-black uppercase text-primary">Your profile picture</p>
                <h2 className="mt-1 font-display text-3xl text-card-foreground">Make it yours.</h2>
              </div>
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

      <section className="border-t border-foreground bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl divide-y divide-background/20 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <a href="https://shebuilds.lovable.app/" target="_blank" rel="noreferrer" className="step-block">
            <span className="step-number">01</span>
            <h3>Apply to SheBuilds.</h3>
            <p>You don't need to know how to code. Let's just build, girlies! ✨ 🔨 ✨</p>
            <strong>Apply now ↗</strong>
          </a>
          <div className="step-block bg-primary">
            <span className="step-number">02</span>
            <h3>Generate & update.</h3>
            <p>Make your #OpenToBuild picture here, then update your LinkedIn profile.</p>
            <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noreferrer"><Linkedin className="size-4" /> Open LinkedIn ↗</a>
          </div>
          <div className="step-block">
            <span className="step-number">03</span>
            <h3>Call on your tribe.</h3>
            <p>Share what you're building, find your people, and let's build!</p>
            <strong>#OpenToBuild</strong>
          </div>
        </div>
      </section>
    </main>
  );
}