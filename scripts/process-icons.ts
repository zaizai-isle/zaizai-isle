import fs from 'fs';
import path from 'path';

const iconCodes = [
  100, 150, // Sunny
  101, 151, // Cloudy
  102, 152, // Few Clouds
  103, 153, // Partly Cloudy
  104,      // Overcast
  2528,     // Windy (Strong Wind)
  300, 350, // Shower Rain
  301, 351, // Heavy Shower Rain
  302,      // Thundershower
  303,      // Heavy Thundershower
  304,      // Thundershower with Hail
  305,      // Light Rain
  306,      // Moderate Rain
  307,      // Heavy Rain
  308,      // Extreme Rain
  309,      // Drizzle
  310,      // Storm
  311,      // Heavy Storm
  312,      // Severe Storm
  313,      // Freezing Rain
  314,      // Small to Moderate Rain
  315,      // Moderate to Heavy Rain
  316,      // Heavy Rain to Storm
  317,      // Storm to Heavy Storm
  318,      // Heavy to Severe Storm
  399,      // Rain
  400,      // Light Snow
  401,      // Moderate Snow
  402,      // Heavy Snow
  403,      // Snowstorm
  404,      // Sleet
  405,      // Rain and Snow
  406, 456, // Shower Snow
  407, 457, // Snow Flurry
  408,      // Light to Moderate Snow
  409,      // Moderate to Heavy Snow
  410,      // Heavy Snow to Snowstorm
  499,      // Snow
  500,      // Mist
  501,      // Fog
  502,      // Haze
  503,      // Sand
  504,      // Dust
  507,      // Sandstorm
  508,      // Heavy Sandstorm
  509,      // Dense Fog
  510,      // Strong Dense Fog
  511,      // Moderate Haze
  512,      // Heavy Haze
  513,      // Severe Haze
  514,      // Heavy Fog
  515,      // Strong Heavy Fog
];

const GRADIENT_DEFS = `
  <defs>
    <!-- 滤镜定义：玻璃投影 -->
    <filter id="glass-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.15)"/>
    </filter>

    <filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="rgba(250,108,33,0.4)"/>
    </filter>

    <!-- 太阳系 -->
    <linearGradient id="sun-gradient-day" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD358"/>
      <stop offset="100%" stop-color="#FA6C21"/>
    </linearGradient>

    <!-- 月亮系 -->
    <linearGradient id="moon-gradient-night" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#DCEEFF"/>
    </linearGradient>

    <!-- 云朵系 (玻璃质感渐变) -->
    <linearGradient id="cloud-gradient-day" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.5"/>
    </linearGradient>
    
    <linearGradient id="cloud-gradient-night" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.2"/>
    </linearGradient>

    <!-- 雨滴系 -->
    <linearGradient id="raindrop-gradient-normal" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#56CCF2"/>
      <stop offset="100%" stop-color="#2F80ED"/>
    </linearGradient>

    <linearGradient id="raindrop-gradient-heavy" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#2F80ED"/>
      <stop offset="100%" stop-color="#1B4F93"/>
    </linearGradient>

    <!-- 雪花系 -->
    <linearGradient id="snowflake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="100%" stop-color="#E1F5FE" stop-opacity="0.8"/>
    </linearGradient>

    <!-- 雷电系 -->
    <linearGradient id="thunder-gradient" x1="10.11%" y1="0%" x2="63.87%" y2="100%">
      <stop offset="0%" stop-color="#FFD200"/>
      <stop offset="100%" stop-color="#FF4D00"/>
    </linearGradient>

    <!-- 雾霾/沙尘系 -->
    <linearGradient id="haze-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FDF5E6" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#FddfAF" stop-opacity="0.7"/>
    </linearGradient>

    <!-- 大风系 -->
    <linearGradient id="wind-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E0F2F1"/>
    </linearGradient>
  </defs>`;

