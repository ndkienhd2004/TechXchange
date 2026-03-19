import { getAxiosInstance } from "@/services/axiosConfig";

type UploadFolder =
  | "products"
  | "shops"
  | "avatars"
  | "requests"
  | "reviews"
  | "brands";

interface PresignUploadResponse {
  upload_url: string;
  upload_method?: "PUT" | "POST";
  upload_fields?: Record<string, string>;
  file_url: string;
  key: string;
  expires_in: number;
  content_type: string;
  bucket: string;
}

interface PresignUploadApiResponse {
  code: string;
  success: boolean;
  message: string;
  data: PresignUploadResponse;
}

export async function requestPresignedUpload(params: {
  folder: UploadFolder;
  fileName: string;
  contentType: string;
}) {
  const api = getAxiosInstance();
  const response = await api.post<PresignUploadApiResponse>("/uploads/presign", {
    folder: params.folder,
    file_name: params.fileName,
    content_type: params.contentType,
  });
  return response.data.data;
}

export async function uploadFileWithPresignedUrl(params: {
  uploadUrl: string;
  uploadMethod?: "PUT" | "POST";
  uploadFields?: Record<string, string>;
  file: File;
}) {
  if (params.uploadMethod === "POST") {
    const formData = new FormData();
    Object.entries(params.uploadFields || {}).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", params.file);

    const postRes = await fetch(params.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!postRes.ok) {
      const text = await postRes.text();
      throw new Error(`Upload ảnh lên S3 thất bại: ${text || postRes.status}`);
    }
    return;
  }

  const putRes = await fetch(params.uploadUrl, {
    method: "PUT",
    body: params.file,
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`Upload ảnh lên S3 thất bại: ${text || putRes.status}`);
  }
}

export async function uploadImageToS3(params: {
  file: File;
  folder: UploadFolder;
}) {
  const presigned = await requestPresignedUpload({
    folder: params.folder,
    fileName: params.file.name,
    contentType: params.file.type,
  });

  await uploadFileWithPresignedUrl({
    uploadUrl: presigned.upload_url,
    uploadMethod: presigned.upload_method,
    uploadFields: presigned.upload_fields,
    file: params.file,
  });

  return {
    url: presigned.file_url,
    key: presigned.key,
  };
}
