import { parseArgs } from "jsr:@std/cli/parse-args";
import { promptForConfig, saveConfig, loadConfig, type Config } from "./src/config.ts";
import { getClipboardContent, type ClipboardContent } from "./src/clipboard.ts";
import { uploadObject } from "./src/r2.ts";
import { getMimeType, generateFilenameFromTimestamp, detectContentFormat, convertToJpg } from "./src/utils.ts";
import { basename } from "jsr:@std/path/basename";

const helpText = `
Clip Pub - Quickly publish clipboard content to a public URL.

USAGE:
  clippub <COMMAND> [OPTIONS]

COMMANDS:
  configure    Configure Cloudflare R2 settings.
  publish      Publish content from clipboard.
  help         Show this help message.

OPTIONS:
  -h, --help   Show this help message.
  --name <NAME> Use a custom name for the uploaded object (for text uploads mainly).
`;

async function main() {
  const args = parseArgs(Deno.args, {
    alias: {
      help: "h",
    },
    boolean: ["help"],
    string: ["_", "name"], // Ensure commands and name are treated as strings
  });

  if (args.help || (args._.length === 0 && Object.keys(args).filter(k => k !== "name").length <= 2 )) {
    console.log(helpText);
    Deno.exit(0);
  }

  const command = args._[0];

  switch (command) {
    case "configure":
      await configure();
      break;
    case "publish":
      await publish(args.name as string | undefined);
      break;
    case "help":
      console.log(helpText);
      Deno.exit(0);
      break;
    default:
      console.error(`Error: Unknown command: ${command}`);
      console.log(helpText);
      Deno.exit(1);
  }
}

async function configure() {
  console.log("Starting Clip Pub configuration...");
  try {
    const config = await promptForConfig();
    await saveConfig(config);
    console.log("Configuration successful!");
  } catch (error) {
    console.error("Configuration failed:", (error as Error).message);
    Deno.exit(1);
  }
}

async function publish(customName?: string) {
  console.log("Reading configuration...");
  const config = await loadConfig();
  if (!config) {
    console.error("Configuration not found. Please run 'clippub configure' first.");
    Deno.exit(1);
    return;
  }

  console.log("Reading clipboard...");
  let clipboardData: ClipboardContent;
  try {
    const content = await getClipboardContent();
    if (!content) {
      console.error("No content found in clipboard");
      Deno.exit(1);
      return;
    }
    clipboardData = content;
  } catch (error) {
    console.error("Failed to read clipboard:", (error as Error).message);
    Deno.exit(1);
    return;
  }

  let objectKey: string;
  let dataToUpload: string | Uint8Array;
  let contentType: string;

  switch (clipboardData.type) {
    case "image": {
      console.log("Clipboard contains an image.");
      objectKey = customName || generateFilenameFromTimestamp("jpg");
      try {
        // Convert image to JPG format
        console.log("Converting image to JPG format...");
        dataToUpload = await convertToJpg(clipboardData.content);
        contentType = "image/jpeg";
        console.log(`Uploading image as ${objectKey}...`);
      } catch (error) {
        console.error("Failed to process image:", (error as Error).message);
        Deno.exit(1);
        return;
      }
      break;
    }
    case "file_content": {
      console.log(`Clipboard contains file: ${clipboardData.path}`);
      const originalExt = basename(clipboardData.path).split('.').pop() || '';
      objectKey = customName || generateFilenameFromTimestamp(originalExt);
      dataToUpload = clipboardData.content;
      contentType = getMimeType(clipboardData.path);
      console.log(`Uploading file ${objectKey} (MIME: ${contentType})...`);
      break;
    }
    case "file": {
      console.log(`Clipboard contains file path: ${clipboardData.path}`);
      const originalExt = basename(clipboardData.path).split('.').pop() || '';
      objectKey = customName || generateFilenameFromTimestamp(originalExt);
      try {
        dataToUpload = await Deno.readFile(clipboardData.path);
        contentType = getMimeType(clipboardData.path);
        console.log(`Uploading file ${objectKey} (MIME: ${contentType})...`);
      } catch (error) {
        console.error(`Error reading file ${clipboardData.path}:`, (error as Error).message);
        Deno.exit(1);
        return;
      }
      break;
    }
    case "text": {
      console.log("Clipboard contains text.");
      const format = detectContentFormat(clipboardData.content);
      objectKey = customName || generateFilenameFromTimestamp(format.extension);
      dataToUpload = clipboardData.content;
      contentType = getMimeType(objectKey);
      console.log(`Detected format: ${format.format} (confidence: ${(format.confidence * 100).toFixed(0)}%)`);
      console.log(`Uploading text as ${objectKey} (MIME: ${contentType})...`);
      break;
    }
  }

  try {
    const publicUrl = await uploadObject(config, objectKey, dataToUpload, contentType);
    console.log("\n🎉 Success! Content published! 🎉");
    console.log(`🔗 Public URL: ${publicUrl}`);
    // Attempt to copy URL to clipboard (best effort)
    try {
      await copyToClipboard(publicUrl);
      console.log("(Public URL has been copied to your clipboard)");
    } catch (copyError) {
      console.warn("(Could not copy URL to clipboard automatically)");
    }
  } catch (error) {
    console.error("Upload failed."); // Specific error already logged by uploadObject
    Deno.exit(1);
  }
}

// Helper function to attempt to copy text to clipboard
async function copyToClipboard(text: string): Promise<void> {
  let cmd: string[];
  switch (Deno.build.os) {
    case "darwin":
      cmd = ["pbcopy"];
      break;
    case "linux":
      // Try xclip, then xsel. Assumes one is installed.
      try {
        await new Deno.Command("xclip", { args: ["-selection", "clipboard"], stdin: "piped" }).spawn();
        cmd = ["xclip", "-selection", "clipboard"];
      } catch {
        cmd = ["xsel", "--clipboard", "--input"];
      }
      break;
    case "windows":
      cmd = ["clip"]; // `clip` on Windows reads from stdin
      break;
    default:
      throw new Error(`Unsupported OS for copying to clipboard: ${Deno.build.os}`);
  }

  const process = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdin: "piped",
  });
  const child = process.spawn();
  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(text));
  await writer.close();
  const status = await child.status;
  if (!status.success) {
    throw new Error(`Failed to copy to clipboard. Command exited with ${status.code}`);
  }
}

if (import.meta.main) {
  main();
}
