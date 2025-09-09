# Admin Team Management Features

## Tổng quan
Hệ thống đã được bổ sung các chức năng quản lý team và leaders dành cho admin, bao gồm tạo, chỉnh sửa và xóa team/leaders.

## Chức năng mới

### 1. Trang Admin Panel (`/admin`)
- **Truy cập**: Chỉ dành cho role `admin`
- **URL**: `/admin`
- **Chức năng**:
  - Xem tổng quan về tất cả teams
  - Tạo team mới
  - Chỉnh sửa thông tin team
  - Xóa team (soft delete)
  - Thay đổi trạng thái team (active/inactive)
  - Tìm kiếm và lọc teams

### 2. Trang Quản lý Leaders (`/admin/leaders`)
- **Truy cập**: Chỉ dành cho role `admin`
- **URL**: `/admin/leaders`
- **Chức năng**:
  - Xem danh sách tất cả team leaders
  - Tạo leader mới với role TEAM_LEADER
  - Chỉnh sửa thông tin leader
  - Xóa leader (soft delete)
  - Thay đổi trạng thái leader (active/inactive)
  - Xem chi tiết leader và teams họ quản lý
  - Tìm kiếm và lọc leaders theo phòng ban, trạng thái
  - Phân trang danh sách leaders

### 3. API Endpoints mới

#### Teams API (`/api/teams`)
- **GET** `/api/teams` - Lấy danh sách teams
  - Query params: `teamLeader`, `isActive`, `search`, `page`, `limit`
  
- **POST** `/api/teams` - Tạo team mới
  - Body: `{ name, description, teamLeader, members?, projects? }`

#### Team Management API (`/api/teams/[id]`)
- **GET** `/api/teams/[id]` - Lấy thông tin team theo ID
- **PUT** `/api/teams/[id]` - Cập nhật team
- **DELETE** `/api/teams/[id]` - Xóa team (soft delete)

#### Team Members API (`/api/teams/[id]/members`)
- **POST** `/api/teams/[id]/members` - Thêm member vào team
- **DELETE** `/api/teams/[id]/members?memberId=xxx` - Xóa member khỏi team

#### Leaders API (`/api/leaders`)
- **GET** `/api/leaders` - Lấy danh sách leaders
  - Query params: `search`, `isActive`, `department`, `page`, `limit`
  
- **POST** `/api/leaders` - Tạo leader mới
  - Body: `{ email, password, firstName, lastName, phone?, department? }`

#### Leader Management API (`/api/leaders/[id]`)
- **GET** `/api/leaders/[id]` - Lấy thông tin leader theo ID
- **PUT** `/api/leaders/[id]` - Cập nhật leader
- **DELETE** `/api/leaders/[id]` - Xóa leader (soft delete)

#### Leader Teams API (`/api/leaders/[id]/teams`)
- **GET** `/api/leaders/[id]/teams` - Lấy danh sách teams của leader

### 4. Giao diện Admin

#### Dashboard Stats
- Tổng số teams
- Teams hoạt động
- Teams Web
- Teams App
- Tổng số leaders
- Leaders hoạt động
- Số phòng ban
- Tổng teams được quản lý

#### Bảng quản lý Teams
- Hiển thị danh sách teams với thông tin đầy đủ
- Chức năng tìm kiếm theo tên, mô tả
- Lọc theo loại team (Web/App)
- Lọc theo trạng thái (active/inactive)
- Các thao tác: Chỉnh sửa, Xóa, Thay đổi trạng thái

#### Bảng quản lý Leaders
- Hiển thị danh sách leaders với thông tin cá nhân
- Chức năng tìm kiếm theo tên, email, phòng ban
- Lọc theo phòng ban và trạng thái
- Xem chi tiết leader và teams họ quản lý
- Các thao tác: Xem chi tiết, Chỉnh sửa, Xóa, Thay đổi trạng thái
- Phân trang với điều hướng

#### Modal tạo/chỉnh sửa Team
- Form nhập thông tin team
- Validation dữ liệu
- Feedback khi thành công/lỗi

#### Modal tạo/chỉnh sửa Leader
- Form nhập thông tin cá nhân leader
- Dropdown chọn phòng ban
- Password chỉ hiện khi tạo mới
- Validation email và các trường bắt buộc

#### Modal chi tiết Leader
- Hiển thị thông tin cá nhân đầy đủ
- Danh sách teams đang quản lý
- Thống kê số lượng thành viên từng team

### 5. Sidebar Navigation
Đã thêm menu "Quản lý Leaders" cho role admin để truy cập nhanh.

