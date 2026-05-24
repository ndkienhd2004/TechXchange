/* eslint-disable no-console */
require("dotenv").config();

const crypto = require("crypto");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { ProductCatalog } = require("../src/models");

const DEFAULT_LIMIT = 100;
const DEFAULT_RETRY = 3;
const DEFAULT_DELAY_MS = 500;
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    limit: DEFAULT_LIMIT,
    retry: DEFAULT_RETRY,
    delayMs: DEFAULT_DELAY_MS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    maxBytes: DEFAULT_MAX_BYTES,
    dryRun: false,
    onlySource: "fptshop",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--limit") out.limit = Number(args[++i]);
    else if (arg === "--retry") out.retry = Number(args[++i]);
    else if (arg === "--delay-ms") out.delayMs = Number(args[++i]);
    else if (arg === "--timeout-ms") out.timeoutMs = Number(args[++i]);
    else if (arg === "--max-bytes") out.maxBytes = Number(args[++i]);
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--only-source") out.onlySource = String(args[++i] || "fptshop");
  }

  if (!Number.isInteger(out.limit) || out.limit <= 0) throw new Error("limit không hợp lệ");
  if (!Number.isInteger(out.retry) || out.retry <= 0) throw new Error("retry không hợp lệ");
  if (!Number.isInteger(out.delayMs) || out.delayMs < 0) throw new Error("delay-ms không hợp lệ");
  if (!Number.isInteger(out.timeoutMs) || out.timeoutMs <= 0) {
    throw new Error("timeout-ms không hợp lệ");
  }
  if (!Number.isInteger(out.maxBytes) || out.maxBytes <= 0) {
    throw new Error("max-bytes không hợp lệ");
  }
  return out;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getS3Config = () => {
  const bucket = String(process.env.AWS_S3_BUCKET || "").trim();
  const region = String(process.env.AWS_REGION || "").trim();
  const accessKeyId = String(process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = String(process.env.AWS_SECRET_ACCESS_KEY || "").trim();
  const publicBaseUrl = String(process.env.AWS_S3_PUBLIC_BASE_URL || "").trim();

  if (!bucket || !region || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw new Error(
      "Thiếu cấu hình S3: AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_PUBLIC_BASE_URL",
    );
  }

  return {
    bucket,
    region,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
    accessKeyId,
    secretAccessKey,
  };
};

const normalizeContentType = (raw) => String(raw || "").split(";")[0].trim().toLowerCase();

const extFromType = (contentType) => {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "bin";
};

const buildKey = (catalogId, ext) => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `catalog/${y}/${m}/${d}/${catalogId}-${crypto.randomUUID()}.${ext}`;
};

const isS3Url = (url, base) => String(url || "").startsWith(base);

const fetchImageBuffer = async (url, opts) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const contentType = normalizeContentType(res.headers.get("content-type"));
    if (!allowedTypes.has(contentType)) throw new Error(`content-type không hỗ trợ: ${contentType}`);
    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > opts.maxBytes) {
      throw new Error(`ảnh vượt max-bytes theo header: ${contentLength}`);
    }

    const arr = await res.arrayBuffer();
    const buf = Buffer.from(arr);
    if (buf.length > opts.maxBytes) throw new Error(`ảnh vượt max-bytes thực tế: ${buf.length}`);
    return { buffer: buf, contentType, bytes: buf.length };
  } finally {
    clearTimeout(timer);
  }
};

const pickSourceImageUrl = (catalog) => {
  const specs = catalog.specs && typeof catalog.specs === "object" ? catalog.specs : {};
  const fromSpecs = String(specs.source_image_url || "").trim();
  if (fromSpecs) return fromSpecs;
  const current = String(catalog.default_image || "").trim();
  if (current.startsWith("http")) return current;
  return "";
};

const updateSpecs = (catalog, patch) => {
  const currentSpecs = catalog.specs && typeof catalog.specs === "object" ? catalog.specs : {};
  return { ...currentSpecs, ...patch };
};

const run = async () => {
  const opts = parseArgs();
  const s3 = getS3Config();
  const s3Client = new S3Client({
    region: s3.region,
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
  });

  const rows = await ProductCatalog.findAll({
    attributes: ["id", "name", "default_image", "specs", "updated_at"],
    where: { status: "active" },
    order: [["updated_at", "DESC"]],
    limit: opts.limit * 5,
  });

  const candidates = rows.filter((row) => {
    const specs = row.specs && typeof row.specs === "object" ? row.specs : {};
    const source = String(specs.import_source || "").toLowerCase();
    if (opts.onlySource && source !== String(opts.onlySource).toLowerCase()) return false;
    const src = pickSourceImageUrl(row);
    if (!src) return false;
    if (isS3Url(row.default_image, s3.publicBaseUrl)) return false;
    return true;
  });

  let processed = 0;
  let uploaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const catalog of candidates.slice(0, opts.limit)) {
    processed += 1;
    const src = pickSourceImageUrl(catalog);
    if (!src) {
      skipped += 1;
      continue;
    }

    let success = false;
    let lastError = "";
    for (let attempt = 1; attempt <= opts.retry; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { buffer, contentType, bytes } = await fetchImageBuffer(src, opts);
        const key = buildKey(catalog.id, extFromType(contentType));
        const fileUrl = `${s3.publicBaseUrl}/${key
          .split("/")
          .map((x) => encodeURIComponent(x))
          .join("/")}`;

        if (!opts.dryRun) {
          // eslint-disable-next-line no-await-in-loop
          await s3Client.send(
            new PutObjectCommand({
              Bucket: s3.bucket,
              Key: key,
              Body: buffer,
              ContentType: contentType,
              CacheControl: "public, max-age=31536000",
            }),
          );

          const newSpecs = updateSpecs(catalog, {
            source_image_url: src,
            image_ingest: {
              status: "success",
              bytes,
              content_type: contentType,
              key,
              at: new Date().toISOString(),
            },
          });
          // eslint-disable-next-line no-await-in-loop
          await ProductCatalog.update(
            { default_image: fileUrl, specs: newSpecs },
            { where: { id: catalog.id } },
          );
        }

        uploaded += 1;
        success = true;
        break;
      } catch (error) {
        lastError = error.message;
        if (attempt < opts.retry) {
          // eslint-disable-next-line no-await-in-loop
          await sleep(opts.delayMs);
        }
      }
    }

    if (!success) {
      failed += 1;
      if (!opts.dryRun) {
        const newSpecs = updateSpecs(catalog, {
          source_image_url: src,
          image_ingest: {
            status: "failed",
            error: lastError,
            at: new Date().toISOString(),
          },
        });
        // eslint-disable-next-line no-await-in-loop
        await ProductCatalog.update({ specs: newSpecs }, { where: { id: catalog.id } });
      }
      console.warn(`[fail] catalog_id=${catalog.id} ${lastError}`);
    } else {
      console.log(`[ok] catalog_id=${catalog.id}`);
    }

    if (opts.delayMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(opts.delayMs);
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun: opts.dryRun,
        scanned: rows.length,
        candidates: candidates.length,
        processed,
        uploaded,
        failed,
        skipped,
      },
      null,
      2,
    ),
  );
};

run()
  .catch((error) => {
    console.error("Ingest failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      const { sequelize } = require("../src/models");
      await sequelize.close();
    } catch (_e) {
      // ignore
    }
  });

