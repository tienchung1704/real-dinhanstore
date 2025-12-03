import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  note?: string;
  createdAt: Date;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const html = generateOrderEmailHTML(data);

    await transporter.sendMail({
      from: `"Dinhan Store" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `🏸 Xác nhận đơn hàng #${data.orderNumber} - Dinhan Store`,
      html,
    });

    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}

function generateOrderEmailHTML(data: OrderEmailData): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cod: "Thanh toán khi nhận hàng (COD)",
      stripe: "Thẻ tín dụng/Ghi nợ (Stripe)",
      vietqr: "Chuyển khoản ngân hàng (VietQR)",
      bank: "Chuyển khoản ngân hàng",
    };
    return methods[method] || method;
  };

  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <span style="font-weight: 500; color: #1f2937;">${item.name}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">
          ${formatPrice(item.price)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #059669;">
          ${formatPrice(item.total)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng - Dinhan Store</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
        <span style="font-size: 32px;">🏸</span>
      </div>
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Dinhan Store</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Badminton Pro Shop</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Success Message -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: #d1fae5; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
          <span style="font-size: 32px;">✅</span>
        </div>
        <h2 style="color: #059669; margin: 0 0 8px 0; font-size: 20px;">Đặt hàng thành công!</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">Cảm ơn bạn đã mua hàng tại Dinhan Store</p>
      </div>

      <!-- Order Info -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="color: #6b7280; font-size: 14px;">Mã đơn hàng:</span>
          <span style="color: #059669; font-weight: 700; font-size: 16px;">#${data.orderNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #6b7280; font-size: 14px;">Ngày đặt:</span>
          <span style="color: #1f2937; font-weight: 500; font-size: 14px;">${formatDate(data.createdAt)}</span>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #059669;">
          📦 Thông tin giao hàng
        </h3>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Người nhận:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Điện thoại:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: 500;">${data.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Email:</td>
            <td style="padding: 8px 0; color: #1f2937;">${data.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Địa chỉ:</td>
            <td style="padding: 8px 0; color: #1f2937;">${data.shippingAddress}</td>
          </tr>
        </table>
      </div>

      <!-- Order Items -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #059669;">
          🛒 Chi tiết đơn hàng
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Sản phẩm</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">SL</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600;">Đơn giá</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <!-- Payment Summary -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tạm tính:</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formatPrice(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Phí vận chuyển:</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937;">${data.shippingFee > 0 ? formatPrice(data.shippingFee) : "Miễn phí"}</td>
          </tr>
          ${
            data.discount > 0
              ? `
          <tr>
            <td style="padding: 8px 0; color: #059669;">Giảm giá:</td>
            <td style="padding: 8px 0; text-align: right; color: #059669;">-${formatPrice(data.discount)}</td>
          </tr>
          `
              : ""
          }
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 16px 0 8px 0; color: #1f2937; font-weight: 700; font-size: 16px;">Tổng cộng:</td>
            <td style="padding: 16px 0 8px 0; text-align: right; color: #059669; font-weight: 700; font-size: 20px;">${formatPrice(data.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Payment Method -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">💳</span>
          <div>
            <p style="margin: 0 0 4px 0; color: #92400e; font-weight: 600; font-size: 14px;">Phương thức thanh toán</p>
            <p style="margin: 0; color: #78350f; font-size: 14px;">${getPaymentMethodText(data.paymentMethod)}</p>
          </div>
        </div>
      </div>

      ${
        data.note
          ? `
      <!-- Note -->
      <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600; font-size: 14px;">📝 Ghi chú:</p>
        <p style="margin: 0; color: #1e3a8a; font-size: 14px;">${data.note}</p>
      </div>
      `
          : ""
      }

      <!-- Support Info -->
      <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
        </p>
        <div style="display: inline-block; margin: 0 12px;">
          <span style="color: #059669; font-weight: 600;">📞 Hotline:</span>
          <span style="color: #1f2937;"> 0901 234 567</span>
        </div>
        <div style="display: inline-block; margin: 0 12px;">
          <span style="color: #059669; font-weight: 600;">✉️ Email:</span>
          <span style="color: #1f2937;"> info@dinhanstore.com</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
        © 2024 Dinhan Store. Tất cả quyền được bảo lưu.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        123 Đường ABC, Quận 1, TP. Hồ Chí Minh
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Order status update email
export interface OrderStatusEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  total: number;
  updatedAt: Date;
}

export async function sendOrderStatusUpdateEmail(data: OrderStatusEmailData): Promise<boolean> {
  try {
    const html = generateStatusUpdateEmailHTML(data);

    await transporter.sendMail({
      from: `"Dinhan Store" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `🏸 Cập nhật đơn hàng #${data.orderNumber} - ${getStatusText(data.newStatus)}`,
      html,
    });

    console.log(`Order status update email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return false;
  }
}

function getStatusText(status: string): string {
  const statuses: Record<string, string> = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };
  return statuses[status] || status;
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: "⏳",
    processing: "📦",
    shipped: "🚚",
    delivered: "✅",
    cancelled: "❌",
  };
  return icons[status] || "📋";
}

function getStatusColor(status: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
    processing: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
    shipped: { bg: "#e0e7ff", text: "#3730a3", border: "#6366f1" },
    delivered: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
    cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  };
  return colors[status] || { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };
}

function generateStatusUpdateEmailHTML(data: OrderStatusEmailData): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const newStatusColor = getStatusColor(data.newStatus);
  const statusMessage = getStatusMessage(data.newStatus);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cập nhật đơn hàng - Dinhan Store</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
        <span style="font-size: 32px;">🏸</span>
      </div>
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Dinhan Store</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Badminton Pro Shop</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Status Update Message -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: ${newStatusColor.bg}; padding: 16px; border-radius: 50%; margin-bottom: 16px;">
          <span style="font-size: 32px;">${getStatusIcon(data.newStatus)}</span>
        </div>
        <h2 style="color: ${newStatusColor.text}; margin: 0 0 8px 0; font-size: 20px;">Cập nhật trạng thái đơn hàng</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">Xin chào ${data.customerName}!</p>
      </div>

      <!-- Order Info -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Mã đơn hàng:</td>
            <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: 700;">#${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tổng tiền:</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600;">${formatPrice(data.total)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Cập nhật lúc:</td>
            <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formatDate(data.updatedAt)}</td>
          </tr>
        </table>
      </div>

      <!-- Status Change -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #059669;">
          📋 Trạng thái đơn hàng
        </h3>
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 20px;">
          <div style="text-align: center;">
            <div style="background: ${getStatusColor(data.oldStatus).bg}; color: ${getStatusColor(data.oldStatus).text}; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              ${getStatusText(data.oldStatus)}
            </div>
          </div>
          <div style="font-size: 24px;">➡️</div>
          <div style="text-align: center;">
            <div style="background: ${newStatusColor.bg}; color: ${newStatusColor.text}; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid ${newStatusColor.border};">
              ${getStatusText(data.newStatus)}
            </div>
          </div>
        </div>
      </div>

      <!-- Status Message -->
      <div style="background: ${newStatusColor.bg}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${newStatusColor.border};">
        <p style="margin: 0; color: ${newStatusColor.text}; font-size: 14px; line-height: 1.6;">
          ${statusMessage}
        </p>
      </div>

      <!-- Support Info -->
      <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
        </p>
        <div style="display: inline-block; margin: 0 12px;">
          <span style="color: #059669; font-weight: 600;">📞 Hotline:</span>
          <span style="color: #1f2937;"> 0901 234 567</span>
        </div>
        <div style="display: inline-block; margin: 0 12px;">
          <span style="color: #059669; font-weight: 600;">✉️ Email:</span>
          <span style="color: #1f2937;"> info@dinhanstore.com</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
        © 2024 Dinhan Store. Tất cả quyền được bảo lưu.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        123 Đường ABC, Quận 1, TP. Hồ Chí Minh
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "Đơn hàng của bạn đang chờ xử lý. Chúng tôi sẽ sớm xác nhận và chuẩn bị hàng cho bạn.",
    processing: "Đơn hàng của bạn đang được xử lý và chuẩn bị. Chúng tôi sẽ giao hàng trong thời gian sớm nhất.",
    shipped: "🎉 Tin vui! Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Vui lòng chú ý điện thoại để nhận hàng.",
    delivered: "✨ Đơn hàng đã được giao thành công! Cảm ơn bạn đã mua hàng tại Dinhan Store. Chúc bạn có trải nghiệm tuyệt vời với sản phẩm!",
    cancelled: "Đơn hàng của bạn đã bị hủy. Nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc. Xin lỗi vì sự bất tiện này.",
  };
  return messages[status] || "Trạng thái đơn hàng của bạn đã được cập nhật.";
}

export default transporter;