const STYLE_DEFS = `
  <style>
    /* 太阳系 */
    .sun-day { 
        fill: url(#sun-gradient-day); 
        filter: url(#sun-glow);
    }
    .sun-ray { fill: #FFA500; opacity: 0.8; }
    
    /* 月亮系 */
    .moon-night { 
        fill: url(#moon-gradient-night); 
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)); 
    }
    .moon-star { fill: #ffffff; opacity: 0.9; }
    
    /* 云朵系 - 核心玻璃质感 */
    .cloud-day { 
        fill: url(#cloud-gradient-day); 
        stroke: rgba(255,255,255,0.8);
        stroke-width: 0.2px;
        filter: url(#glass-shadow);
    }
    .cloud-night { 
        fill: url(#cloud-gradient-night); 
        stroke: rgba(255,255,255,0.4);
        stroke-width: 0.2px;
        filter: url(#glass-shadow);
    }

    /* 雨滴系 */
    .raindrop-normal { 
        fill: url(#raindrop-gradient-normal); 
        stroke: rgba(255,255,255,0.3);
        stroke-width: 0.2px;
    }
    .raindrop-heavy { 
        fill: url(#raindrop-gradient-heavy); 
        stroke: rgba(255,255,255,0.2);
        stroke-width: 0.2px;
    }
    
    /* 雪花系 */
    .snowflake { 
        fill: url(#snowflake-gradient); 
        stroke: rgba(255,255,255,0.5);
        stroke-width: 0.2px;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
    }
    
    /* 雷电系 */
    .thunder { 
        fill: url(#thunder-gradient); 
        filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); 
    }

    /* 雾霾系 */
    .fog-light { 
        fill: rgba(255,255,255,0.6); 
        stroke: rgba(255,255,255,0.3);
        stroke-width: 0.1px;
    }
    .haze-light { 
        fill: url(#haze-gradient); 
        stroke: rgba(253, 223, 175, 0.4);
        stroke-width: 0.1px;
    }
    
    /* 大风系 */
    .wind { 
        fill: url(#wind-gradient); 
        stroke: rgba(255,255,255,0.4);
        stroke-width: 0.1px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
    }
  </style>
`;

const SRC_DIR = path.join(process.cwd(), 'node_modules/qweather-icons/icons');
const DEST_DIR = path.join(process.cwd(), 'src/assets/weather-icons');
const TARGET_DIR = path.join(process.cwd(), 'node_modules/qweather-icons');

// Helper to split path data into subpaths, converting relative 'm' to absolute 'M'
function splitPathData(d: string): string[] {
  const segments = d.match(/([MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*)/g);
  if (!segments) return [];
  
  const paths: string[] = [];
  let currentPathCmds: string[] = [];
  let lastStart = { x: 0, y: 0 };
  
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].trim();
    const cmd = seg[0];
    const params = seg.slice(1).match(/-?\d*\.?\d+/g)?.map(parseFloat) || [];
    
    if (cmd === 'M') {
      if (currentPathCmds.length > 0) {
        paths.push(currentPathCmds.join(''));
        currentPathCmds = [];
      }
      lastStart = { x: params[0], y: params[1] };
      currentPathCmds.push(seg);
    } else if (cmd === 'm') {
      if (currentPathCmds.length > 0) {
        paths.push(currentPathCmds.join(''));
        currentPathCmds = [];
      }
      const newX = lastStart.x + (params[0] || 0);
      const newY = lastStart.y + (params[1] || 0);
      lastStart = { x: newX, y: newY };
      
      let newSeg = `M${newX} ${newY}`;
      if (params.length > 2) {
        const extra = params.slice(2).join(' ');
        newSeg += `l${extra}`;
      }
      currentPathCmds.push(newSeg);
    } else {
      currentPathCmds.push(seg);
    }
  }
  
  if (currentPathCmds.length > 0) {
    paths.push(currentPathCmds.join(''));
  }
  
  return paths;
}

