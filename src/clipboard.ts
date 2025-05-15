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

export type ClipboardContent = ClipboardText | ClipboardFilePath | ClipboardFileContent;

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
    '  set thePasteboard to the clipboard as «class furl»',
    '  copy thePasteboard to end of thePaths',
    'on error',
    '  try',
    '    set thePasteboard to the clipboard as list',
    '    repeat with i in thePasteboard',
    '      if class of i is «class furl» then',
    '        copy i to end of thePaths',
    '      end if',
    '    end repeat',
    '  end try',
    'end try',
    'set posixPaths to {}',
    'repeat with i in thePaths',
    '  set end of posixPaths to POSIX path of i',
    'end repeat',
    'return posixPaths as string'
  ].join('\n');
  
  try {
    const result = await runCommand("osascript", ["-e", script]);
    return result.split(", ").map(path => path.trim()).filter(Boolean);
  } catch (error) {
    console.warn("Failed to get file paths from clipboard:", error);
    return [];
  }
}

// Helper to check if file size is within limit (10MB)
async function isFileSizeWithinLimit(path: string, limitMB: number = 10): Promise<boolean> {
  try {
    const fileInfo = await Deno.stat(path);
    return fileInfo.size <= limitMB * 1024 * 1024;
  } catch (error) {
    console.warn("Failed to check file size:", error);
    return false;
  }
}

export async function getClipboardContent(): Promise<ClipboardContent> {
  try {
    let content: string;
    let filePaths: string[] = [];

    switch (Deno.build.os) {
      case "darwin": // macOS
        // First try to get file paths
        filePaths = await getMacOSFilePaths();
        if (filePaths.length > 0) {
          if (filePaths.length === 1) {
            const path = filePaths[0];
            if (await isFileSizeWithinLimit(path)) {
              try {
                const content = await Deno.readFile(path);
                return { type: "file_content", path, content };
              } catch (error) {
                console.warn("Failed to read file content:", error);
                return { type: "file", path };
              }
            } else {
              throw new Error("File size exceeds 10MB limit");
            }
          } else {
            throw new Error("Multiple files are not supported");
          }
        }
        // If no files found, fall back to text content
        content = await runCommand("pbpaste", []);
        break;
      case "linux":
        try {
          content = await runCommand("xclip", ["-o", "-selection", "clipboard"]);
        } catch (_e) {
          // Fallback to xsel if xclip is not available or fails
          console.warn("xclip failed, trying xsel. Please ensure xclip or xsel is installed.");
          try {
            content = await runCommand("xsel", ["--clipboard", "--output"]);
          } catch (_e2) {
            throw new Error(
              "Failed to read from clipboard using xclip and xsel. Please ensure one of them is installed and configured.",
            );
          }
        }
        break;
      case "windows":
        content = await runCommand("powershell", ["-command", "Get-Clipboard"]);
        break;
      default:
        throw new Error(`Unsupported OS: ${Deno.build.os} for clipboard access.`);
    }

    // Basic check for other OS or fallback
    if (!content.includes("\n")) {
      try {
        const fileInfo = await Deno.stat(content);
        if (fileInfo.isFile) {
          if (await isFileSizeWithinLimit(content)) {
            try {
              const fileContent = await Deno.readFile(content);
              return { type: "file_content", path: content, content: fileContent };
            } catch (error) {
              console.warn("Failed to read file content:", error);
              return { type: "file", path: content };
            }
          } else {
            throw new Error("File size exceeds 10MB limit");
          }
        }
      } catch (_e) {
        // Not a valid path or file doesn't exist, treat as text
      }
    }
    return { type: "text", content };

  } catch (error) {
    console.error("Error reading from clipboard:", (error as Error).message);
    throw error;
  }
} 