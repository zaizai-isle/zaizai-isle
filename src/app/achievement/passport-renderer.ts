import {
  DEFAULT_SETTINGS,
  renderAchievementCanvas,
  type AchievementCard,
  type FilterId,
} from "./canvas-renderer";
import { xinYeNianFont, youRanXiaoKaiFont } from "../fonts";
import type { PhotoTextureId, StampDraft, StampStyleId } from "./passport-model";

export const PASSPORT_FORMAT = { width: 1080, height: 1920 } as const;

const POSTER_COLORS = {
  fog: "#ffffff",
  charcoal: "#171717",
  forest: "#303030",
  moss: "#595959",
  light: "#d9d9d6",
  muted: "#707070",
} as const;

const BODY_FONT = `${xinYeNianFont.style.fontFamily}, "Kaiti SC", "STKaiti", serif`;
const TITLE_FONT = `${youRanXiaoKaiFont.style.fontFamily}, "STXingkai", "Kaiti SC", cursive`;

function coverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceWidth = image instanceof HTMLImageElement ? image.naturalWidth : (image as HTMLCanvasElement).width;
  const sourceHeight = image instanceof HTMLImageElement ? image.naturalHeight : (image as HTMLCanvasElement).height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawPaperBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = POSTER_COLORS.fog;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(32,32,32,.026)";
  for (let index = 0; index < 170; index += 1) {
    const x = (index * 193) % width;
    const y = (index * 431) % height;
    const size = index % 9 === 0 ? 3 : 1;
    ctx.fillRect(x, y, size, size);
  }
}

