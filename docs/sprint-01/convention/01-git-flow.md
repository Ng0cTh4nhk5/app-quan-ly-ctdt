# Git Flow

## 1. Tổng quan

Tài liệu này định nghĩa quy trình làm việc với Git cho toàn bộ team. Mục tiêu là kiểm soát chất lượng code trước khi lên từng môi trường, giảm xung đột và đảm bảo lịch sử commit rõ ràng.

Thành phần team:

- 1 Tech Lead (phụ trách review và merge toàn bộ Pull Request)
- 2 Backend Developer
- 2 Frontend Developer

---

## 2. Mô hình nhánh

Dự án sử dụng mô hình **Simplified Git Flow** với hai nhánh bền vững và các nhánh tạm thời cho từng task.

### 2.1. Bảng tổng hợp nhánh

| Nhánh | Môi trường | Ai tạo | Mục đích |
|---|---|---|---|
| `main` | Production | (có sẵn) | Code đang chạy thực tế, luôn ổn định |
| `develop` | Staging | Tech Lead tạo 1 lần | Code đang kiểm thử, tích hợp từ các feature |
| `feature/*` | Local | Developer | Phát triển tính năng mới |
| `bugfix/*` | Local | Developer | Sửa lỗi phát sinh trên staging |
| `hotfix/*` | Local | Developer | Sửa lỗi khẩn cấp trên production |

> [!IMPORTANT]
> Không được commit hoặc push thẳng lên `main` và `develop`. Mọi thay đổi phải đi qua Pull Request.

### 2.2. Sơ đồ luồng chính

```
Developer:
  develop (local) → feature/CARD-XX-ten → push → Pull Request → develop

Tech Lead:
  develop (staging OK) → Pull Request → main → tag version → production

Khẩn cấp:
  main → hotfix/ten-loi → Pull Request → main → production
                                       → sync lại develop
```

---

## 3. Quy tắc đặt tên

### 3.1. Tên nhánh

Cấu trúc: `<loai>/<CARD-ID>-<mo-ta-ngan>`

Trong đó:

- `<loai>`: một trong các giá trị `feature`, `bugfix`, `hotfix`
- `<CARD-ID>`: mã card Trello, ví dụ `CARD-42`
- `<mo-ta-ngan>`: mô tả ngắn bằng chữ thường, các từ cách nhau bởi dấu gạch ngang

Ví dụ:

```
feature/CARD-42-them-quan-ly-sinh-vien
feature/CARD-15-dang-nhap-sso
bugfix/CARD-67-fix-tinh-toan-tin-chi
hotfix/fix-loi-khong-the-dang-nhap
```

> [!NOTE]
> Hotfix không yêu cầu CARD-ID vì thường phát sinh ngoài kế hoạch. Tuy nhiên nếu có card tương ứng thì nên ghi vào.

> [!NOTE]
> Trong các file tài liệu kế hoạch (`01-epic*.md`), tên nhánh dùng `CARD-XX` làm placeholder. Khi nhận task, thay `XX` bằng số thứ tự card Trello thực tế. Ví dụ: `CARD-XX` → `CARD-42`.

### 3.2. Commit message

Cấu trúc: `<type>(<scope>): <mô tả ngắn>`

**Bảng type:**

| Type | Khi nào dùng |
|---|---|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `docs` | Thay đổi tài liệu |
| `style` | Định dạng code, không thay đổi logic |
| `refactor` | Tái cấu trúc code, không thêm tính năng hoặc sửa lỗi |
| `test` | Thêm hoặc sửa test |
| `chore` | Cập nhật thư viện, cấu hình build |

**Bảng scope thường dùng trong dự án:**

| Scope | Phạm vi |
|---|---|
| `auth` | Xác thực, phân quyền |
| `ctdt` | Chương trình đào tạo |
| `sinhvien` | Quản lý sinh viên |
| `monhoc` | Quản lý môn học |
| `api` | Endpoint, middleware |
| `ui` | Giao diện chung |
| `db` | Cơ sở dữ liệu, migration |

**Ví dụ commit message hợp lệ:**

```
feat(ctdt): thêm form tạo chương trình đào tạo
fix(auth): sửa lỗi token hết hạn không redirect về trang đăng nhập
docs(api): cập nhật mô tả endpoint quản lý môn học
refactor(sinhvien): tách logic validate sang service riêng
chore(db): nâng cấp Prisma lên phiên bản 6
```

> [!WARNING]
> Không dùng commit message chung chung như `update`, `fix bug`, `test`, `wip`. Commit message phải mô tả rõ thay đổi gì ở phạm vi nào.

---

## 4. Quy trình làm việc

### 4.1. Developer: Phát triển tính năng mới

**Bước 1.** Đồng bộ nhánh `develop` về local trước khi bắt đầu task.

```bash
git checkout develop
git pull origin develop
```

