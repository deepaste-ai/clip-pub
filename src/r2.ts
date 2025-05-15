import { S3Client } from "jsr:@bradenmacdonald/s3-lite-client@0.9.0";
import type { Config } from "./config.ts";

function getS3Client(config: Config): S3Client {
  // Cloudflare R2 specific endpoint construction.
  // The endpoint should be: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
  const endpoint = `https://${config.r2AccountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    endPoint: endpoint,
    region: "auto",
    accessKey: config.cfAccessKeyId,
    secretKey: config.cfSecretAccessKey,
    bucket: config.r2BucketName,
  });
}

export async function uploadObject(
  config: Config,
  key: string,
  data: string | Uint8Array | ReadableStream,
  contentType: string,
): Promise<string> {
  const client = getS3Client(config);

  try {
    await client.putObject(key, data, {
      metadata: {
        "Content-Type": contentType,
      },
      // For public access, if your bucket isn't public by default, you might need this.
      // However, the plan is to have the bucket public via a custom domain.
      // acl: "public-read", // This might not be needed if bucket is already public
    });

    // Construct the public URL
    // Ensure the publicDomainUrl ends with a slash if it doesn't already
    const baseUrl = config.publicDomainUrl.endsWith('/') 
        ? config.publicDomainUrl 
        : `${config.publicDomainUrl}/`;
    const publicUrl = `${baseUrl}${key}`;
    
    console.log(`Successfully uploaded ${key} to ${config.r2BucketName}.`);
    console.log(`Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${key} to R2:`, (error as Error).message);
    throw error;
  }
}

// Placeholder for listObjects - to be implemented in Phase 2
export async function listObjects(config: Config): Promise<void> {
  const client = getS3Client(config);
  console.log("Listing objects for bucket:", config.r2BucketName);
  try {
    for await (const obj of client.listObjects()) {
      console.log(`- ${obj.key} (Size: ${obj.size}, LastModified: ${obj.lastModified})`);
    }
  } catch (error) {
     console.error(`Error listing objects:`, (error as Error).message);
     throw error;
  }
}

// Placeholder for deleteObject - to be implemented in Phase 2
export async function deleteObject(config: Config, key: string): Promise<void> {
  const client = getS3Client(config);
  console.log(`Attempting to delete ${key} from bucket:`, config.r2BucketName);
  try {
    await client.deleteObject(key);
    console.log(`Successfully deleted ${key}.`);
  } catch (error) {
    console.error(`Error deleting object ${key}:`, (error as Error).message);
    throw error;
  }
} 