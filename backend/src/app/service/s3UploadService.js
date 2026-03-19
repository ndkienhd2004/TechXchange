const crypto = require("crypto");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

// Service chịu trách nhiệm tạo presigned POST để upload ảnh trực tiếp lên S3
class S3UploadService {
  // Danh sách thư mục được phép upload (dùng để tránh upload lung tung)
  static allowedFolders = new Set([
    "products",
    "shops",
    "avatars",
    "requests",
    "reviews",
    "brands",
  ]);

  // Danh sách content-type ảnh hợp lệ
  static allowedContentTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

  // Đọc và validate cấu hình AWS S3 từ biến môi trường.
  // Nếu thiếu bất cứ biến nào thì ném lỗi để tránh upload khi config không đầy đủ.
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

  // Khởi tạo S3Client dùng chung cho toàn service (singleton),
  // tránh tạo client mới liên tục cho mỗi request.
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

  // Chuẩn hoá tên thư mục upload và kiểm tra có nằm trong danh sách allowedFolders không.
  // Nếu không hợp lệ thì ném lỗi.
  static normalizeFolder(folder) {
    const normalized = String(folder || "")
      .trim()
      .toLowerCase();
    if (!this.allowedFolders.has(normalized)) {
      throw new Error("Thư mục upload không hợp lệ");
    }
    return normalized;
  }

  // Chuẩn hoá content-type và kiểm tra có nằm trong danh sách allowedContentTypes không.
  // Nếu không hợp lệ thì ném lỗi.
  static normalizeContentType(contentType) {
    const normalized = String(contentType || "")
      .trim()
      .toLowerCase();
    if (!this.allowedContentTypes.has(normalized)) {
      throw new Error("Định dạng file không hỗ trợ");
    }
    return normalized;
  }

  // Làm sạch tên file:
  // - Lấy basename
  // - Giữ lại phần tên trước đuôi mở rộng
  // - Chỉ cho phép [a-z0-9-_], các ký tự khác thay bằng "-"
  // - Giới hạn độ dài, tránh tên file quá dài.
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

  // Map content-type sang phần mở rộng tương ứng để build tên file.
  static extensionFromContentType(contentType) {
    if (contentType === "image/jpeg") return "jpg";
    if (contentType === "image/png") return "png";
    if (contentType === "image/webp") return "webp";
    if (contentType === "image/gif") return "gif";
    return "bin";
  }

  // Xây dựng key duy nhất cho file trong S3 theo format:
  // {folder}/{ownerId}/{YYYY}/{MM}/{DD}/{uuid}-{cleanName}.{ext}
  // Giúp phân tách theo user + theo ngày + tránh trùng tên file.
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

  // Encode từng segment của key để có thể dùng trực tiếp trong public URL.
  static encodeKeyForPublicUrl(key) {
    return key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  // Hàm chính tạo presigned POST để client upload trực tiếp lên S3:
  // - Validate folder, content-type, ownerId
  // - Sinh key lưu trữ file
  // - Gọi createPresignedPost với các điều kiện Content-Type, Cache-Control
  // - Trả về:
  //   + upload_url, upload_method, upload_fields: dùng cho form POST từ phía client
  //   + file_url: URL public để truy cập file sau khi upload
  //   + metadata khác (key, bucket, content_type, expires_in)
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