function applyTexture(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  texture: PhotoTextureId,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const filters: Record<Exclude<PhotoTextureId, "experimental">, string> = {
    original: "none",
    fade: "saturate(.68) contrast(.88) brightness(1.08) sepia(.18)",
    film: "saturate(.82) contrast(.96) brightness(1.02) sepia(.28)",
    photocopy: "grayscale(1) contrast(1.7) brightness(1.08)",
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.filter = filters[texture as Exclude<PhotoTextureId, "experimental">] ?? "none";
  coverImage(ctx, image, x, y, width, height);
  ctx.restore();

  if (texture === "fade" || texture === "film") {
    ctx.fillStyle = texture === "film" ? "rgba(92,49,23,.13)" : "rgba(238,224,190,.2)";
    ctx.fillRect(x, y, width, height);
  }
}

function formatStampDate(value: string) {
  const [year = "----", month = "--", day = "--"] = value.split("-");
  return { year, month, day, compact: `${year}.${month}.${day}` };
}

function drawTextAlongArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  centerAngle: number,
  maxArc: number,
  uprightFromBottom = false,
) {
  const characters = Array.from(text);
  const letterSpacing = 1.5;
  let fontSize = 28;
  let characterWidths: number[] = [];

  while (fontSize >= 22) {
    ctx.font = `700 ${fontSize}px "Noto Serif SC", serif`;
    characterWidths = characters.map((character) => ctx.measureText(character).width);
    const textWidth = characterWidths.reduce((total, width) => total + width, 0) + letterSpacing * (characters.length - 1);
    if (textWidth / radius <= maxArc) break;
    fontSize -= 1;
  }

  const advances = characterWidths.map((width, index) => width + (index < characters.length - 1 ? letterSpacing : 0));
  const rawTotalAngle = advances.reduce((total, width) => total + width, 0) / radius;
  const angleScale = Math.min(1, maxArc / rawTotalAngle);
  const totalAngle = rawTotalAngle * angleScale;
  let angle = uprightFromBottom ? centerAngle + totalAngle / 2 : centerAngle - totalAngle / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  characters.forEach((character, index) => {
    const characterAngle = (advances[index] / radius) * angleScale;
    angle += (uprightFromBottom ? -1 : 1) * characterAngle / 2;
    ctx.save();
    ctx.translate(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.rotate(angle + (uprightFromBottom ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(character, 0, 0);
    ctx.restore();
    angle += (uprightFromBottom ? -1 : 1) * characterAngle / 2;
  });
}

function drawClassicStamp(ctx: CanvasRenderingContext2D, _draft: StampDraft, x: number, y: number) {
  const ink = POSTER_COLORS.moss;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 6);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.76;

  ctx.lineWidth = 4;
  ctx.setLineDash([84, 3, 64, 2]);
  [-30, 0, 30].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(-292, offset);
    ctx.bezierCurveTo(-250, offset - 15, -205, offset + 15, -158, offset);
    ctx.stroke();
  });

  ctx.lineWidth = 7;
  ctx.setLineDash([122, 4, 78, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, 152, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.setLineDash([196, 3, 96, 2]);
  ctx.beginPath();
  ctx.arc(0, 0, 134, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  drawTextAlongArc(ctx, "LIFE PASSPORT", 106, -Math.PI / 2, Math.PI * 0.72);
  drawTextAlongArc(ctx, "ZAIZAI ISLE", 106, Math.PI / 2, Math.PI * 0.66, true);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 62px ${TITLE_FONT}`;
  ctx.fillText("抵达", 0, 2);
  ctx.font = "700 23px serif";
  ctx.fillText("·", -112, 1);
  ctx.fillText("·", 112, 1);
  ctx.restore();
}

function drawDateStamp(ctx: CanvasRenderingContext2D, draft: StampDraft, x: number, y: number) {
  const date = formatStampDate(draft.date);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.157);
  ctx.strokeStyle = POSTER_COLORS.moss;
  ctx.fillStyle = POSTER_COLORS.moss;
  ctx.globalAlpha = 0.76;
  ctx.lineWidth = 7;
  ctx.setLineDash([152, 4, 92, 3]);
  ctx.strokeRect(-208, -148, 416, 296);
  ctx.lineWidth = 3;
  ctx.setLineDash([214, 3, 104, 2]);
  ctx.strokeRect(-191, -131, 382, 262);
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-176, -56);
  ctx.lineTo(176, -56);
  ctx.moveTo(-176, 60);
  ctx.lineTo(176, 60);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 24px ui-monospace, monospace";
  ctx.fillText("ARRIVAL", 0, -94);
  ctx.font = "700 54px ui-monospace, monospace";
  ctx.fillText(date.compact, 0, 3);
  ctx.font = "700 22px ui-monospace, monospace";
  ctx.fillText("ZAIZAI ISLE", 0, 98);
  ctx.restore();
}

function traceJournalStamp(ctx: CanvasRenderingContext2D, inner = false) {
  const points = inner
    ? [[-151, -88], [109, -102], [153, -22], [99, 99], [-139, 83]]
    : [[-168, -105], [122, -121], [173, -24], [113, 118], [-154, 100]];
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([pointX, pointY]) => ctx.lineTo(pointX, pointY));
  ctx.closePath();
}

function drawJournalStamp(ctx: CanvasRenderingContext2D, _draft: StampDraft, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.07);
  ctx.strokeStyle = POSTER_COLORS.moss;
  ctx.fillStyle = POSTER_COLORS.moss;
  ctx.globalAlpha = 0.74;
  ctx.lineWidth = 7;
  ctx.setLineDash([142, 4, 76, 3]);
  traceJournalStamp(ctx);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.38;
  ctx.setLineDash([188, 4, 70, 3]);
  traceJournalStamp(ctx, true);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.78;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 34px ${BODY_FONT}`;
  ctx.fillText("这一刻", 0, -34);
  ctx.font = `400 42px ${BODY_FONT}`;
  ctx.fillText("值得记住", 0, 24);
  ctx.restore();
}

function drawStampBacking(
  ctx: CanvasRenderingContext2D,
  style: StampStyleId,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = POSTER_COLORS.fog;
  ctx.globalAlpha = 0.18;
  if (style === "classic") {
    ctx.rotate(-Math.PI / 6);
    ctx.beginPath();
    ctx.arc(0, 0, 157, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === "date") {
    ctx.rotate(-0.157);
    ctx.fillRect(-211, -151, 422, 302);
  } else {
    ctx.rotate(-0.07);
    traceJournalStamp(ctx);
    ctx.fill();
  }
  ctx.restore();
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  style: StampStyleId,
  draft: StampDraft,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (style === "date") {
    drawDateStamp(ctx, draft, 0, 0);
    ctx.restore();
    return;
  }
  if (style === "journal") {
    drawJournalStamp(ctx, draft, 0, 0);
    ctx.restore();
    return;
  }
  drawClassicStamp(ctx, draft, 0, 0);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let current = "";
  for (const character of text) {
    if (ctx.measureText(current + character).width > maxWidth && current) {
      lines.push(current);
      current = character;
    } else {
      current += character;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  fontFamily: string,
  weight = 700,
) {
  let fontSize = startSize;
  let lines: string[] = [];
  while (fontSize >= minSize) {
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) break;
    fontSize -= 2;
  }
  return { fontSize, lines: lines.slice(0, maxLines) };
}

function drawRule(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = "rgba(40,40,40,.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPosterHeader(ctx: CanvasRenderingContext2D, draft: StampDraft, width: number, margin: number) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = POSTER_COLORS.forest;
  ctx.font = "700 20px ui-monospace, monospace";
  ctx.fillText("LIFE PASSPORT  /  ARRIVAL", margin, 82);
  ctx.textAlign = "right";
  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = "18px ui-monospace, monospace";
  ctx.fillText(formatStampDate(draft.date).compact, width - margin, 82);
  drawRule(ctx, margin, 112, width - margin, 112);
}

function drawPhotoPosterHeader(ctx: CanvasRenderingContext2D, margin: number) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = POSTER_COLORS.forest;
  ctx.font = "700 22px ui-monospace, monospace";
  ctx.fillText("LIFE PASSPORT  /  ARRIVAL", margin, 82);
}

function drawPosterFooter(ctx: CanvasRenderingContext2D, width: number, height: number, margin: number) {
  drawRule(ctx, margin, height - 65, width - margin, height - 65);
  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = "15px ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.fillText("ZAIZAI ISLE  /  ARRIVAL RECORD", margin, height - 30);
  ctx.textAlign = "right";
  ctx.fillText("NO. 0001", width - margin, height - 30);
}

function drawPosterPhoto(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  draft: StampDraft,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  applyTexture(ctx, image, draft.texture, x, y, width, height);
}

function drawPortraitPhotoPoster(ctx: CanvasRenderingContext2D, image: CanvasImageSource, draft: StampDraft) {
  const width = 1080;
  const height = 1920;
  const margin = 64;
  const photoWidth = 1008;
  const photoHeight = 1344;
  const photoX = (1080 - photoWidth) / 2;
  const photoY = 132;
  const photoBottom = photoY + photoHeight;
  drawPhotoPosterHeader(ctx, margin);
  drawPosterPhoto(ctx, image, draft, photoX, photoY, photoWidth, photoHeight);

  ctx.textAlign = "left";
  ctx.fillStyle = POSTER_COLORS.moss;
  ctx.font = "700 24px ui-monospace, monospace";
  ctx.fillText(draft.category, margin, 1542);

  ctx.textAlign = "left";
  ctx.fillStyle = POSTER_COLORS.charcoal;
  const title = fitWrappedText(ctx, draft.title || "一次值得记住的抵达", 660, 2, 62, 48, TITLE_FONT, 400);
  ctx.font = `400 ${title.fontSize}px ${TITLE_FONT}`;
  title.lines.forEach((line, index) => ctx.fillText(line, margin, 1600 + index * (title.fontSize + 8)));

  const noteY = 1600 + title.lines.length * (title.fontSize + 8) + 22;
  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = `30px ${BODY_FONT}`;
  const note = draft.note || "不是所有抵达，都需要掌声。";
  wrapText(ctx, `“${note}”`, 660).slice(0, 2).forEach((line, index) => ctx.fillText(line, margin, noteY + index * 42));

  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = "16px ui-monospace, monospace";
  ctx.fillText("ARRIVAL DATE", margin, 1800);
  ctx.textAlign = "right";
  ctx.fillText("LOCATION", width - margin, 1800);
  ctx.fillStyle = POSTER_COLORS.forest;
  ctx.font = "700 21px ui-monospace, monospace";
  ctx.textAlign = "left";
  ctx.fillText(formatStampDate(draft.date).compact, margin, 1832);
  ctx.textAlign = "right";
  ctx.font = `400 21px ${BODY_FONT}`;
  ctx.fillText(draft.location || "未标记地点", width - margin, 1832);

  const stampPlacement: Record<StampStyleId, { x: number; y: number; scale: number }> = {
    classic: { x: 858, y: photoBottom - 30, scale: 0.7 },
    date: { x: 842, y: photoBottom - 66, scale: 0.69 },
    journal: { x: 858, y: photoBottom - 18, scale: 0.78 },
  };
  const stamp = stampPlacement[draft.style];
  drawStampBacking(ctx, draft.style, stamp.x, stamp.y, stamp.scale);
  drawStamp(ctx, draft.style, draft, stamp.x, stamp.y, stamp.scale);
  drawPosterFooter(ctx, width, height, margin);
}

function drawPortraitTextArchive(ctx: CanvasRenderingContext2D, draft: StampDraft) {
  const height = 1920;
  const margin = 68;
  drawPosterHeader(ctx, draft, 1080, margin);
  drawRule(ctx, margin, 168, 1012, 168);
  drawRule(ctx, margin, 360, 1012, 360);

  ctx.textAlign = "left";
  ctx.fillStyle = POSTER_COLORS.light;
  ctx.font = '700 108px "Noto Serif SC", serif';
  ctx.fillText("01", margin, 310);
  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = "18px ui-monospace, monospace";
  ctx.fillText("PERSONAL JOURNEY ARCHIVE", 240, 232);
  ctx.fillStyle = POSTER_COLORS.forest;
  ctx.font = `400 25px ${BODY_FONT}`;
  ctx.fillText("一次只属于你的抵达", 240, 276);

  ctx.fillStyle = POSTER_COLORS.moss;
  ctx.font = "700 19px ui-monospace, monospace";
  ctx.fillText(draft.category, margin, 492);
  ctx.fillStyle = POSTER_COLORS.charcoal;
  const title = fitWrappedText(ctx, draft.title || "一次值得记住的抵达", 820, 2, 76, 56, TITLE_FONT, 400);
  ctx.font = `400 ${title.fontSize}px ${TITLE_FONT}`;
  title.lines.forEach((line, index) => ctx.fillText(line, margin, 616 + index * (title.fontSize + 14)));

  const mottoY = 616 + title.lines.length * (title.fontSize + 14) + 48;
  ctx.font = `32px ${BODY_FONT}`;
  const mottoLines = wrapText(ctx, `“${draft.note || "地图可以自己画"}”`, 760).slice(0, 2);
  ctx.strokeStyle = POSTER_COLORS.light;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(margin, mottoY - 32);
  ctx.lineTo(margin, mottoY + (mottoLines.length - 1) * 42 + 18);
  ctx.stroke();
  ctx.fillStyle = POSTER_COLORS.forest;
  mottoLines.forEach((line, index) => ctx.fillText(line, margin + 24, mottoY + index * 42));

  drawRule(ctx, margin, 1450, 1012, 1450);
  ctx.fillStyle = POSTER_COLORS.muted;
  ctx.font = "16px ui-monospace, monospace";
  ctx.fillText("抵达日期", margin, 1500);
  ctx.fillText("抵达地点", 330, 1500);
  ctx.fillText("记录状态", 592, 1500);
  ctx.fillStyle = POSTER_COLORS.forest;
  ctx.font = "700 22px ui-monospace, monospace";
  ctx.fillText(formatStampDate(draft.date).compact, margin, 1540);
  ctx.font = `400 22px ${BODY_FONT}`;
  wrapText(ctx, draft.location || "未标记地点", 220).slice(0, 2).forEach((line, index) => ctx.fillText(line, 330, 1540 + index * 27));
  ctx.fillText("已盖章", 592, 1540);

  drawStamp(ctx, draft.style, draft, 840, 1670, draft.style === "classic" ? 0.65 : 0.57);
  drawPosterFooter(ctx, 1080, height, margin);
}

export function renderPassportCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLCanvasElement | null,
  draft: StampDraft,
) {
  let posterImage = image;
  if (image && draft.texture === "experimental") {
    const achievement: AchievementCard = {
      id: draft.achievementId ?? "custom-arrival",
      category: draft.category,
      icon: draft.icon,
      title: draft.title || "一次值得记住的抵达",
      motto: draft.note || "这一程已经被记录",
      description: "",
      rate: formatStampDate(draft.date).compact,
      rarity: "传说",
    };
    const filteredImage = document.createElement("canvas");
    renderAchievementCanvas(filteredImage, image, achievement, {
      ...DEFAULT_SETTINGS,
      filter: draft.experimentalFilter as FilterId,
      includeCard: false,
      showRate: false,
      showRarity: false,
    });
    posterImage = filteredImage;
  }

  const { width, height } = PASSPORT_FORMAT;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawPaperBackground(ctx, width, height);
  if (posterImage) {
    drawPortraitPhotoPoster(ctx, posterImage, draft);
    return;
  }
  drawPortraitTextArchive(ctx, draft);
}
