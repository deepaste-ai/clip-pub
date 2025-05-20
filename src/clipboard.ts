export interface ClipboardText {
  type: "text";
  content: string;
}

export interface ClipboardFilePath {
  type: "file";
  path: string;
}

export interface ClipboardFileContent {
  type: "file_content";
  path: string;
  content: Uint8Array;
}

export interface ClipboardImage {
  type: "image";
  content: Uint8Array;
  format: "png" | "jpg";
}

export type ClipboardContent = ClipboardText | ClipboardFilePath | ClipboardFileContent | ClipboardImage;

// Helper to run a command and get its output
async function runCommand(cmd: string, args: string[]): Promise<string> {
  const command = new Deno.Command(cmd, {
    args,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}\n${errorText}`);
  }
  return new TextDecoder().decode(stdout).trim();
}

// Helper to get file paths from macOS clipboard using AppleScript
async function getMacOSFilePaths(): Promise<string[]> {
  const script = [
    'set thePaths to {}',
    'try',
    '  set clipboardType to class of (the clipboard)',
    '  log "Clipboard type: " & clipboardType',
    '  if clipboardType is «class furl» then',
    '    set thePasteboard to the clipboard as «class furl»',
    '    if thePasteboard is not missing value then',
    '      copy thePasteboard to end of thePaths',
    '    end if',
    '  else if clipboardType is list then',
    '    set thePasteboard to the clipboard as list',
    '    if thePasteboard is not missing value then',
    '      repeat with i in thePasteboard',
    '        if class of i is «class furl» then',
    '          copy i to end of thePaths',
    '        end if',
    '      end repeat',
    '    end if',
    '  else',
    '    -- Try to get file paths using a different approach',
    '    try',
    '      set fileList to (the clipboard as «class furl») as list',
    '      repeat with aFile in fileList',
    '        if class of aFile is «class furl» then',
    '          copy aFile to end of thePaths',
    '        end if',
    '      end repeat',
    '    on error',
    '      log "Clipboard contains non-file content of type: " & clipboardType',
    '    end try',
    '  end if',
    'on error errMsg',
    '  log "Error processing clipboard: " & errMsg',
    'end try',
    'set posixPaths to {}',
    'repeat with i in thePaths',
    '  set end of posixPaths to POSIX path of i',
    'end repeat',
    'return posixPaths as string'
  ].join('\n');
  
  try {
    const result = await runCommand("osascript", ["-e", script]);
    console.log("AppleScript result:", result);
    // Only return paths if we actually got some valid paths
    const paths = result.split(", ").map(path => path.trim()).filter(Boolean);
    console.log("Processed paths:", paths);
    return paths;
  } catch (error) {
    console.log("AppleScript error:", error);
    // If we get an error, it's likely not a file path, so return empty array
    return [];
  }
}

// Helper to check if file size is within limit (20MB)
async function isFileSizeWithinLimit(path: string, limitMB: number = 20): Promise<boolean> {
  try {
    const fileInfo = await Deno.stat(path);
    return fileInfo.size <= limitMB * 1024 * 1024;
  } catch (error) {
    console.warn("Failed to check file size:", error);
    return false;
  }
}

// Helper to get image data from macOS clipboard using AppleScript
async function getMacOSImageData(): Promise<Uint8Array | null> {
  const script = `
    try
      set imageData to (the clipboard as «class PNGf»)
      if imageData is not missing value then
        set tempFile to (POSIX path of (path to temporary items)) & "clipboard_image.png"
        set fileRef to open for access tempFile with write permission
        write imageData to fileRef
        close access fileRef
        return tempFile
      end if
    on error
      try
        set imageData to (the clipboard as «class JPEG»)
        if imageData is not missing value then
          set tempFile to (POSIX path of (path to temporary items)) & "clipboard_image.jpg"
          set fileRef to open for access tempFile with write permission
          write imageData to fileRef
          close access fileRef
          return tempFile
        end if
      on error
        return missing value
      end try
    end try
  `;

  try {
    const tempFile = await runCommand("osascript", ["-e", script]);
    if (tempFile && tempFile !== "missing value") {
      const imageData = await Deno.readFile(tempFile);
      // Clean up temp file
      try {
        await Deno.remove(tempFile);
      } catch (e) {
        console.warn("Failed to clean up temp file:", e);
      }
      return imageData;
    }
  } catch (error) {
    console.log("AppleScript image error:", error);
  }
  return null;
}

export async function getClipboardContent(): Promise<ClipboardContent | undefined> {
  try {
    let content: string;
    let filePaths: string[] = [];

    switch (Deno.build.os) {
      case "darwin": { // macOS
        // First try to get image data
        console.log("Checking for image data in clipboard...");
        const imageData = await getMacOSImageData();
        if (imageData) {
          console.log("Found image data in clipboard");
          return {
            type: "image",
            content: imageData,
            format: "png" // We'll convert to jpg later
          };
        }

        // If no image, continue with existing logic
        console.log("Getting clipboard content using pbpaste...");
        content = await runCommand("pbpaste", []);
        console.log("Clipboard content length:", content.length);

        // Check if the content looks like a filename (contains a dot and no newlines)
        if (content && !content.includes("\n") && /^[^/\\]+\.\w+$/.test(content)) {
          console.log("Content looks like a filename with extension, getting full path using AppleScript...");
          // Try to get the full file path using AppleScript
          filePaths = await getMacOSFilePaths();
          console.log("File paths from AppleScript:", filePaths);

          if (filePaths.length === 1) {
            const path = filePaths[0];
            console.log("Single file path found:", path);
            try {
              const fileInfo = await Deno.stat(path);
              if (fileInfo.isFile) {
                console.log("Content is a valid file path");
                if (await isFileSizeWithinLimit(path)) {
                  try {
                    const fileContent = await Deno.readFile(path);
                    return { type: "file_content", path, content: fileContent };
                  } catch (error) {
                    console.warn("Failed to read file content:", error);
                    return { type: "file", path };
                  }
                } else {
                  throw new Error("File size exceeds 10MB limit");
                }
              }
            } catch (_error) {
              console.log("Not a valid file path, treating as text content");
            }
          } else if (filePaths.length > 1) {
            console.log("Multiple files detected, treating as text content");
          }
        }

        // If we get here, treat as text content
        return { type: "text", content };
      }
      case "linux":
        // For Linux, we'll need to use xclip with -t image/png or -t image/jpeg
        try {
          // Try PNG first
          const pngData = await runCommand("xclip", ["-o", "-selection", "clipboard", "-t", "image/png"]);
          if (pngData) {
            return {
              type: "image",
              content: new TextEncoder().encode(pngData),
              format: "png"
            };
          }
        } catch (_e) {
          try {
            // Try JPEG
            const jpegData = await runCommand("xclip", ["-o", "-selection", "clipboard", "-t", "image/jpeg"]);
            if (jpegData) {
              return {
                type: "image",
                content: new TextEncoder().encode(jpegData),
                format: "jpg"
              };
            }
          } catch (_e2) {
            // Fall back to text content
            try {
              content = await runCommand("xclip", ["-o", "-selection", "clipboard"]);
            } catch (_e3) {
              console.warn("xclip failed, trying xsel. Please ensure xclip or xsel is installed.");
              try {
                content = await runCommand("xsel", ["--clipboard", "--output"]);
              } catch (_e4) {
                throw new Error(
                  "Failed to read from clipboard using xclip and xsel. Please ensure one of them is installed and configured.",
                );
              }
            }
            return { type: "text", content };
          }
        }
        // If we get here, no image data was found, try text content
        try {
          content = await runCommand("xclip", ["-o", "-selection", "clipboard"]);
        } catch (_e) {
          content = await runCommand("xsel", ["--clipboard", "--output"]);
        }
        return { type: "text", content };

      case "windows":
        // For Windows, we'll need to use PowerShell to get image data
        try {
          const psScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $clipboard = [System.Windows.Forms.Clipboard]::GetImage()
            if ($clipboard) {
              $ms = New-Object System.IO.MemoryStream
              $clipboard.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
              [Convert]::ToBase64String($ms.ToArray())
            }
          `;
          const imageData = await runCommand("powershell", ["-command", psScript]);
          if (imageData) {
            return {
              type: "image",
              content: new TextEncoder().encode(imageData),
              format: "png"
            };
          }
        } catch (_e) {
          // Fall back to text content
          content = await runCommand("powershell", ["-command", "Get-Clipboard"]);
          return { type: "text", content };
        }
        break;

      default:
        throw new Error(`Unsupported OS: ${Deno.build.os} for clipboard access.`);
    }
  } catch (error) {
    console.error("Error reading from clipboard:", (error as Error).message);
    throw error;
  }
}