## Hướng dẫn sử dụng

### Đối với Admin:

1. **Truy cập Admin Panel**:
   - Đăng nhập với role `admin`
   - Click "Admin Panel" trong sidebar
   - Hoặc truy cập trực tiếp `/admin`

2. **Quản lý Leaders**:
   - Click "Quản lý Leaders" trong sidebar
   - Hoặc truy cập trực tiếp `/admin/leaders`

3. **Tạo Leader mới**:
   - Click nút "Tạo Leader Mới"
   - Nhập thông tin: Email, mật khẩu, họ tên, số điện thoại, phòng ban
   - Click "Tạo Leader" để hoàn thành

4. **Chỉnh sửa Leader**:
   - Click biểu tượng ✏️ tại leader muốn chỉnh sửa
   - Cập nhật thông tin cần thiết (không thể thay đổi mật khẩu)
   - Click "Cập nhật" để lưu

5. **Xem chi tiết Leader**:
   - Click biểu tượng 👁️ để xem thông tin chi tiết
   - Xem danh sách teams leader đang quản lý
   - Thông tin thống kê về số lượng thành viên

6. **Xóa Leader**:
   - Click biểu tượng 🗑️ tại leader muốn xóa
   - Xác nhận xóa trong popup

7. **Thay đổi trạng thái Leader**:
   - Click biểu tượng ⏸️ (tạm dừng) hoặc ▶️ (kích hoạt)
   - Leader sẽ chuyển sang trạng thái tương ứng

8. **Tìm kiếm và lọc Leaders**:
   - Sử dụng ô tìm kiếm để tìm theo tên, email, phòng ban
   - Sử dụng dropdown để lọc theo phòng ban và trạng thái
   - Click "Xóa bộ lọc" để reset

9. **Tạo Team mới**:
   - Click nút "Tạo Team Mới"
   - Nhập thông tin: Tên team, Mô tả, Loại team, Team Leader
   - Click "Tạo Team" để hoàn thành

10. **Chỉnh sửa Team**:
    - Click biểu tượng ✏️ tại team muốn chỉnh sửa
    - Cập nhật thông tin cần thiết
    - Click "Cập nhật" để lưu

11. **Xóa Team**:
    - Click biểu tượng 🗑️ tại team muốn xóa
    - Xác nhận xóa trong popup

12. **Thay đổi trạng thái Team**:
    - Click biểu tượng ⏸️ (tạm dừng) hoặc ▶️ (kích hoạt)
    - Team sẽ chuyển sang trạng thái tương ứng

13. **Tìm kiếm và lọc Teams**:
    - Sử dụng ô tìm kiếm để tìm theo tên, mô tả
    - Sử dụng dropdown để lọc theo loại team (Web/App) và trạng thái
    - Click "Xóa bộ lọc" để reset

## Cấu trúc Files mới

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                 # Trang Admin Panel
│   │   └── leaders/
│   │       └── page.tsx             # Trang Quản lý Leaders
│   └── api/
│       ├── teams/
│       │   ├── route.ts             # API CRUD teams
│       │   ├── [id]/
│       │   │   ├── route.ts         # API team specific
│       │   │   └── members/
│       │   │       └── route.ts     # API team members
│       └── leaders/
│           ├── route.ts             # API CRUD leaders
│           └── [id]/
│               ├── route.ts         # API leader specific
│               └── teams/
│                   └── route.ts     # API leader teams
├── components/
│   └── layout/
│       └── Sidebar.tsx             # Updated với Leaders management link
└── models/
    ├── Team.ts                     # Đã có sẵn
    └── User.ts                     # Updated với leader methods
```

## Tính năng tương lai
- Tích hợp với user management để chọn team leader từ danh sách có sẵn
- Thêm bulk operations (xóa nhiều, export) cho leaders
- Thêm analytics cho leader performance
- Integration với project assignments
- Real-time notifications cho leader updates
- Quản lý quyền hạn chi tiết cho từng leader
- Dashboard riêng cho leaders
- Báo cáo hiệu suất team theo leader

## Lưu ý kỹ thuật
- Sử dụng soft delete cho teams và leaders (isActive flag)
- API responses có error handling đầy đủ
- Frontend có fallback data khi API không khả dụng
- Responsive design cho mobile devices
- Loading states và confirmations cho user experience tốt hơn
- Phân trang server-side cho hiệu suất tốt hơn
- Validation dữ liệu ở cả frontend và backend
- Password được hash trước khi lưu database
- Email unique constraint để tránh trùng lặp