// Helper to analyze path statistics for classification
function getApproxMetrics(d: string) {
  const commands = d.match(/([a-zA-Z][^a-zA-Z]*)/g) || [];
  let x = 0, y = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let segmentCount = 0;
  
  const updateBounds = (px: number, py: number) => {
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  };

  commands.forEach(cmdStr => {
    const type = cmdStr[0];
    const args = cmdStr.slice(1).match(/-?\d*\.?\d+/g)?.map(parseFloat) || [];
    const isRel = type === type.toLowerCase();
    const upperType = type.toUpperCase();
    
    let stride = 0;
    switch (upperType) {
      case 'M': stride = 2; break;
      case 'L': stride = 2; break;
      case 'T': stride = 2; break;
      case 'H': stride = 1; break;
      case 'V': stride = 1; break;
      case 'C': stride = 6; break;
      case 'S': stride = 4; break;
      case 'Q': stride = 4; break;
      case 'A': stride = 7; break;
      case 'Z': stride = 0; break;
    }

    if (stride > 0) {
      for (let i = 0; i < args.length; i += stride) {
        segmentCount++;
        // Get the target point (last 2 args for most, 1 arg for H/V)
        if (upperType === 'H') {
          const val = args[i];
          if (isRel) x += val; else x = val;
          updateBounds(x, y);
        } else if (upperType === 'V') {
          const val = args[i];
          if (isRel) y += val; else y = val;
          updateBounds(x, y);
        } else {
          // x, y are always the last 2 in the stride
          const tx = args[i + stride - 2];
          const ty = args[i + stride - 1];
          if (isRel) { x += tx; y += ty; }
          else { x = tx; y = ty; }
          updateBounds(x, y);
        }
      }
    } else if (upperType === 'Z') {
        segmentCount++;
    }
  });

  if (minX === Infinity) return { width: 0, height: 0, diagonal: 0, segmentCount, minY: 0, minX: 0 };
  const width = maxX - minX;
  const height = maxY - minY;
  return { width, height, diagonal: Math.hypot(width, height), segmentCount, minY, minX };
}

function analyzePathStats(d: string) {
  const hasCurves = /[cCsSqQtT]/.test(d);
  const hasArcs = /[aA]/.test(d);
  const metrics = getApproxMetrics(d);
  
  return {
    charLength: d.length,
    cmdCount: (d.match(/[a-zA-Z]/g) || []).length, // Keep for legacy if needed, but segmentCount is better
    hasCurves,
    hasArcs,
    hasCurvesOrArcs: hasCurves || hasArcs,
    isClosed: /[zZ]/.test(d),
    ...metrics
  };
}


