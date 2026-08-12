import type { LifeAchievement } from "./achievements";
import { xinYeNianFont, youRanXiaoKaiFont } from "../fonts";

const BODY_FONT = `${xinYeNianFont.style.fontFamily}, "Kaiti SC", serif`;
const TITLE_FONT = `${youRanXiaoKaiFont.style.fontFamily}, "Kaiti SC", cursive`;

export type AchievementRarity = "普通" | "稀有" | "史诗" | "传说";

export interface AchievementCard extends LifeAchievement {
  description: string;
  rate: string;
  rarity: AchievementRarity;
}

export type FilterId =
  | "ascii" | "hanzi" | "terminal" | "dots" | "voxel" | "arcade" | "mosaic"
  | "bit16" | "static" | "prism" | "acid" | "phantom" | "glitch" | "raw";

export interface FilterDefinition {
  id: FilterId;
  category: "字符" | "像素" | "实验" | "原图";
  label: string;
  mark: string;
  description: string;
}

export const FILTERS: FilterDefinition[] = [
  { id: "ascii", category: "字符", label: "ASCII", mark: "@#%+", description: "暗部彩色字符" },
  { id: "hanzi", category: "字符", label: "古字", mark: "山水月", description: "疏密中文微字" },
  { id: "terminal", category: "字符", label: "终端", mark: ">_01", description: "荧光绿字符" },
  { id: "dots", category: "像素", label: "圆点", mark: "●··", description: "亮度点阵" },
  { id: "voxel", category: "像素", label: "体素", mark: "▦▦", description: "立体像素块" },
  { id: "arcade", category: "像素", label: "街机", mark: "▣▣", description: "发光像素格" },
  { id: "mosaic", category: "像素", label: "马赛克", mark: "◉◉", description: "彩色圆芯" },
  { id: "bit16", category: "像素", label: "16-BIT", mark: "16B", description: "复古游戏色阶" },
  { id: "static", category: "实验", label: "静电", mark: "░▒▓", description: "黑白抖动" },
  { id: "prism", category: "实验", label: "棱镜", mark: "RGB", description: "RGB 色散" },
  { id: "acid", category: "实验", label: "酸雨", mark: "•••", description: "荧光颗粒" },
  { id: "phantom", category: "实验", label: "幻影", mark: "≋≋", description: "等高线描边" },
  { id: "glitch", category: "实验", label: "故障", mark: "//", description: "扫描线错位" },
  { id: "raw", category: "原图", label: "原图", mark: "RAW", description: "保留质感" },
];

export interface RenderSettings {
  filter: FilterId;
  density: number;
  size: number;
  filterOpacity: number;
  originalMix: number;
  brightness: number;
  contrast: number;
  hue: number;
  cardPosition: "top" | "bottom";
  showMotto: boolean;
  showDescription: boolean;
  showRate: boolean;
  showRarity: boolean;
  includeFilter: boolean;
  includeCard: boolean;
}

const WIDTH = 1080;
const HEIGHT = 1440;
const SAMPLE_WIDTH = 270;
const SAMPLE_HEIGHT = 360;

export const DEFAULT_SETTINGS: RenderSettings = {
  filter: "ascii",
  density: 54,
  size: 84,
  filterOpacity: 82,
  originalMix: 62,
  brightness: 100,
  contrast: 108,
  hue: 0,
  cardPosition: "bottom",
  showMotto: true,
  showDescription: true,
  showRate: true,
  showRarity: true,
  includeFilter: true,
  includeCard: true,
};

