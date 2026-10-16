# Bảo tàng số Biển đảo Việt Nam — phiên bản website

## Chạy thử trong Spck Editor
1. Giải nén `Dao-Truong-Sa-Website.zip` vào một thư mục.
2. Mở thư mục dự án trong Spck Editor.
3. Mở `index.html` bằng Preview/trình duyệt.
4. Không đổi vị trí các thư mục `images`, `audio`, `videos`, `islands`, `js` nếu chưa cập nhật đường dẫn.

## Cấu trúc
- `index.html`: trang chủ và danh sách đảo.
- `islands/*.html`: mỗi đảo là một trang web riêng.
- `style.css`: giao diện responsive theo chủ đề biển đảo.
- `js/site.js`: chuyển cảnh, đồng hồ UTC+7, gallery tự chuyển 5 giây, điều phối âm thanh.
- `original-backup/`: bản HTML/CSS/JS gốc được giữ lại để tham khảo.

## Thống kê lượt truy cập thực tế
Đồng hồ ngày giờ chạy ngay trên trình duyệt. Bộ đếm truy cập toàn website cần một dịch vụ bên ngoài hoặc backend; website tĩnh không thể tự tổng hợp chính xác lượt xem của tất cả khách truy cập chỉ bằng `localStorage`.

Để bật thống kê với GoatCounter:
1. Tạo một site miễn phí tại https://www.goatcounter.com/ và chọn một mã site, ví dụ `ten-site`.
2. Trong tất cả các trang HTML, thêm `data-goatcounter="https://ten-site.goatcounter.com"` vào thẻ `<html>` (thay bằng địa chỉ site thật của bạn).
3. Mã JavaScript sẽ nạp script ghi nhận lượt xem và thử đọc bộ đếm công khai theo đường dẫn trang hiện tại. Để số đếm hiển thị được, hãy bật public counter/API trong cài đặt GoatCounter nếu gói tài khoản/cấu hình của bạn yêu cầu. Nếu endpoint công khai không khả dụng, trang vẫn gửi thống kê và hiển thị trạng thái thay vì bịa ra số lượt xem. Số hiển thị là lượt xem của trang hiện tại, không phải tổng hợp số khách truy cập duy nhất toàn website.

## Tư liệu còn thiếu
Gói ban đầu chỉ có ba ảnh và một video cho Trường Sa Lớn. Vì vậy các trang Sinh Tồn, Song Tử Tây và An Bang dùng `images/island-illustration.svg`, được ghi rõ là hình minh họa, không giả làm ảnh thực địa. Video riêng của các đảo này chưa có. Hãy bổ sung ảnh/video có quyền sử dụng và xác minh nguồn trước khi thay thế.

## Lưu ý nội dung
Một số số liệu trong mã gốc chưa có nguồn dẫn kèm theo. Phiên bản này giữ thông tin tham khảo ở mức thận trọng và đánh dấu các số liệu cần kiểm chứng thay vì khẳng định chúng là dữ liệu chính thức.

## Triển khai lên hosting
Tải toàn bộ nội dung thư mục dự án lên thư mục gốc hosting. Đảm bảo `index.html` nằm ở thư mục gốc và hosting phục vụ được các tệp `.html`, `.css`, `.js`, `.svg`, `.jpg`, `.mp4`, `.mp3`.

## Giao diện tinh gọn (bản cập nhật)
- Thanh đầu trang chỉ hiển thị tên bốn đảo để điều hướng.
- Trang chủ chỉ giữ mục “Chọn điểm đến”, ảnh đảo và tên đảo; đã bỏ phần giới thiệu dài và khối “Về không gian này”.
- La bàn minh họa và đồng hồ mặt trời được đưa trở lại phía trên danh sách đảo. Đồng hồ hiển thị thời gian Việt Nam; la bàn là yếu tố minh họa, không phải thiết bị định hướng thực tế.
- Các đảo chưa có ảnh thực địa riêng dùng tranh SVG minh họa riêng theo từng đảo, được ghi rõ là minh họa.


### Cập nhật giao diện theo yêu cầu
- Trang chủ có tiêu đề lớn “Môi trường biển đảo Việt Nam”, tiếp theo là “Biển đảo Việt Nam” và hai dòng “Là máu thịt người Việt Nam / Là linh hồn của người Việt Nam”.
- Đồng hồ thiên thể chuyển biểu tượng trăng/sao và mặt trời theo giờ Việt Nam; bình minh và hoàng hôn có trạng thái chuyển tiếp, giữa trưa mặt trời có tia nắng, giữa khuya trăng đi cùng các sao nhỏ. Mốc giờ là hiệu ứng minh họa gần đúng, không phải dữ liệu thiên văn chính xác.
- La bàn giữ nguyên thiết kế minh họa hiện có.


### Video mở đầu 12 giây
- Trang chủ phát `videos/intro.mp4` trước khi hiển thị giao diện chính; âm thanh gốc của video được giữ nguyên.
- Video tự kết thúc/chuyển trang sau khoảng 12 giây hoặc người xem nhấn vào màn hình/nút “Bỏ qua”.
- Một số trình duyệt di động chặn tự phát có âm thanh; khi đó màn hình hiện nút “Phát video có âm thanh” để người xem chạm phát.


### Sửa màn hình video mở đầu
- Thử tự phát video với âm thanh gốc ngay khi tải trang; nếu trình duyệt chặn, tự chuyển sang phát không tiếng, không hiện lời nhắc bật âm thanh.
- Chỉ hiện nút phát khi trình duyệt chặn cả tự phát có tiếng lẫn không tiếng.
- Khóa cuộn trang và ép lớp phủ video phủ toàn bộ viewport của WebView; video giữ nguyên tỷ lệ gốc với `object-fit: contain`.
- Ưu tiên đóng khi video phát hết, có bộ hẹn giờ dự phòng cho WebView không phát sự kiện kết thúc.
