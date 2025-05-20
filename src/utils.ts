import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";


const mimeTypes: Record<string, string> = {
  // Text based
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  xml: "application/xml",
  md: "text/markdown",
  csv: "text/csv",
  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  // Video
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
  // Applications
  pdf: "application/pdf",
  zip: "application/zip",
  // Add more as needed
};

export function getMimeType(filenameOrPath: string): string {
  const extension = filenameOrPath.split(".").pop()?.toLowerCase() || "";
  return mimeTypes[extension] || "application/octet-stream"; // Default if unknown
}

// Generate a random short code (6 characters)
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateFilenameFromTimestamp(extension: string = "txt"): string {
  const shortCode = generateShortCode();
  return `clip-${shortCode}.${extension.replace(/^\./, "")}`;
}

interface ContentFormat {
  format: string;
  extension: string;
  confidence: number;
}

export function detectContentFormat(content: string): ContentFormat {
  // Remove leading/trailing whitespace for analysis
  const trimmedContent = content.trim();
  
  // Video detection (basic check for video file extensions)
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const extension = trimmedContent.split('.').pop()?.toLowerCase();
  if (extension && videoExtensions.includes(extension)) {
    return { format: "video", extension, confidence: 0.9 };
  }
  
  // JSON detection
  try {
    JSON.parse(trimmedContent);
    return { format: "json", extension: "json", confidence: 1.0 };
  } catch {
    // Not JSON, continue with other checks
  }

  // HTML detection
  if (/^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/i.test(trimmedContent) || 
      /<html[^>]*>[\s\S]*<\/html>/i.test(trimmedContent)) {
    return { format: "html", extension: "html", confidence: 0.9 };
  }

  // XML detection
  if (/^<\?xml[^>]*\?>[\s\S]*<[^>]+>[\s\S]*<\/[^>]+>$/i.test(trimmedContent)) {
    return { format: "xml", extension: "xml", confidence: 0.9 };
  }

  // Markdown detection
  if (/^#{1,6}\s+.+$/m.test(trimmedContent) || 
      /\[.+\]\(.+\)/.test(trimmedContent) ||
      /^\s*[-*+]\s+.+$/m.test(trimmedContent)) {
    return { format: "markdown", extension: "md", confidence: 0.8 };
  }

  // CSV detection
  if (/^([^,\n]+,)+[^,\n]+$/m.test(trimmedContent) && 
      trimmedContent.split('\n').length > 1) {
    return { format: "csv", extension: "csv", confidence: 0.7 };
  }

  // JavaScript detection (basic)
  if (/^(function|const|let|var|class|import|export)\s+/.test(trimmedContent) ||
      /=>\s*{/.test(trimmedContent)) {
    return { format: "javascript", extension: "js", confidence: 0.7 };
  }

  // CSS detection
  if (/^[^{}]*{[^{}]*}/.test(trimmedContent) || 
      /@(media|keyframes|import|font-face)/.test(trimmedContent)) {
    return { format: "css", extension: "css", confidence: 0.8 };
  }

  // Default to plain text
  return { format: "plain", extension: "txt", confidence: 1.0 };
}

/**
 * Convert image to JPEG using ImageScript (WASM based).
 */
export async function convertToJpg(imageData: Uint8Array): Promise<Uint8Array> {
  try {
    // 尝试解析图片
    const image = await Image.decode(imageData);

    // 转换成 JPEG，设置压缩质量为 90（目前不支持 mozjpeg）
    const jpegBuffer = await image.encodeJPEG(90);
    return jpegBuffer;
  } catch (error) {
    console.error("Failed to convert image:", error);
    throw new Error("Failed to convert image to JPG format");
  }
}