function coverImage(ctx: CanvasRenderingContext2D, image: CanvasImageSource, width: number, height: number) {
  const sourceWidth = image instanceof HTMLImageElement ? image.naturalWidth : (image as HTMLCanvasElement).width;
  const sourceHeight = image instanceof HTMLImageElement ? image.naturalHeight : (image as HTMLCanvasElement).height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function quantize(value: number, levels = 5) {
  return Math.round((value / 255) * (levels - 1)) * (255 / (levels - 1));
}

function rgb(data: Uint8ClampedArray, index: number) {
  return { r: data[index], g: data[index + 1], b: data[index + 2] };
}

function lightness(color: { r: number; g: number; b: number }) {
  return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
}

function drawSampledFilter(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  settings: RenderSettings,
) {
  const sample = document.createElement("canvas");
  sample.width = SAMPLE_WIDTH;
  sample.height = SAMPLE_HEIGHT;
  const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
  if (!sampleCtx) return;
  sampleCtx.drawImage(source, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
  const imageData = sampleCtx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
  const data = imageData.data;
  const cell = Math.max(4, Math.round(14 - settings.density / 8));
  const scaleX = WIDTH / SAMPLE_WIDTH;
  const scaleY = HEIGHT / SAMPLE_HEIGHT;
  const chars = "@%#*+=-:. ";
  const hanzi = "山水月风云光人行小一 ";
  const strength = settings.filterOpacity / 100;
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const colorAt = (x: number, y: number) => {
    const safeX = Math.max(0, Math.min(SAMPLE_WIDTH - 1, Math.round(x)));
    const safeY = Math.max(0, Math.min(SAMPLE_HEIGHT - 1, Math.round(y)));
    return rgb(data, (safeY * SAMPLE_WIDTH + safeX) * 4);
  };
  const cellColor = (x: number, y: number) => {
    const center = colorAt(x + cell / 2, y + cell / 2);
    const topLeft = colorAt(x + 1, y + 1);
    const bottomRight = colorAt(x + cell - 1, y + cell - 1);
    return {
      r: Math.round((center.r * 2 + topLeft.r + bottomRight.r) / 4),
      g: Math.round((center.g * 2 + topLeft.g + bottomRight.g) / 4),
      b: Math.round((center.b * 2 + topLeft.b + bottomRight.b) / 4),
    };
  };
  const drawSampleCanvas = (layer: HTMLCanvasElement, smoothing: boolean) => {
    ctx.save();
    ctx.globalAlpha = strength;
    ctx.imageSmoothingEnabled = smoothing;
    ctx.drawImage(layer, 0, 0, WIDTH, HEIGHT);
    ctx.restore();
  };

  ctx.save();
  ctx.globalAlpha = strength;

  if (settings.filter === "bit16") {
    const layer = document.createElement("canvas");
    layer.width = SAMPLE_WIDTH;
    layer.height = SAMPLE_HEIGHT;
    const layerCtx = layer.getContext("2d");
    if (!layerCtx) return;
    for (let y = 0; y < SAMPLE_HEIGHT; y += cell) {
      for (let x = 0; x < SAMPLE_WIDTH; x += cell) {
        const color = cellColor(x, y);
        layerCtx.fillStyle = `rgb(${quantize(color.r, 6)},${quantize(color.g, 6)},${quantize(color.b, 6)})`;
        layerCtx.fillRect(x, y, cell + 1, cell + 1);
      }
    }
    ctx.restore();
    drawSampleCanvas(layer, false);
    return;
  }

  if (settings.filter === "prism") {
    const layer = document.createElement("canvas");
    layer.width = SAMPLE_WIDTH;
    layer.height = SAMPLE_HEIGHT;
    const layerCtx = layer.getContext("2d");
    if (!layerCtx) return;
    const output = layerCtx.createImageData(SAMPLE_WIDTH, SAMPLE_HEIGHT);
    const shift = Math.max(2, Math.round(cell * 0.55));
    for (let y = 0; y < SAMPLE_HEIGHT; y += 1) {
      for (let x = 0; x < SAMPLE_WIDTH; x += 1) {
        const index = (y * SAMPLE_WIDTH + x) * 4;
        output.data[index] = colorAt(x - shift, y).r;
        output.data[index + 1] = colorAt(x, y).g;
        output.data[index + 2] = colorAt(x + shift, y).b;
        output.data[index + 3] = 255;
      }
    }
    layerCtx.putImageData(output, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    drawSampleCanvas(layer, true);
    ctx.restore();
    return;
  }

  if (settings.filter === "glitch") {
    ctx.globalAlpha = strength * 0.88;
    for (let y = 0; y < HEIGHT; y += 54) {
      const band = 12 + ((y / 54) % 4) * 5;
      const offset = (((y / 54) % 5) - 2) * 13;
      ctx.drawImage(source, 0, y, WIDTH, band, offset, y, WIDTH, band);
    }
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255,35,90,.18)";
    ctx.fillRect(-12, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(20,210,255,.16)";
    ctx.fillRect(12, 0, WIDTH, HEIGHT);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255,255,255,.11)";
    for (let y = 0; y < HEIGHT; y += 7) ctx.fillRect(0, y, WIDTH, 1);
    ctx.restore();
    return;
  }

  if (settings.filter === "phantom") {
    const layer = document.createElement("canvas");
    layer.width = SAMPLE_WIDTH;
    layer.height = SAMPLE_HEIGHT;
    const layerCtx = layer.getContext("2d");
    if (!layerCtx) return;
    const output = layerCtx.createImageData(SAMPLE_WIDTH, SAMPLE_HEIGHT);
    for (let y = 1; y < SAMPLE_HEIGHT - 1; y += 1) {
      for (let x = 1; x < SAMPLE_WIDTH - 1; x += 1) {
        const left = lightness(colorAt(x - 1, y));
        const right = lightness(colorAt(x + 1, y));
        const top = lightness(colorAt(x, y - 1));
        const bottom = lightness(colorAt(x, y + 1));
        const edge = Math.min(255, Math.abs(right - left) + Math.abs(bottom - top));
        const index = (y * SAMPLE_WIDTH + x) * 4;
        output.data[index] = edge * 0.7;
        output.data[index + 1] = edge * 0.95;
        output.data[index + 2] = Math.min(255, edge * 1.5);
        output.data[index + 3] = edge > 22 ? Math.min(255, edge * 2.2) : 0;
      }
    }
    layerCtx.putImageData(output, 0, 0);
    ctx.fillStyle = `rgba(6,10,20,${0.22 * strength})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    drawSampleCanvas(layer, true);
    ctx.restore();
    return;
  }

  if (["ascii", "hanzi", "terminal"].includes(settings.filter)) {
    ctx.globalAlpha = 0.2 + strength * 0.22;
    ctx.fillStyle = settings.filter === "terminal" ? "#00160a" : "#08090c";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = strength;
  } else if (["dots", "voxel", "arcade", "mosaic"].includes(settings.filter)) {
    ctx.globalAlpha = strength * 0.14;
    ctx.fillStyle = "#050608";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = strength;
  } else if (settings.filter === "acid") {
    ctx.globalAlpha = strength * 0.2;
    ctx.fillStyle = "#00190d";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = strength;
  }

  for (let y = 0; y < SAMPLE_HEIGHT; y += cell) {
    for (let x = 0; x < SAMPLE_WIDTH; x += cell) {
      const color = cellColor(x, y);
      const lum = lightness(color);
      const px = x * scaleX;
      const py = y * scaleY;
      const width = cell * scaleX;
      const height = cell * scaleY;

      if (settings.filter === "ascii" || settings.filter === "hanzi" || settings.filter === "terminal") {
        const palette = settings.filter === "hanzi" ? hanzi : chars;
        const normalized = Math.pow(lum / 255, 0.86);
        const character = palette[Math.min(palette.length - 1, Math.floor(normalized * palette.length))];
        const boost = 36;
        ctx.fillStyle = settings.filter === "terminal"
          ? `rgba(80,255,125,${0.62 + (1 - normalized) * 0.3})`
          : `rgb(${clamp(color.r + boost)},${clamp(color.g + boost)},${clamp(color.b + boost)})`;
        ctx.font = `600 ${Math.max(9, (height * settings.size) / 100)}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character, px + width / 2, py + height / 2);
      } else if (settings.filter === "dots" || settings.filter === "mosaic") {
        const radius = settings.filter === "mosaic"
          ? width * 0.39
          : Math.max(width * 0.1, (1 - lum / 330) * width * 0.43);
        ctx.fillStyle = `rgb(${clamp(color.r + 18)},${clamp(color.g + 18)},${clamp(color.b + 18)})`;
        ctx.beginPath();
        ctx.arc(px + width / 2, py + height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        if (settings.filter === "mosaic") {
          ctx.fillStyle = "rgba(255,255,255,.72)";
          ctx.beginPath();
          ctx.arc(px + width * 0.42, py + height * 0.39, Math.max(1, radius * 0.18), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (settings.filter === "voxel" || settings.filter === "arcade") {
        const gap = Math.max(1.5, width * 0.08);
        const red = settings.filter === "arcade" ? quantize(color.r, 5) : color.r;
        const green = settings.filter === "arcade" ? quantize(color.g, 5) : color.g;
        const blue = settings.filter === "arcade" ? quantize(color.b, 5) : color.b;
        ctx.fillStyle = `rgb(${red},${green},${blue})`;
        ctx.fillRect(px + gap, py + gap, width - gap * 2, height - gap * 2);
        ctx.fillStyle = "rgba(255,255,255,.3)";
        ctx.fillRect(px + gap, py + gap, width - gap * 2, Math.max(2, height * 0.09));
        ctx.fillRect(px + gap, py + gap, Math.max(2, width * 0.08), height - gap * 2);
        ctx.fillStyle = "rgba(0,0,0,.26)";
        ctx.fillRect(px + gap, py + height - gap - Math.max(2, height * 0.09), width - gap * 2, Math.max(2, height * 0.09));
        if (settings.filter === "arcade" && lum > 165) {
          ctx.shadowColor = `rgb(${color.r},${color.g},${color.b})`;
          ctx.shadowBlur = 18;
          ctx.fillStyle = "rgba(255,255,255,.75)";
          ctx.fillRect(px + width * 0.38, py + height * 0.38, width * 0.24, height * 0.24);
          ctx.shadowBlur = 0;
        }
      } else if (settings.filter === "static") {
        const threshold = (x * 17 + y * 31) % 255;
        const isLight = lum > threshold;
        ctx.fillStyle = isLight ? "rgba(255,255,255,.68)" : "rgba(0,0,0,.5)";
        ctx.fillRect(px, py, width, Math.max(2, height * 0.32));
        if ((x + y) % (cell * 3) === 0) ctx.fillRect(px, py + height * 0.62, width * 0.55, 2);
      } else if (settings.filter === "acid") {
        if ((x * 13 + y * 7) % 17 < 6) {
          const alpha = 0.45 + (1 - lum / 255) * 0.45;
          ctx.fillStyle = lum > 120 ? `rgba(190,255,35,${alpha})` : `rgba(0,255,130,${alpha})`;
          ctx.beginPath();
          ctx.arc(px + width / 2, py + height / 2, Math.max(2, width * 0.15), 0, Math.PI * 2);
          ctx.fill();
          if ((x * 5 + y * 3) % 23 < 4) ctx.fillRect(px + width / 2 - 1, py, 2, height * 1.8);
        }
      }
    }
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const RARITY_PALETTES = {
  普通: { accent: "#c8c4ae", bright: "#f4efd8", panel: "#27251f", shadow: "#777463" },
  稀有: { accent: "#55a9c3", bright: "#c9f2ff", panel: "#132b34", shadow: "#2d7186" },
  史诗: { accent: "#9564b9", bright: "#efd9ff", panel: "#26172f", shadow: "#57346d" },
  传说: { accent: "#c08b22", bright: "#fff0b4", panel: "#36270e", shadow: "#715116" },
} as const;

function traceSteppedCard(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.beginPath();
  ctx.moveTo(x + 30, y);
  ctx.lineTo(x + width - 38, y);
  ctx.lineTo(x + width - 38, y + 14);
  ctx.lineTo(x + width - 14, y + 14);
  ctx.lineTo(x + width - 14, y + 44);
  ctx.lineTo(x + width, y + 44);
  ctx.lineTo(x + width, y + height - 50);
  ctx.lineTo(x + width - 18, y + height - 50);
  ctx.lineTo(x + width - 18, y + height - 14);
  ctx.lineTo(x + width - 42, y + height - 14);
  ctx.lineTo(x + width - 42, y + height);
  ctx.lineTo(x + 30, y + height);
  ctx.lineTo(x + 30, y + height - 14);
  ctx.lineTo(x + 10, y + height - 14);
  ctx.lineTo(x + 10, y + height - 44);
  ctx.lineTo(x, y + height - 44);
  ctx.lineTo(x, y + 44);
  ctx.lineTo(x + 10, y + 44);
  ctx.lineTo(x + 10, y + 14);
  ctx.lineTo(x + 30, y + 14);
  ctx.closePath();
}

function drawPixelIcon(
  ctx: CanvasRenderingContext2D,
  achievement: LifeAchievement,
  iconImage: HTMLImageElement | null | undefined,
  centerX: number,
  centerY: number,
  accent: string,
) {
  const pixelCanvas = document.createElement("canvas");
  const pixelSize = 56;
  pixelCanvas.width = pixelSize;
  pixelCanvas.height = pixelSize;
  const pixelCtx = pixelCanvas.getContext("2d");
  if (!pixelCtx) return;

  if (iconImage?.complete && iconImage.naturalWidth > 0) {
    const scale = Math.max(pixelSize / iconImage.naturalWidth, pixelSize / iconImage.naturalHeight);
    const width = iconImage.naturalWidth * scale;
    const height = iconImage.naturalHeight * scale;
    pixelCtx.drawImage(iconImage, (pixelSize - width) / 2, (pixelSize - height) / 2, width, height);
  } else {
    pixelCtx.font = '42px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    pixelCtx.textAlign = "center";
    pixelCtx.textBaseline = "middle";
    pixelCtx.fillText(`${achievement.icon}\uFE0F`, pixelSize / 2, pixelSize / 2 + 1);
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.drawImage(pixelCanvas, centerX - 70, centerY - 70, 140, 140);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAchievementCard(
  ctx: CanvasRenderingContext2D,
  achievement: AchievementCard,
  settings: RenderSettings,
  iconImage?: HTMLImageElement | null,
) {
  const x = 42;
  const y = settings.cardPosition === "top" ? 72 : 1038;
  const width = 996;
  const height = 330;
  const palette = RARITY_PALETTES[achievement.rarity];
  const dividerX = x + 260;
  const contentX = dividerX + 42;
  const contentRight = x + width - 52;

  ctx.save();
  traceSteppedCard(ctx, x, y, width, height);
  ctx.clip();
  ctx.fillStyle = "rgba(5,6,6,.96)";
  ctx.fillRect(x, y, width, height);

  const checkerSize = 28;
  for (let row = 0; row * checkerSize < height; row += 1) {
    for (let column = 0; column * checkerSize < width; column += 1) {
      ctx.fillStyle = (row + column) % 2 === 0 ? "rgba(255,255,255,.026)" : "rgba(0,0,0,.16)";
      ctx.fillRect(x + column * checkerSize, y + row * checkerSize, checkerSize, checkerSize);
    }
  }

  const panelGradient = ctx.createLinearGradient(x + 18, y + 20, dividerX, y + height - 20);
  panelGradient.addColorStop(0, palette.panel);
  panelGradient.addColorStop(1, "rgba(5,5,5,.88)");
  ctx.fillStyle = panelGradient;
  ctx.fillRect(x + 18, y + 18, dividerX - x - 18, height - 36);
  ctx.restore();

  ctx.save();
  traceSteppedCard(ctx, x, y, width, height);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = palette.shadow;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 27, y + 28, width - 54, height - 56);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(dividerX, y + 4);
  ctx.lineTo(dividerX, y + height - 4);
  ctx.stroke();
  ctx.strokeRect(x + 48, y + 38, 172, height - 76);

  ctx.globalAlpha = 0.32;
  ctx.fillStyle = palette.bright;
  ctx.fillRect(x + 17, y + 14, 32, 32);
  ctx.fillRect(x + width - 50, y + height - 46, 32, 32);
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.accent;
  ctx.fillRect(x + 28, y, width - 68, 5);
  ctx.fillRect(x + 30, y + height - 5, width - 72, 5);

  drawPixelIcon(ctx, achievement, iconImage, x + 134, y + height / 2, palette.accent);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#dedbd0";
  ctx.font = `23px ${BODY_FONT}`;
  ctx.fillText("人生成就达成", contentX, y + 60);
  if (settings.showRarity) {
    ctx.textAlign = "right";
    ctx.fillStyle = palette.bright;
    ctx.font = "24px ui-monospace, monospace";
    ctx.fillRect(contentRight - 74, y + 30, 3, 30);
    ctx.fillText(achievement.rarity, contentRight, y + 58);
    ctx.textAlign = "left";
  }
  let titleSize = 50;
  ctx.font = `${titleSize}px ${TITLE_FONT}`;
  while (ctx.measureText(achievement.title).width > contentRight - contentX && titleSize > 34) {
    titleSize -= 2;
    ctx.font = `${titleSize}px ${TITLE_FONT}`;
  }
  ctx.fillStyle = palette.shadow;
  ctx.fillText(achievement.title, contentX + 3, y + 121);
  ctx.fillStyle = palette.bright;
  ctx.fillText(achievement.title, contentX, y + 117);

  let cursorY = y + 160;
  if (settings.showMotto) {
    ctx.fillStyle = "#e3dece";
    ctx.font = `27px ${BODY_FONT}`;
    ctx.fillText(`“${achievement.motto}”`, contentX, cursorY);
    cursorY += 49;
  }
  if (settings.showDescription) {
    ctx.fillStyle = "#aaa69d";
    ctx.font = `22px ${BODY_FONT}`;
    const lines = wrapText(ctx, achievement.description, contentRight - contentX).slice(0, 2);
    lines.forEach((line, index) => ctx.fillText(line, contentX, cursorY + index * 29));
  }

  if (settings.showRate) {
    const rateY = y + height - 35;
    ctx.strokeStyle = palette.shadow;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(contentX, rateY - 39);
    ctx.lineTo(contentRight, rateY - 39);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#99968d";
    ctx.font = "21px ui-monospace, monospace";
    ctx.fillText("全球达成率", contentX, rateY);
    ctx.textAlign = "right";
    ctx.fillStyle = palette.bright;
    ctx.font = "bold 25px ui-monospace, monospace";
    ctx.fillText(achievement.rate, contentRight, rateY);
  }
  ctx.restore();
}

export function renderAchievementCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLCanvasElement,
  achievement: AchievementCard,
  settings: RenderSettings,
  iconImage?: HTMLImageElement | null,
) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const source = document.createElement("canvas");
  source.width = WIDTH;
  source.height = HEIGHT;
  const sourceCtx = source.getContext("2d");
  if (!sourceCtx) return;
  sourceCtx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) hue-rotate(${settings.hue}deg)`;
  coverImage(sourceCtx, image, WIDTH, HEIGHT);
  sourceCtx.filter = "none";

  ctx.fillStyle = "#090909";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalAlpha = Math.max(0.12, settings.originalMix / 100);
  ctx.drawImage(source, 0, 0);
  ctx.globalAlpha = 1;
  if (settings.includeFilter && settings.filter !== "raw") drawSampledFilter(ctx, source, settings);
  if (settings.includeCard) drawAchievementCard(ctx, achievement, settings, iconImage);
}

export function createDemoImage() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#87a9c8");
  gradient.addColorStop(0.5, "#d5a480");
  gradient.addColorStop(1, "#182235");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "rgba(255,220,150,.82)";
  ctx.beginPath();
  ctx.arc(820, 430, 185, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a2432";
  ctx.beginPath();
  ctx.moveTo(0, 930);
  ctx.lineTo(260, 690);
  ctx.lineTo(470, 940);
  ctx.lineTo(710, 610);
  ctx.lineTo(1080, 920);
  ctx.lineTo(1080, 1440);
  ctx.lineTo(0, 1440);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#080d15";
  ctx.beginPath();
  ctx.arc(470, 650, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(405, 735, 145, 340);
  return canvas;
}
