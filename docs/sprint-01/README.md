# Hướng dẫn sử dụng tài liệu

Thư mục này chứa toàn bộ tài liệu kỹ thuật của dự án. Mọi thành viên cần đọc đúng thứ tự và đúng phạm vi tài liệu của mình.

---

## Thứ tự đọc cho thành viên mới

### Ngày đầu tiên (bắt buộc đọc trước khi viết dòng code đầu tiên)

| Thứ tự | File | Nội dung |
|---|---|---|
| 1 | [`00-code-standards.md`](./convention/00-code-standards.md) | Quy chuẩn code: đặt tên, cấu trúc thư mục, patterns, API design |
| 2 | [`01-git-flow.md`](./convention/01-git-flow.md) | Quy trình Git: nhánh, commit, PR, tình huống thường gặp |

### Khi bắt đầu làm task (đọc file tương ứng với sprint hiện tại)

| File | Sprint | Phạm vi |
|---|---|---|
| [`01-epic1-security-foundation.md`](./01-epic1-security-foundation.md) | Sprint 0 | BE + FE |
| [`02-epic2-database-architecture.md`](./02-epic2-database-architecture.md) | Sprint 1 | BE + FE |
| [`03-epic3-core-business.md`](./03-epic3-core-business.md) | Sprint 2 | BE + FE |
| [`04-epic4-dashboard-polish.md`](./04-epic4-dashboard-polish.md) | Sprint 3 | FE |

> [!NOTE]
> Chỉ cần đọc Story được Tech Lead assign, không cần đọc toàn bộ file epic.

---

## Quy trình nhận và thực hiện task

**Bước 1.** Tech Lead tạo card trên Trello tương ứng với Story trong file epic và assign cho dev. Dev sẽ nhận thông báo.

**Bước 2.** Dev mở file epic tương ứng, tìm Story được giao, đọc toàn bộ nội dung Story đó bao gồm: mục tiêu, các task con, code mẫu, và acceptance test.

**Bước 3.** Dev tạo nhánh theo quy ước trong `01-git-flow.md §3.1`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/CARD-XX-mo-ta-ngan
# Thay XX bằng số thứ tự card Trello thực tế
```

**Bước 4.** Dev thực hiện từng task con trong Story, commit thường xuyên theo quy ước commit message.

**Bước 5.** Khi hoàn thành toàn bộ acceptance test của Story, dev tạo Pull Request vào `develop` và thông báo cho Tech Lead.

---

## Nhận diện nhãn task trong file epic

Mỗi task trong file epic được gắn nhãn xác định ai thực hiện:

| Nhãn | Người thực hiện |
|---|---|
| `[BE]` | Backend Developer |
| `[FE]` | Frontend Developer |
| `[DEVOPS]` | Tech Lead |

---

## Lưu ý quan trọng

> [!IMPORTANT]
> `CARD-XX` trong tên nhánh là placeholder. Hỏi Tech Lead để lấy số thứ tự card Trello thực tế khi nhận task.

> [!WARNING]
> Không tự quyết định làm task ngoài danh sách được assign. Nếu muốn nhận thêm task, liên hệ Tech Lead.
