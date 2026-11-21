import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Điều khoản & quyền riêng tư | Khí Việt' }

export default function PolicyPage() {
  return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-12">
    <Link className="text-accent underline underline-offset-4" href="/ban-do-thoi-tiet">Về bản đồ thời tiết</Link>
    <h1 className="text-3xl">Điều khoản &amp; quyền riêng tư</h1>
    <p>Dữ liệu dự báo và chất lượng không khí chỉ mang tính tham khảo, không thay thế cảnh báo chính thức hoặc tư vấn y tế.</p>
    <p>Nếu bạn cho phép định vị hoặc chọn một điểm trên bản đồ, tọa độ được dùng để truy vấn dự báo, chất lượng không khí và địa chỉ từ Google. Số liệu môi trường được truy vấn với tọa độ làm tròn. Liên kết bạn chia sẻ có thể chứa tọa độ điểm đang xem.</p>
    <p>Lịch sử tìm kiếm gần đây và tùy chọn giao diện được lưu trong trình duyệt. Bạn có thể xóa dữ liệu này hoặc thu hồi quyền định vị trong cài đặt trình duyệt. Bản đồ không tự lưu vị trí định vị vào lịch sử địa điểm.</p>
    <p>Khi dùng dịch vụ bản đồ, bạn cũng chịu sự điều chỉnh của <a className="text-accent underline" href="https://www.google.com/intl/vi/help/terms_maps/">Điều khoản dịch vụ bổ sung của Google Maps</a> và <a className="text-accent underline" href="https://policies.google.com/privacy?hl=vi">Chính sách quyền riêng tư của Google</a>.</p>
  </main>
}
