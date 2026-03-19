const S3UploadService = require("../service/s3UploadService");
const { response } = require("../utils/response");

class UploadController {
  static async createPresignedUpload(req, res) {
    try {
      const folder = req.body?.folder;
      const contentType = req.body?.content_type || req.body?.contentType;
      const fileName = req.body?.file_name || req.body?.fileName;

      if (!folder || !contentType || !fileName) {
        return response.badRequest(
          res,
          "Thiếu dữ liệu upload (folder, content_type, file_name)",
        );
      }

      const data = await S3UploadService.createPresignedUpload({
        folder,
        contentType,
        fileName,
        ownerId: req.user?.id,
      });

      return response.success(res, "Tạo URL upload thành công", data);
    } catch (error) {
      return response.badRequest(res, error.message || "Không thể tạo URL upload");
    }
  }
}

module.exports = UploadController;