function applyColorRules(content: string, code: number): string {
  // 1. Extract all d attributes from ALL paths
  const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*>/g;
  const matches = [...content.matchAll(pathRegex)];
  
  if (matches.length === 0) return content;
  
  const allSubPaths: string[] = [];
  matches.forEach(m => {
    const d = m[1];
    const subs = splitPathData(d);
    if (subs) allSubPaths.push(...subs);
  });
  
  if (allSubPaths.length === 0) return content;

  // Analysis Phase
  const analyzedPaths = allSubPaths.map((d, index) => {
    const stats = analyzePathStats(d);
    return { d, ...stats, index, type: 'unknown' };
  });

  // Classification Logic
  // Night files: 150, 151, 152, 153, 350, 351, 456, 457
  const NIGHT_FILES = [150, 151, 152, 153, 350, 351, 456, 457];
  const isNight = NIGHT_FILES.includes(code);
  
  const isRain = (code >= 300 && code < 400);
  const isSnow = (code >= 400 && code < 500);
  const isFog = (code >= 500 && code <= 515);
  const isThunder = [302, 303, 304].includes(code);
  const isWind = (code >= 2000 && code < 3000);
  
  // Sort candidates by size (diagonal) to find major elements
  const sortedBySize = [...analyzedPaths].sort((a, b) => b.diagonal - a.diagonal);

  // --- Group A: Sun/Cloud (1xx) ---
  if (code >= 100 && code < 200) {
    const isSunny = [100, 150].includes(code);
    
    // 1. Classify Small Elements (Rays/Stars)
    analyzedPaths.forEach(p => {
      // Use charLength check to avoid misclassifying complex shapes (like Sun Body) 
      // that might have small calculated bounds due to Arc issues
      if (p.diagonal <= 4 && p.charLength < 150) {
        // Strict Ray check for Mixed Cloud+Sun (102, 103, etc) to avoid holes becoming rays
        if ([102, 152, 103, 153].includes(code)) {
            // Rays should be high up (minY < 9)
            if (p.minY < 9) {
                 p.type = isNight ? 'moon-star' : 'sun-ray';
            }
            // Else leave as unknown (will be handled by hole removal later)
        } else if (code === 104) {
            // No rays in Overcast
        } else {
            p.type = isNight ? 'moon-star' : 'sun-ray';
        }
      }
    });

    // 1.5 Remove Holes (Small Unknowns in specific icons)
    // Fix for "hollow" clouds: Remove small internal paths (holes) to make cloud solid
    if ([102, 152, 103, 153, 104].includes(code)) {
        analyzedPaths.forEach(p => {
            if (p.type === 'unknown' && p.diagonal <= 5) {
                p.type = 'remove';
            }
        });
    }
  
    // 2. Classify Large Elements (Sun/Moon vs Cloud)
    const largeUnknowns = analyzedPaths.filter(p => p.type === 'unknown');

    if (isSunny) {
      // In pure sunny/moon icons, all large bodies are the main element
      largeUnknowns.forEach(p => {
        p.type = isNight ? 'moon-night' : 'sun-day';
      });
    } else if (code === 104) {
       // Overcast - all are clouds
       largeUnknowns.forEach(p => {
         p.type = isNight ? 'cloud-night' : 'cloud-day';
       });
    } else {
      // Mixed Cloud + Sun/Moon (101, 102, 103, 151, 152, 153)
      // Sort by vertical position (minY). The highest element (lowest minY) is the Sun/Moon.
      // This assumes the celestial body is always positioned higher than the cloud.
      
      largeUnknowns.sort((a, b) => a.minY - b.minY);
      
      largeUnknowns.forEach((p, index) => {
        // The first one (highest) is Sun/Moon
        // Note: For 102 (Few Clouds), if there are multiple sun parts, this might be risky,
        // but typically Sun is one path. If there are multiple clouds, they become clouds.
        if (index === 0) {
           p.type = isNight ? 'moon-night' : 'sun-day';
        } else {
           p.type = isNight ? 'cloud-night' : 'cloud-day';
        }
      });
    }
  }
  
  // --- Group B: Rain (3xx) ---
  else if (isRain) {
    // 1. Cloud (Exclude 399 which is pure Rain)
    if (code !== 399) {
      const cloudCandidate = sortedBySize.find(p => p.hasCurvesOrArcs && p.diagonal > 5);
      if (cloudCandidate) {
        cloudCandidate.type = isNight ? 'cloud-night' : 'cloud-day';
      }
    }
    
    // 2. Thunder
    if (isThunder) {
      // Thunder is usually the largest remaining element
      const thunder = sortedBySize.find(p => p.type === 'unknown' && p.diagonal > 3); 
      if (thunder) thunder.type = 'thunder';
    }
    
    // 3. Sun/Moon and Raindrops
    analyzedPaths.forEach(p => {
      if (p.type === 'unknown') {
        // Heavy rain codes: 301, 303, 307, 308, 310, 311, 312, 315, 316, 317, 318, 351
        const isHeavy = [301, 303, 307, 308, 310, 311, 312, 315, 316, 317, 318, 351].includes(code);
        const isShower = [300, 301, 350, 351].includes(code);

        if (isShower) {
           if (p.diagonal > 4.5) {
              p.type = isNight ? 'moon-night' : 'sun-day';
           } else if (p.minY < 8) {
              // Small elements in upper half -> Rays/Stars
              p.type = isNight ? 'moon-star' : 'sun-ray';
           } else {
              // Lower half -> Raindrops
              p.type = isHeavy ? 'raindrop-heavy' : 'raindrop-normal';
           }
        } else {
           // Standard Rain (No Sun/Moon expected)
           p.type = isHeavy ? 'raindrop-heavy' : 'raindrop-normal';
        }
      }
    });
  }
  
  // --- Group C: Snow (4xx) ---
  else if (isSnow) {
    // 1. Cloud (Exclude 499 which is pure Snow)
    if (code !== 499) {
      const cloudCandidate = sortedBySize.find(p => p.hasCurvesOrArcs && p.diagonal > 5);
      if (cloudCandidate) {
        cloudCandidate.type = isNight ? 'cloud-night' : 'cloud-day';
      }
    }
    
    // 2. Snowflakes
    analyzedPaths.forEach(p => {
      if (p.type === 'unknown') {
        // Special handling for Rain/Snow Mix (404, 405, 406, 456)
        // Identify simple "drop" shapes (low segment count) vs complex snowflakes
        if ([404, 405, 406, 456].includes(code)) {
           // Raindrops are simple shapes (approx 5 segments)
           // Snowflakes are complex (>= 20 segments)
           if (p.segmentCount <= 8 && p.minY > 5) {
              p.type = 'raindrop-normal';
              return; 
           }
        }

        // Shower Snow/Flurry: 406, 456, 407, 457 (Contain Sun/Moon)
        const isShowerSnow = [406, 456, 407, 457].includes(code);
        
        if (isShowerSnow) {
           if (p.diagonal > 4.5) {
              p.type = isNight ? 'moon-night' : 'sun-day';
           } else if (p.minY < 8 && p.diagonal < 3) {
              // Small elements in upper half -> Rays/Stars
              p.type = isNight ? 'moon-star' : 'sun-ray';
           } else {
              p.type = 'snowflake';
           }
        } else {
           p.type = 'snowflake';
        }
      }
    });
  }
  
  // --- Group D: Fog/Sand (5xx) ---
  else if (isFog) {
    analyzedPaths.forEach(p => {
      // Sand/Dust/Haze group vs Mist/Fog group
      // Haze/Sand: 502, 503, 504, 507, 508, 511, 512, 513
      const isHazeOrSand = [502, 503, 504, 507, 508, 511, 512, 513].includes(code);
      if (isHazeOrSand) {
          p.type = 'haze-light';
      } else {
          // Fog/Mist: 500, 501, 509, 510, 514, 515
          // Separate Cloud (upper, complex) from Fog Lines (lower, flat)
          if (p.height > 3 && p.hasCurvesOrArcs) {
             p.type = 'cloud-day';
          } else {
             p.type = 'fog-light';
          }
      }
    });
  }
  // --- Group E: Wind (2xxx) ---
  else if (isWind) {
    analyzedPaths.forEach(p => {
      if (p.type === 'unknown') {
        p.type = 'wind';
      }
    });
  }

  // Merge Logic: Merge transparent paths to prevent overlap artifacts (double opacity)
  let finalPaths = analyzedPaths.filter(p => p.type !== 'remove');
  const MERGE_TYPES = ['cloud-day', 'cloud-night', 'fog-light', 'haze-light'];
  
  MERGE_TYPES.forEach(targetType => {
     const pathsToMerge = finalPaths.filter(p => p.type === targetType);
     if (pathsToMerge.length > 1) {
        // Concatenate d attributes
        const mergedD = pathsToMerge.map(p => p.d).join(' ');
        const primary = pathsToMerge[0]; 
        
        const mergedPath = {
           ...primary,
           d: mergedD,
           segmentCount: pathsToMerge.reduce((acc, p) => acc + p.segmentCount, 0),
           // Recalculate diagonal for logging purposes (approximate)
           diagonal: Math.max(...pathsToMerge.map(p => p.diagonal)) 
        };
        
        // Remove individual paths and add merged path
        finalPaths = finalPaths.filter(p => p.type !== targetType);
        finalPaths.push(mergedPath);
     }
  });

  // Z-Order Sorting (Background -> Foreground)
  const TYPE_ORDER = [
    // Background
    'sun-day', 'moon-night', 'sun-ray', 'moon-star', 
    // Middle
    'cloud-day', 'cloud-night', 
    // Foreground
    'raindrop-normal', 'raindrop-heavy', 'snowflake', 
    'fog-light', 'haze-light', 'thunder'
  ];

  finalPaths.sort((a, b) => {
    const idxA = TYPE_ORDER.indexOf(a.type);
    const idxB = TYPE_ORDER.indexOf(b.type);
    // If unknown or same type, maintain original relative order? 
    // Or use diagonal size?
    // Let's rely on type order primarily.
    const valA = idxA === -1 ? 999 : idxA;
    const valB = idxB === -1 ? 999 : idxB;
    return valA - valB;
  });

  // Construct new Paths
  const newPaths = finalPaths.map(p => {
    return `<path class="${p.type}" d="${p.d}" />`;
  }).join('\n');
  
  // Log classification results
  const classificationLog = finalPaths
    .filter(p => p.type !== 'unknown')
    .map(p => `  - Path ${p.index} (diag: ${p.diagonal.toFixed(2)}, segs: ${p.segmentCount}): ${p.type}`)
    .join('\n');
  console.log(`[Log] ${code}:\n${classificationLog}`);
  
  // Replace ALL original paths
  // 1. Remove all existing <path> tags
  let newContent = content.replace(/<path[^>]*>(?:<\/path>)?/gi, '');
  // 2. Remove extra newlines left behind
  newContent = newContent.replace(/^\s*[\r\n]/gm, '');
  
  // 3. Insert new paths before </svg>
  if (newContent.includes('</svg>')) {
    newContent = newContent.replace('</svg>', `\n${newPaths}\n</svg>`);
  } else {
    // Should not happen, but fallback
    newContent += `\n${newPaths}`;
  }
  
  // Inject STYLE_DEFS if not present
  if (!newContent.includes('style>')) {
    newContent = newContent.replace('</defs>', `${STYLE_DEFS}</defs>`);
  }
  
  return newContent;
}

