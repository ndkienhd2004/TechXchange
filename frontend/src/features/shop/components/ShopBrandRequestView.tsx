"use client";

import { useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "./ShopLayout";
import * as styles from "./styles";

const requests = [
  { id: 1, name: "TechX Store", status: "pending", date: "18/12/2025" },
  { id: 2, name: "UGREEN", status: "approved", date: "15/12/2025" },
];

export default function ShopBrandRequestView() {
  const { themed } = useAppTheme();
  const [brandName, setBrandName] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Yêu cầu tạo thương hiệu</h1>
        <p style={themed(styles.pageSubtitle)}>
          Gửi yêu cầu để admin duyệt thương hiệu mới
        </p>
      </header>

      <section style={themed(styles.formCard)}>
        <div style={themed(styles.formGrid)}>
          <div style={themed(styles.formField)}>
            <label style={themed(styles.formLabel)}>Tên thương hiệu</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ví dụ: UGREEN"
              style={themed(styles.formInput)}
            />
          </div>
          <div style={themed(styles.formField)}>
            <label style={themed(styles.formLabel)}>Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              style={themed(styles.formInput)}
            />
          </div>
          <div style={themed(styles.formFieldFull)}>
            <label style={themed(styles.formLabel)}>Mô tả</label>
            <textarea
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              placeholder="Giới thiệu thương hiệu..."
              style={themed(styles.formTextarea)}
            />
          </div>
        </div>
        <div style={themed(styles.formActions)}>
          <button type="button" style={themed(styles.primaryButton)}>
            Gửi yêu cầu
          </button>
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <h2 style={themed(styles.cardTitle)}>Yêu cầu đã gửi</h2>
        </div>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Thương hiệu</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày gửi</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td style={themed(styles.td)}>{req.name}</td>
                <td style={themed(styles.td)}>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(req.status === "approved"
                        ? themed(styles.statusDelivered)
                        : themed(styles.statusPending)),
                    }}
                  >
                    {req.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </td>
                <td style={themed(styles.td)}>{req.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ShopLayout>
  );
}
