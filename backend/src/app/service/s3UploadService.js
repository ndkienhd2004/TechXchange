const crypto = require("crypto");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

class S3UploadService {
  static allowedFolders = new Set([
    "products",
    "shops",
    "avatars",
    "requests",
    "reviews",
    "brands",
  ]);

  static allowedContentTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  static getConfig() {
    const bucket = String(process.env.AWS_S3_BUCKET || "").trim();
    const region = String(process.env.AWS_REGION || "").trim();
    const accessKeyId = String(process.env.AWS_ACCESS_KEY_ID || "").trim();
    const secretAccessKey = String(process.env.AWS_SECRET_ACCESS_KEY || "").trim();
    const publicBaseUrl = String(process.env.AWS_S3_PUBLIC_BASE_URL || "").trim();

    if (!bucket || !region || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
      throw new Error(
        "Thiếu cấu hình AWS S3. Cần: AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_PUBLIC_BASE_URL",
      );
    }

    return {
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
    };
  }

  static getClient() {
    if (!this.client) {
      const config = this.getConfig();
      this.client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        // Avoid optional checksum query params in presigned URL for browser PUT flows.
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      });
    }
    return this.client;
  }

  static normalizeFolder(folder) {
    const normalized = String(folder || "")
      .trim()
      .toLowerCase();
    if (!this.allowedFolders.has(normalized)) {
      throw new Error("Thư mục upload không hợp lệ");
    }
    return normalized;
  }

  static normalizeContentType(contentType) {
    const normalized = String(contentType || "")
      .trim()
      .toLowerCase();
    if (!this.allowedContentTypes.has(normalized)) {
      throw new Error("Định dạng file không hỗ trợ");
    }
    return normalized;
  }

  static sanitizeFileName(fileName) {
    const raw = path.basename(String(fileName || "").trim() || "image");
    const ext = path.extname(raw).toLowerCase();
    const base = raw.slice(0, ext ? -ext.length : raw.length).toLowerCase();

    const normalizedBase = base
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    return normalizedBase || "image";
  }

  static extensionFromContentType(contentType) {
    if (contentType === "image/jpeg") return "jpg";
    if (contentType === "image/png") return "png";
    if (contentType === "image/webp") return "webp";
    if (contentType === "image/gif") return "gif";
    return "bin";
  }

  static buildKey({ folder, ownerId, fileName, contentType }) {
    const cleanName = this.sanitizeFileName(fileName);
    const ext = this.extensionFromContentType(contentType);
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const uid = crypto.randomUUID();

    return `${folder}/${ownerId}/${y}/${m}/${d}/${uid}-${cleanName}.${ext}`;
  }

  static encodeKeyForPublicUrl(key) {
    return key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  static async createPresignedUpload({
    folder,
    ownerId,
    fileName,
    contentType,
    expiresInSeconds = 300,
  }) {
    const safeFolder = this.normalizeFolder(folder);
    const safeContentType = this.normalizeContentType(contentType);
    const safeOwnerId = Number(ownerId);

    if (!safeOwnerId) {
      throw new Error("Không xác định được người dùng upload");
    }

    const config = this.getConfig();
    const key = this.buildKey({
      folder: safeFolder,
      ownerId: safeOwnerId,
      fileName,
      contentType: safeContentType,
    });

    const post = await createPresignedPost(this.getClient(), {
      Bucket: config.bucket,
      Key: key,
      Expires: expiresInSeconds,
      Fields: {
        "Content-Type": safeContentType,
        "Cache-Control": "public, max-age=31536000",
      },
      Conditions: [
        ["eq", "$Content-Type", safeContentType],
        ["eq", "$Cache-Control", "public, max-age=31536000"],
      ],
    });

    return {
      upload_url: post.url,
      upload_method: "POST",
      upload_fields: post.fields,
      file_url: `${config.publicBaseUrl}/${this.encodeKeyForPublicUrl(key)}`,
      key,
      expires_in: expiresInSeconds,
      content_type: safeContentType,
      bucket: config.bucket,
    };
  }
}

module.exports = S3UploadService;
