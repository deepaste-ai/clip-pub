export interface ClipboardText {
  type: "text";
  content: string;
}

export interface ClipboardFilePath {
  type: "file";
  path: string;
}

export type ClipboardContent = ClipboardText | ClipboardFilePath;

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

export async function getClipboardContent(): Promise<ClipboardContent> {
  try {
    let content: string;
    switch (Deno.build.os) {
      case "darwin": // macOS
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

    // Basic check: if the content looks like a plausible file path and the file exists,
    // treat it as a file path. This is a heuristic and might need refinement.
    // For simplicity, we'll assume if it's a single line and Deno.stat works, it's a path.
    // More robust file path detection from clipboard is complex.
    if (!content.includes("\n")) {
      try {
        const fileInfo = await Deno.stat(content);
        if (fileInfo.isFile) {
          return { type: "file", path: content };
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