function processIcons() {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const generatedMap: Record<number, string> = {};

  iconCodes.forEach(code => {
    // Determine source file name (prefer -fill)
    let srcFile = `${code}.svg`;
    const fillFile = `${code}-fill.svg`;
    
    if (code < 800 || code > 899) {
      if (fs.existsSync(path.join(SRC_DIR, fillFile))) {
        srcFile = fillFile;
      }
    }

    const srcPath = path.join(SRC_DIR, srcFile);
    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf-8');
      
      // 1. Inject Gradients
      const svgTagMatch = content.match(/<svg[^>]*>/);
      if (svgTagMatch) {
        const insertPos = svgTagMatch.index! + svgTagMatch[0].length;
        content = content.slice(0, insertPos) + GRADIENT_DEFS + content.slice(insertPos);
        
        // 2. Apply Rules (Classify and Styling)
        content = applyColorRules(content, code);
        
        // Write to dest
        fs.writeFileSync(path.join(DEST_DIR, `${code}.svg`), content);
        // Write to target (node_modules/qweather-icons)
        fs.writeFileSync(path.join(TARGET_DIR, `${code}.svg`), content);
        console.log(`Processed ${code}.svg`);
        
        // Store in map (remove newlines to save space/clean up)
        generatedMap[code] = content.replace(/\r?\n/g, '');
      } else {
        console.error(`Could not find <svg> tag in ${srcFile}`);
      }
    } else {
      console.error(`Source file not found for code ${code}: ${srcPath}`);
    }
  });

  // Generate Map File
  const mapContent = `/* Auto-generated by scripts/process-icons.ts */
export const WeatherIconsMap: Record<number, string> = ${JSON.stringify(generatedMap, null, 2)};
`;
  const mapPath = path.join(process.cwd(), 'src/components/generated/WeatherIconsMap.ts');
  
  // Ensure dir exists
  const mapDir = path.dirname(mapPath);
  if (!fs.existsSync(mapDir)) {
    fs.mkdirSync(mapDir, { recursive: true });
  }

  fs.writeFileSync(mapPath, mapContent);
  console.log(`Generated icon map at ${mapPath}`);
}

processIcons();