**Bước 2.** Tạo nhánh mới từ `develop`.

```bash
git checkout -b feature/CARD-42-them-quan-ly-sinh-vien
```

**Bước 3.** Làm việc và commit thường xuyên. Mỗi commit nên đại diện cho một thay đổi có nghĩa.

```bash
git add .
git commit -m "feat(sinhvien): thêm API lấy danh sách sinh viên theo khoa"
```

**Bước 4.** Khi hoàn thành task, push nhánh lên GitHub.

```bash
git push origin feature/CARD-42-them-quan-ly-sinh-vien
```

**Bước 5.** Vào GitHub, tạo Pull Request với:

- Base branch: `develop`
- Title theo format: `feat(sinhvien): thêm quản lý sinh viên [CARD-42]`
- Description: mô tả ngắn những gì đã làm và cách kiểm tra

Sau khi tạo PR, thông báo cho Tech Lead qua kênh liên lạc của team.

> [!NOTE]
> Không tự merge Pull Request của mình. Chỉ Tech Lead mới được thực hiện merge.

### 4.2. Developer: Sửa lỗi trên staging

Quy trình tương tự phát triển tính năng, chỉ khác phần đặt tên nhánh:

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/CARD-67-fix-tinh-toan-tin-chi
```

---

### 4.3. Tiêu chí hoàn thành task (Definition of Done)

Một task được coi là hoàn thành và sẵn sàng tạo Pull Request khi đáp ứng đủ tất cả tiêu chí sau.

**Về chức năng:**

- Tất cả checkbox trong mục "Acceptance test" của Story tương ứng trong file epic đã được kiểm tra và pass.
- Không có lỗi hoặc exception khi chạy trên môi trường local.

**Về code:**

- Tuân thủ quy chuẩn đặt tên và cấu trúc trong `00-code-standards.md`.
- Không còn `console.log`, code debug, hoặc đoạn code bị comment out thừa.
- Không có file `.env` hoặc thông tin nhạy cảm nào nằm trong commit.

**Về Git:**

- Commit message đúng format `type(scope): mô tả`.
- Đã pull `develop` mới nhất vào nhánh trước khi push lần cuối.
- Tên nhánh đúng quy ước.

**Về Pull Request:**

- PR title đúng format: `type(scope): mô tả [CARD-XX]`.
- Đã điền đầy đủ nội dung trong PR template (mô tả, link Trello, cách kiểm tra).
- Đã thông báo cho Tech Lead sau khi tạo PR.

> [!NOTE]
> Không cần đợi task "hoàn hảo" mới tạo PR. Nếu có điểm chưa chắc chắn, ghi vào phần "Ghi chú thêm" trong PR template để Tech Lead biết khi review.

---



## 5. Quy trình Tech Lead

### 5.1. Review Pull Request

**Bước 1.** Nhận thông báo PR từ developer.

**Bước 2.** Review code trên GitHub. Nếu cần chỉnh sửa, để lại comment trực tiếp trên từng dòng code. Developer sẽ sửa và push lại, PR tự cập nhật.

**Bước 3.** Khi đồng ý, chọn **Squash and merge** để merge vào `develop`. Thao tác này gộp toàn bộ commit của PR thành một commit duy nhất, giữ lịch sử sạch.

**Bước 4.** Xóa nhánh feature sau khi merge (GitHub có nút xóa ngay sau khi merge).

### 5.2. Deploy lên Production

Khi staging đã kiểm thử và đạt yêu cầu:

**Bước 1.** Tạo Pull Request trên GitHub:

- Head branch: `develop`
- Base branch: `main`
- Title: `release: deploy phiên bản YYYY-MM-DD` hoặc `release: v1.x.x`

**Bước 2.** Tự review lại diff lần cuối, sau đó **Squash and merge** vào `main`.

**Bước 3.** Tạo tag version tại commit vừa merge:

```bash
git checkout main
git pull origin main
git tag v1.0.1
git push origin v1.0.1
```

Quy ước đánh số version (Semantic Versioning):

| Thay đổi | Ví dụ | Khi nào dùng |
|---|---|---|
| `vMAJOR` | v1→v2 | Thay đổi lớn, ảnh hưởng toàn hệ thống |
| `vX.MINOR` | v1.0→v1.1 | Thêm tính năng mới |
| `vX.X.PATCH` | v1.0.0→v1.0.1 | Sửa lỗi nhỏ |

### 5.3. Xử lý Hotfix

Khi có lỗi nghiêm trọng trên production:

**Bước 1.** Tạo nhánh hotfix từ `main`.

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-loi-khong-the-dang-nhap
```

**Bước 2.** Sửa lỗi và commit.

```bash
git commit -m "fix(auth): sửa lỗi đăng nhập không redirect sau khi token hết hạn"
```

