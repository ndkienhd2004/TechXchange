"use client";

import { useAppTheme } from "@/theme/ThemeProvider";

export default function PolicyPage() {
  const { themed } = useAppTheme();

  return (
    <div
      style={themed((theme) => ({
        maxWidth: "980px",
        margin: "0 auto",
        paddingTop: theme.spacing["2xl"],
        paddingRight: theme.spacing.lg,
        paddingBottom: theme.spacing["3xl"],
        paddingLeft: theme.spacing.lg,
      }))}
    >
      <header
        style={themed((theme) => ({
          marginBottom: theme.spacing.xl,
        }))}
      >
        <h1
          style={themed((theme) => ({
            margin: 0,
            fontSize: theme.typography.fontSize["2xl"].size,
            fontWeight: theme.typography.fontWeight.bold,
          }))}
        >
          Chính sách & Câu hỏi thường gặp (FAQ)
        </h1>
        <p
          style={themed((theme) => ({
            marginTop: theme.spacing[2],
            color: theme.colors.palette.text.secondary,
            lineHeight: 1.6,
          }))}
        >
          Đây là các chính sách áp dụng cho nền tảng TechXchange. Nội dung có
          thể được cập nhật theo từng thời điểm.
        </p>
      </header>

      <section>
        <h2
          style={themed((theme) => ({
            margin: 0,
            fontSize: theme.typography.fontSize.xl.size,
            fontWeight: theme.typography.fontWeight.bold,
          }))}
        >
          Chính sách
        </h2>

        <div
          style={themed((theme) => ({
            marginTop: theme.spacing.lg,
            display: "grid",
            gap: theme.spacing.lg,
          }))}
        >
          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              1. Chính sách bảo hành
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                TechXchange hỗ trợ xử lý bảo hành dựa trên cam kết của người
                bán, bảo hành hãng (nếu có) và tình trạng sản phẩm thể hiện tại
                bước thanh toán.
              </li>
              <li>
                Sản phẩm mới (brand new) áp dụng bảo hành chính hãng/nhà phân
                phối uỷ quyền khi phù hợp.
              </li>
              <li>
                Sản phẩm đã qua sử dụng áp dụng thời hạn bảo hành theo cam kết
                của shop/người bán trên trang sản phẩm.
              </li>
              <li>
                Khách hàng cần giữ mã đơn hàng, hoá đơn, serial và phụ kiện đi
                kèm để đối soát bảo hành.
              </li>
              <li>
                Không áp dụng bảo hành với các trường hợp hư hỏng do nước/va
                đập/cháy nổ/sử dụng sai, tự ý sửa chữa hoặc thiếu thông tin
                serial.
              </li>
              <li>
                Thời gian tiếp nhận bảo hành tiêu chuẩn 1–3 ngày làm việc; thời
                gian xử lý phụ thuộc shop/hãng/linh kiện hoặc tồn kho thay thế.
              </li>
            </ul>
          </article>

          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              2. Chính sách đổi trả & hoàn tiền
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                Khách hàng có thể yêu cầu đổi trả/hoàn tiền nếu hàng bị hư hỏng
                khi vận chuyển, không đúng mô tả, thiếu phụ kiện quan trọng hoặc
                lỗi kỹ thuật từ nhà sản xuất trong thời hạn cho phép.
              </li>
              <li>
                Gửi yêu cầu trong 3 ngày sau khi nhận hàng đối với hư hỏng/thiếu
                đồ thấy ngay; và trong 7 ngày đối với lỗi kỹ thuật ẩn (trừ khi
                trang sản phẩm quy định khác).
              </li>
              <li>
                Hàng hoàn trả cần có máy/chính phẩm, phụ kiện, bao bì (nếu còn),
                và bằng chứng mua hàng.
              </li>
              <li>
                Hoàn tiền được xử lý sau khi kiểm tra xác nhận lỗi hợp lệ và
                không do người dùng gây ra.
              </li>
              <li>
                Nếu có thể xử lý bằng đổi sản phẩm/sửa chữa/bù phụ kiện, nền
                tảng có thể đề xuất phương án đó trước khi hoàn tiền.
              </li>
              <li>
                Thời gian hoàn tiền mục tiêu 3–7 ngày làm việc sau khi được
                duyệt (tuỳ kênh thanh toán).
              </li>
            </ul>
          </article>

          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              3. Chính sách thanh toán
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                TechXchange hỗ trợ các phương thức thanh toán theo cấu hình của
                từng shop: chuyển khoản, cổng thanh toán online và COD (nếu có).
              </li>
              <li>
                Đơn hàng chỉ được xác nhận khi hệ thống ghi nhận thanh toán
                thành công hoặc người bán chấp nhận yêu cầu COD hợp lệ.
              </li>
              <li>
                Với đơn trả trước, vui lòng chuyển đúng số tiền và đúng nội dung
                mã đơn để tránh chậm xác nhận.
              </li>
              <li>
                Thanh toán thất bại/nhân đôi có thể cần đối soát thủ công trước
                khi hoàn tiền.
              </li>
              <li>
                Khuyến mãi/voucher/trợ giá vận chuyển chỉ áp dụng khi thỏa đủ
                điều kiện tại thời điểm checkout.
              </li>
            </ul>
          </article>

          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              4. Chính sách giao hàng
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                Thời gian giao phụ thuộc vị trí shop, năng lực vận chuyển, tỉnh
                nhận hàng và trạng thái sẵn sàng của sản phẩm.
              </li>
              <li>
                Hàng sẵn thường được bàn giao cho đơn vị vận chuyển trong 1–2
                ngày làm việc sau khi xác nhận.
              </li>
              <li>
                Đơn nhiều sản phẩm có thể tách kiện nếu đến từ nhiều shop/kho
                khác nhau.
              </li>
              <li>
                Khách hàng nên kiểm tra tình trạng kiện hàng khi nhận và báo
                ngay nếu có dấu hiệu hư hỏng.
              </li>
              <li>
                Phí ship/ước tính thời gian/khu vực hỗ trợ hiển thị tại checkout
                theo địa chỉ đã chọn.
              </li>
            </ul>
          </article>

          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              5. Chính sách huỷ đơn
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                Khách hàng có thể huỷ đơn trước khi người bán xác nhận đóng gói
                hoặc bàn giao cho đơn vị vận chuyển.
              </li>
              <li>
                Đơn đã đóng gói/đang vận chuyển/đặt theo yêu cầu có thể không
                huỷ trực tiếp được và cần theo quy trình đổi trả.
              </li>
              <li>
                TechXchange có thể huỷ đơn khi thanh toán không hợp lệ, nghi ngờ
                gian lận, hết hàng hoặc lỗi giá do hệ thống.
              </li>
              <li>
                Nếu đơn trả trước bị huỷ bởi hệ thống/người bán, hoàn tiền theo
                timeline hoàn tiền thông thường.
              </li>
            </ul>
          </article>

          <article
            style={themed((theme) => ({
              background: theme.colors.palette.backgrounds.card,
              border: `1px solid ${theme.colors.palette.borders.default}`,
              borderRadius: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingRight: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.lg,
            }))}
          >
            <h3 style={themed((theme) => ({ marginTop: 0 }))}>
              6. Tình trạng sản phẩm & tính xác thực
            </h3>
            <ul style={themed((theme) => ({ margin: 0, paddingLeft: 18 }))}>
              <li>
                Mỗi sản phẩm cần nêu rõ tình trạng: mới/như mới/đã
                dùng/refurbish/ open-box (khi phù hợp).
              </li>
              <li>
                Tình trạng %, thời hạn bảo hành, phụ kiện kèm theo và lỗi/khuyết
                điểm (nếu có) phải được mô tả trên trang sản phẩm.
              </li>
              <li>
                Người bán chịu trách nhiệm về độ chính xác, tính xác thực và khả
                năng cung ứng tại thời điểm nhận đơn.
              </li>
              <li>
                TechXchange có quyền gỡ listing có dấu hiệu gây hiểu nhầm, hàng
                giả, trùng lặp hoặc không an toàn.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section style={themed((theme) => ({ marginTop: theme.spacing["2xl"] }))}>
        <h2
          style={themed((theme) => ({
            margin: 0,
            fontSize: theme.typography.fontSize.xl.size,
            fontWeight: theme.typography.fontWeight.bold,
          }))}
        >
          FAQ
        </h2>

        <div
          style={themed((theme) => ({
            marginTop: theme.spacing.lg,
            background: theme.colors.palette.backgrounds.card,
            border: `1px solid ${theme.colors.palette.borders.default}`,
            borderRadius: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingRight: theme.spacing.lg,
            paddingBottom: theme.spacing.lg,
            paddingLeft: theme.spacing.lg,
            display: "grid",
            gap: theme.spacing.md,
          }))}
        >
          <details>
            <summary>1. Làm sao để kiểm tra điều kiện bảo hành?</summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Vào chi tiết đơn hàng và trang sản phẩm để xem cam kết bảo hành,
              thời hạn và yêu cầu serial/hoá đơn. Nếu cần, liên hệ hỗ trợ và
              cung cấp mã đơn hàng + serial để được kiểm tra.
            </p>
          </details>
          <details>
            <summary>2. Khi nào tôi có thể yêu cầu đổi trả?</summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Khi sản phẩm bị hư hỏng lúc nhận, không đúng mô tả, thiếu phụ kiện
              quan trọng hoặc có lỗi kỹ thuật được xác nhận trong thời gian cho
              phép.
            </p>
          </details>
          <details>
            <summary>3. Hoàn tiền mất bao lâu?</summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Thông thường 3–7 ngày làm việc sau khi kiểm tra và duyệt hoàn
              tiền. Thời gian thực tế có thể phụ thuộc kênh thanh toán/ngân
              hàng.
            </p>
          </details>
          <details>
            <summary>
              4. TechXchange hỗ trợ những phương thức thanh toán nào?
            </summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Tùy shop: chuyển khoản, thanh toán online và COD (nếu có).
            </p>
          </details>
          <details>
            <summary>5. Vì sao đơn hàng của tôi chưa được xác nhận?</summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Có thể do đối soát ngân hàng, nội dung chuyển khoản sai, shop cần
              thời gian kiểm tra, hoặc cần xác minh tồn kho.
            </p>
          </details>
          <details>
            <summary>
              6. Tôi có được kiểm tra hàng trước khi thanh toán không?
            </summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Tuỳ phương thức vận chuyển và chính sách shop. Vui lòng xem ghi
              chú trên trang sản phẩm/checkout.
            </p>
          </details>
          <details>
            <summary>7. Nếu kiện hàng bị móp/hư khi nhận thì sao?</summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Chụp ảnh tình trạng kiện hàng, giữ lại bao bì và báo ngay cho hỗ
              trợ kèm mã đơn hàng.
            </p>
          </details>
          <details>
            <summary>
              8. Hàng đã qua sử dụng có được test trước khi bán không?
            </summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Shop/người bán cần kiểm tra và mô tả tình trạng trước khi đăng
              bán. Mức độ test có thể khác nhau theo shop và loại sản phẩm.
            </p>
          </details>
          <details>
            <summary>
              9. Tôi có thể huỷ đơn sau khi đã thanh toán không?
            </summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Nếu đơn chưa đóng gói/bàn giao vận chuyển thì thường có thể huỷ.
              Nếu đã vận chuyển, vui lòng theo quy trình đổi trả.
            </p>
          </details>
          <details>
            <summary>
              10. Tôi báo cáo sản phẩm “không đúng mô tả” bằng cách nào?
            </summary>
            <p style={{ marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>
              Liên hệ hỗ trợ và cung cấp mã đơn hàng, ảnh/video (nếu có) cùng mô
              tả ngắn về điểm không khớp.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
