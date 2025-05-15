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
  // Applications
  pdf: "application/pdf",
  zip: "application/zip",
  // Add more as needed
};

export function getMimeType(filenameOrPath: string): string {
  const extension = filenameOrPath.split(".").pop()?.toLowerCase() || "";
  return mimeTypes[extension] || "application/octet-stream"; // Default if unknown
}

export function generateFilenameFromTimestamp(extension: string = "txt"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `clip-${timestamp}.${extension.replace(/^\./, "")}`;
} 