**Bước 3.** Push và tạo PR vào `main`.

```bash
git push origin hotfix/fix-loi-khong-the-dang-nhap
```

**Bước 4.** Sau khi merge vào `main` và tag version, phải đồng bộ lại vào `develop` để tránh lỗi bị mất khi deploy staging tiếp theo.

```bash
git checkout develop
git merge main
git push origin develop
```

---

## 6. Thiết lập GitHub

### 6.1. Branch Protection Rules

Vào **Settings → Branches → Add branch protection rule**, áp dụng cho cả `main` và `develop`:

| Cài đặt | Giá trị |
|---|---|
| Branch name pattern | `main` (lặp lại cho `develop`) |
| Require a pull request before merging | Bật |
| Required number of approvals | 1 |
| Block force pushes | Bật |
| Do not allow bypassing the above settings | Bật |

> [!WARNING]
> Bật "Do not allow bypassing" để ngăn cả admin push thẳng lên nhánh bảo vệ, kể cả Tech Lead. Mọi thay đổi phải qua PR.

### 6.2. Cài đặt Merge Strategy

Vào **Settings → General → Pull Requests**, chỉ giữ lại:

- Bật: **Allow squash merging**
- Tắt: Allow merge commits
- Tắt: Allow rebase merging

Đặt default commit message cho squash merge là **Pull request title**.

---

## 7. Cheat Sheet dành cho Developer

Bảng này tổng hợp các lệnh Git thường dùng nhất theo từng tình huống.

| Tình huống | Lệnh |
|---|---|
| Bắt đầu task mới | `git checkout develop && git pull origin develop` |
| Tạo nhánh | `git checkout -b feature/CARD-XX-ten-task` |
| Xem đang ở nhánh nào | `git branch` |
| Lưu tiến độ | `git add . && git commit -m "feat(scope): mô tả"` |
| Đẩy code lên GitHub | `git push origin <ten-nhanh>` |
| Đồng bộ develop vào nhánh hiện tại | `git pull origin develop` |
| Hủy thay đổi chưa commit | `git restore .` |
| Xem lịch sử commit | `git log --oneline` |

> [!NOTE]
> Khi gặp conflict sau khi pull, không tự ý xử lý nếu chưa chắc chắn. Liên hệ Tech Lead để được hỗ trợ.

---

## 8. Trạng thái nhánh theo màu

Quy ước màu trạng thái khi báo cáo hoặc ghi chú nhánh:

| Màu | Trạng thái |
|---|---|
| 🟢 Xanh lá | Sẵn sàng, đã merge hoặc deploy thành công |
| 🟡 Vàng | Đang xử lý, đang review hoặc đang test |
| 🔴 Đỏ | Lỗi, cần xử lý, chặn deploy |
| 🔵 Xanh dương | Đang phát triển, chưa tạo PR |

---

## 9. Tình huống thường gặp

### 9.1. Xử lý conflict

Conflict xảy ra khi hai người cùng chỉnh sửa một đoạn code trong cùng một file. Git không biết giữ phần nào nên yêu cầu người dùng quyết định.

**Dấu hiệu nhận biết:**

```
CONFLICT (content): Merge conflict in src/services/sinhvien.service.ts
Automatic merge failed; fix conflicts and then commit the result.
```

**Cách xử lý:**

Bước 1. Mở file bị conflict. Git đánh dấu vùng xung đột như sau:

```
<<<<<<< HEAD
// code của mình đang có trên nhánh hiện tại
const limit = 10;
=======
// code từ develop kéo về
const limit = 20;
>>>>>>> origin/develop
```

Bước 2. Quyết định giữ phần nào (hoặc kết hợp cả hai), sau đó xóa toàn bộ các dòng đánh dấu (`<<<<<<<`, `=======`, `>>>>>>>`).

Bước 3. Sau khi sửa xong tất cả file conflict, commit lại:

```bash
git add .
git commit -m "fix: xử lý conflict khi merge develop"
```

> [!WARNING]
> Không xóa code của người khác mà không hỏi. Nếu không chắc nên giữ phần nào, liên hệ Tech Lead hoặc người đã viết đoạn code đó.

---

### 9.2. Lỡ commit vào nhầm nhánh (chưa push)

Tình huống: đang ở nhánh `develop` hoặc `main` mà quên tạo nhánh feature trước khi code.

**Cách xử lý:**

Bước 1. Ghi lại hash của commit vừa tạo nhầm.

```bash
git log --oneline
# ví dụ: a1b2c3d feat(sinhvien): thêm API lấy danh sách
```

Bước 2. Tạo nhánh đúng và áp dụng commit đó vào.

```bash
git checkout -b feature/CARD-42-ten-dung
git cherry-pick a1b2c3d
```

Bước 3. Quay lại nhánh sai và hoàn tác commit đó.

