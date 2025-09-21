# Hệ thống Thông báo (Notification System)

Hệ thống thông báo đã được triển khai để tự động tạo và gửi thông báo cho các sự kiện quan trọng trong dự án.

## Các tính năng đã triển khai

### 1. Thông báo khi Admin giao Project cho Team Leader
- **Trigger**: Khi admin gọi API `POST /api/projects/assign`
- **Người nhận**: Team Leader của team được giao dự án
- **Nội dung**: Thông báo về dự án mới được giao và yêu cầu chấp nhận
- **Action URL**: Link đến trang chi tiết dự án của team leader

### 2. Thông báo khi Team Leader chấp nhận Project
- **Trigger**: Khi team leader gọi API `POST /api/projects/accept`
- **Người nhận**: Admin tạo dự án
- **Nội dung**: Thông báo team leader đã chấp nhận dự án
- **Action URL**: Link đến trang chi tiết dự án của admin

### 3. Thông báo khi Team Leader giao Task cho Member
- **Trigger**: Khi team leader gọi API `POST /api/tasks` để tạo task mới
- **Người nhận**: Member được giao task
- **Nội dung**: Thông báo về task mới được giao
- **Action URL**: Link đến trang chi tiết task của member

### 4. Thông báo khi Member cập nhật Task
- **Trigger**: Khi member gọi API `PUT /api/tasks/[id]` để cập nhật task
- **Người nhận**: Team Leader tạo task
- **Nội dung**: Thông báo về việc cập nhật tiến độ, trạng thái hoặc số giờ thực hiện
- **Action URL**: Link đến trang chi tiết task của team leader

## Cấu trúc Notification

```typescript
interface Notification {
  _id?: ObjectId;
  title: string;           // Tiêu đề ngắn gọn
  message: string;         // Nội dung chi tiết
  type: NotificationType;  // Loại thông báo
  recipient: ObjectId;     // ID người nhận
  sender?: ObjectId;       // ID người gửi (nếu có)
  isRead: boolean;         // Đã đọc chưa
  data?: Record<string, any>; // Dữ liệu bổ sung
  targetType?: string;     // Loại đối tượng liên quan
  targetId?: ObjectId;     // ID đối tượng liên quan
  actionUrl?: string;      // URL để chuyển hướng khi click
  createdAt: Date;         // Thời gian tạo
  readAt?: Date;          // Thời gian đọc
}
```

## Các loại thông báo (NotificationType)

- `PROJECT_ASSIGNED`: Dự án được giao
- `PROJECT_UPDATED`: Dự án được cập nhật (bao gồm chấp nhận)
- `TASK_ASSIGNED`: Task được giao
- `TASK_UPDATED`: Task được cập nhật
- `DEADLINE_REMINDER`: Nhắc nhở deadline
- `SYSTEM_ANNOUNCEMENT`: Thông báo hệ thống

## Utility Functions

### `createNotification(data: CreateNotificationData)`
Hàm chính để tạo và lưu notification vào database.

### `createProjectAssignedNotification()`
Tạo thông báo khi admin giao project cho team leader.

### `createProjectAcceptedNotification()`
Tạo thông báo khi team leader chấp nhận project.

### `createTaskAssignedNotification()`
Tạo thông báo khi team leader giao task cho member.

### `createTaskUpdatedNotification()`
Tạo thông báo khi member cập nhật task.

### `createDeadlineReminderNotification()`
Tạo thông báo nhắc nhở deadline (có thể dùng cho scheduled jobs).

### `createSystemAnnouncementNotification()`
Tạo thông báo hệ thống cho nhiều người dùng.

## API Endpoints

### GET /api/notifications
Lấy danh sách thông báo của user hiện tại
- **Query params**: `page`, `limit`, `unreadOnly`
- **Response**: Danh sách notifications với pagination và unreadCount

### POST /api/notifications
Tạo notification mới (thường được gọi bởi system)

### PUT /api/notifications
Cập nhật trạng thái đọc của notifications
- **Actions**: `markAllAsRead`, `markAsRead`

### PUT /api/notifications/[id]
Đánh dấu một notification cụ thể là đã đọc

## Cách sử dụng

### 1. Import utility functions
```typescript
import { 
  createProjectAssignedNotification,
  createTaskUpdatedNotification 
} from '@/lib/notification-utils';
```

### 2. Gọi hàm tạo notification trong API handlers
```typescript
// Trong API assign project
if (success) {
  await createProjectAssignedNotification(
    projectId,
    project.name,
    adminId,
    teamLeaderId
  );
}
```

### 3. Hiển thị notifications trong UI
Sử dụng API `GET /api/notifications` để lấy và hiển thị danh sách thông báo.

## Tính năng mở rộng

### Có thể thêm các tính năng sau:
1. **Real-time notifications**: Sử dụng WebSocket hoặc Server-Sent Events
2. **Email notifications**: Gửi email cho các thông báo quan trọng
3. **Push notifications**: Thông báo đẩy trên mobile/web
4. **Notification templates**: Tạo template cho các loại thông báo
5. **User preferences**: Cho phép user tùy chỉnh loại thông báo muốn nhận
6. **Notification scheduling**: Lên lịch gửi thông báo nhắc nhở deadline

## Lưu ý kỹ thuật

- Tất cả notifications được lưu trong collection `notifications` của MongoDB
- Sử dụng ObjectId để reference đến users và các entities khác
- Error handling được implement để đảm bảo hệ thống không bị crash nếu tạo notification thất bại
- Notifications có thể được query theo user, type, status đọc/chưa đọc
- Pagination được support để xử lý large datasets