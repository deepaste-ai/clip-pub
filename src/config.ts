import { ensureDir } from "jsr:@std/fs/ensure-dir";
import { join } from "jsr:@std/path/join";
import { Secret } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/secret.ts";

export interface Config {
  r2BucketName: string;
  r2AccountId: string;
  cfAccessKeyId: string;
  cfSecretAccessKey: string;
  publicDomainUrl: string;
}

const CONFIG_DIR = join(Deno.env.get("HOME") || "~", ".config", "clippub");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export async function saveConfig(config: Config): Promise<void> {
  try {
    await ensureDir(CONFIG_DIR);
    await Deno.writeTextFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`Configuration saved to ${CONFIG_FILE}`);
  } catch (e) {
    const error = e as Error;
    console.error(`Error saving configuration: ${error.message}`);
    throw error; // Re-throw the error for the caller to handle if necessary
  }
}

export async function loadConfig(): Promise<Config | null> {
  try {
    const content = await Deno.readTextFile(CONFIG_FILE);
    return JSON.parse(content) as Config;
  } catch (e) {
    const error = e as Error;
    if (error instanceof Deno.errors.NotFound) {
      // It's okay if the config file doesn't exist yet
      return null;
    }
    console.error(`Error loading configuration: ${error.message}`);
    throw error; // Re-throw for other types of errors
  }
}

// Function to prompt user for configuration details
export async function promptForConfig(): Promise<Config> {
  const r2BucketName = prompt("Enter Cloudflare R2 Bucket Name:");
  const r2AccountId = prompt("Enter Cloudflare Account ID:");
  const cfAccessKeyId = prompt("Enter Cloudflare Access Key ID:");
  const cfSecretAccessKey = await Secret.prompt("Enter Cloudflare Secret Access Key (input hidden):");
  const publicDomainUrl = prompt(
    "Enter R2 Public Custom Domain URL (e.g., https://cdn.example.com):",
  );

  if (
    !r2BucketName ||
    !r2AccountId ||
    !cfAccessKeyId ||
    !cfSecretAccessKey ||
    !publicDomainUrl
  ) {
    console.error("All configuration fields are required. Exiting.");
    Deno.exit(1);
  }

  return {
    r2BucketName,
    r2AccountId,
    cfAccessKeyId,
    cfSecretAccessKey,
    publicDomainUrl,
  };
} 