```bash
git checkout develop
git reset HEAD~1
```

> [!NOTE]
> `git reset HEAD~1` chỉ xóa commit, không xóa các file thay đổi. Code vẫn còn nguyên trên nhánh sai nhưng ở trạng thái chưa commit.

---

### 9.3. Hoàn tác commit cuối (chưa push)

Tình huống: vừa commit nhưng nhận ra có sai sót và muốn sửa lại.

**Giữ lại thay đổi, chỉ bỏ commit:**

```bash
git reset HEAD~1
# Các file thay đổi vẫn còn, có thể sửa và commit lại
```

**Xóa hoàn toàn commit và thay đổi (thao tác không thể hoàn tác):**

```bash
git reset --hard HEAD~1
```

> [!CAUTION]
> Chỉ dùng `--hard` khi chắc chắn muốn xóa hoàn toàn. Thao tác này không thể khôi phục.

---

### 9.4. Tạm dừng giữa chừng để chuyển sang task khác

Tình huống: đang code dở feature thì được yêu cầu chuyển sang task khác gấp, nhưng chưa muốn commit vì code chưa hoàn chỉnh.

**Lưu tạm thay đổi:**

```bash
git stash
# hoặc đặt tên để dễ nhận biết
git stash push -m "dang lam form tao sinh vien"
```

**Chuyển sang nhánh khác và làm việc bình thường.**

**Khi quay lại, lấy lại thay đổi đã lưu:**

```bash
git stash pop
```

**Xem danh sách stash đang có:**

```bash
git stash list
```

---

### 9.5. Đồng bộ thay đổi mới từ develop vào nhánh feature

Tình huống: đang làm feature mà develop có thêm commit mới từ người khác. Cần kéo về để tránh conflict lớn khi tạo PR.

```bash
git checkout feature/CARD-42-ten-task
git pull origin develop
```

Nếu có conflict, xử lý theo mục 9.1.

> [!NOTE]
> Nên thực hiện thao tác này thường xuyên, đặc biệt trước khi tạo PR, để giảm khả năng conflict.

---

### 9.6. Lỡ push file nhạy cảm lên GitHub

Tình huống: vô tình commit và push file `.env` hoặc file chứa mật khẩu, API key lên repository.

> [!CAUTION]
> Đây là sự cố nghiêm trọng. Ngay cả khi xóa file trong commit tiếp theo, nội dung vẫn còn trong lịch sử Git và có thể bị truy cập. Cần xử lý ngay lập tức.

**Hành động ngay:**

1. Thông báo cho Tech Lead.
2. Đổi toàn bộ thông tin nhạy cảm đã bị lộ (mật khẩu, API key, secret).
3. Tech Lead sẽ dùng công cụ `git filter-repo` hoặc liên hệ GitHub để xóa khỏi lịch sử.

**Phòng tránh:** Kiểm tra file `.gitignore` của dự án và đảm bảo các file sau không bao giờ được commit:

```
.env
.env.local
.env.*.local
*.pem
*.key
```

---

### 9.7. Nhánh bị báo "diverged" khi push

Tình huống: khi chạy `git push`, Git báo lỗi tương tự:

```
! [rejected] feature/CARD-42 -> feature/CARD-42 (non-fast-forward)
hint: Updates were rejected because the tip of your current branch is behind
```

Nguyên nhân: nhánh trên GitHub đã có commit mới mà local chưa có (thường xảy ra khi cùng làm việc trên một nhánh hoặc sau khi rebase).

**Cách xử lý an toàn:**

```bash
git pull origin feature/CARD-42-ten-task
# xử lý conflict nếu có
git push origin feature/CARD-42-ten-task
```

> [!WARNING]
> Không dùng `git push --force` trừ khi được Tech Lead cho phép. Force push có thể xóa commit của người khác.

---

## 10. Templates

### 10.1. Pull Request Template

File `.github/pull_request_template.md` trong repository sẽ tự động điền vào ô Description mỗi khi tạo PR mới trên GitHub.

Xem nội dung template tại: `.github/pull_request_template.md`

### 10.2. Commit Message Template (tùy chọn)

Developer có thể cài đặt template commit message trên máy cá nhân để không cần nhớ format mỗi lần commit.

Tạo file `~/.gitmessage` với nội dung:

```
<type>(<scope>): <mô tả ngắn>

# type: feat | fix | docs | style | refactor | test | chore
# scope: auth | ctdt | sinhvien | monhoc | api | ui | db
#
# Ví dụ:
#   feat(ctdt): thêm form tạo chương trình đào tạo
#   fix(auth): sửa lỗi token hết hạn không redirect
```

Áp dụng template:

```bash
git config --global commit.template ~/.gitmessage
```

Sau khi cài đặt, mỗi lần chạy `git commit` (không có `-m`), Git sẽ mở editor với template sẵn có.
