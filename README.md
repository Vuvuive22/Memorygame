# 🎴 Memory Game (Trò chơi Lật Thẻ Bài)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-orange.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

Một trò chơi rèn luyện trí nhớ (Memory / Matching Game) hiện đại, tương tác cao được xây dựng bằng **Vanilla HTML5, CSS3, JavaScript (ES6 Modules)** kết hợp với **Firebase Realtime Database** để hỗ trợ chế độ chơi đối kháng trực tuyến (Online Multiplayer).

---

## 🌟 Tính năng nổi bật

### 🎮 Đa dạng chế độ chơi (Game Modes)
- **Standard (Cổ điển)**: Lật 2 thẻ bất kỳ để tìm các cặp thẻ tương ứng.
- **Sequential (1 Player)**: Thử thách trí nhớ tìm các thẻ theo thứ tự tuần tự tăng dần.
- **Sequential (2 Players - Đối kháng cục bộ)**: Hai người chơi luân phiên lượt trên cùng một thiết bị.
- **Online Multiplayer (Chơi trực tuyến thời gian thực)**:
  - Tạo phòng (Create Room) và tự động tạo mã PIN phòng gồm 4 chữ số.
  - Tham gia phòng (Join Room) bằng mã PIN nhanh chóng.
  - Sảnh chờ (Lobby) hiển thị danh sách người chơi và trạng thái sẵn sàng.
  - **Online HUD**: Đồng bộ bài lật và cập nhật tiến độ của đối thủ theo thời gian thực (Realtime sync).

### 📐 Tùy chọn kích thước bàn cờ (Grid Size)
- **4 x 4 (16 ô)**: Chế độ tiêu chuẩn nhanh gọn (8 cặp thẻ).
- **6 x 6 (36 ô)**: Chế độ mở rộng độ khó cao hơn (18 cặp thẻ).

### ⏱️ Thống kê & Điểm số
- **Bộ đếm thời gian (Timer)**: Theo dõi thời gian hoàn thành ván đấu.
- **Bộ đếm nước đi (Move Counter)**: Ghi nhận tổng số lần lật bài.
- **Đánh giá sao (Star Rating)**: Đánh giá thành tích từ 1 đến 3 sao dựa trên số lượt lật bài.
- **Kỷ lục cá nhân (Best Score)**: Tự động lưu thành tích tốt nhất vào `localStorage`.

### 🔊 Âm thanh & Thông báo
- **Sound Effects (SoundManager)**: Hiệu ứng âm thanh khi lật thẻ, ghép đúng, ghép sai và khi chiến thắng. Hỗ trợ bật/tắt âm thanh (Mute) và điều chỉnh âm lượng.
- **Toast Notifications (NotificationUI)**: Thông báo trạng thái game, lượt chơi và các sự kiện trực tuyến một cách trực quan.

### 🎨 Giao diện & Trải nghiệm (UI/UX)
- Thiết kế hiện đại với hiệu ứng gradient và lật thẻ 3D mượt mà.
- Popup chúc mừng chiến thắng (Win dialog) & thông báo kết quả chi tiết.
- Hỗ trợ thao tác phím (Enter / Space) để chơi thuận tiện và tối ưu khả năng tiếp cận (Accessibility).

---

## 📁 Cấu trúc thư mục

```text
memorygame-development/
├── audio/                      # Thư mục chứa hiệu ứng âm thanh (flip, match, mismatch, win)
├── css/
│   └── app.css                 # Giao diện chính, hiệu ứng thẻ bài, animation & dialog
├── img/
│   └── geometry2.png           # Hình nền texture
├── js/
│   ├── app.js                  # Entry point, xử lý sự kiện UI & khởi tạo game
│   ├── Deck.js                 # Quản lý bộ thẻ, thuật toán xáo bài (Shuffle)
│   ├── GamePlay.js             # Logic trò chơi, tính điểm, lượt chơi và điều kiện thắng
│   ├── GameUI.js               # Xử lý cập nhật giao diện DOM, dialog, đồng hồ & sao
│   ├── NotificationUI.js       # Hệ thống thông báo toast notification
│   ├── OnlineManager.js        # Quản lý kết nối Firebase, phòng chơi và đồng bộ Realtime
│   ├── SoundManager.js         # Quản lý âm thanh hiệu ứng game
│   └── firebase-config.js      # Cấu hình kết nối Firebase Realtime Database
├── docs/                       # Tài liệu & sơ đồ workflow của dự án
├── index.html                  # Giao diện chính của ứng dụng
├── package.json                # Cấu hình npm & dependencies
└── webpack.config.js           # Cấu hình Webpack (tuỳ chọn)
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- Trình duyệt web hiện đại hỗ trợ ES6 Modules (Chrome, Firefox, Edge, Safari,...).
- Một local web server (do ứng dụng sử dụng ES Modules `type="module"`).

### 2. Cài đặt

Clone repository về máy của bạn:
```bash
git clone https://github.com/Vuvuive22/Memorygame.git
cd Memorygame
```

### 3. Chạy ứng dụng

Bạn có thể chạy dự án bằng bất kỳ local server nào:

**Sử dụng VS Code Live Server:**
- Mở thư mục dự án trong Visual Studio Code.
- Cài extension **Live Server**.
- Nhấp chuột phải vào `index.html` và chọn **Open with Live Server**.

**Sử dụng Node.js (npx serve hoặc http-server):**
```bash
npx serve .
# Hoặc
npx http-server .
```
Truy cập địa chỉ hiển thị trên terminal (ví dụ: `http://localhost:3000` hoặc `http://localhost:8080`).

---

## 🔧 Cấu hình Firebase (Cho chế độ Online)

Dự án đã tích hợp cấu hình mẫu tại `js/firebase-config.js`. Nếu bạn muốn dùng Firebase project của riêng mình:

1. Truy cập [Firebase Console](https://console.firebase.google.com/) và tạo project mới.
2. Bật dịch vụ **Realtime Database** và cấu hình Rules (cho phép đọc/ghi theo nhu cầu phát triển):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Lấy thông tin cấu hình web app từ Firebase Console và cập nhật vào file `js/firebase-config.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 📖 Hướng dẫn chơi (How to Play)

1. **Bắt đầu**: Chọn một trong các chế độ chơi và kích thước bàn cờ (4x4 hoặc 6x6).
2. **Lật thẻ**:
   - Nhấp chuột vào thẻ bài hoặc dùng phím `Tab` để di chuyển và nhấn `Enter`/`Space` để lật.
   - Tìm kiếm 2 thẻ có biểu tượng giống nhau để tạo thành 1 cặp hợp lệ.
3. **Chiến thắng**: Trò chơi kết thúc khi tất cả các cặp thẻ được lật mở thành công. Hãy cố gắng hoàn thành với số bước di chuyển ít nhất và thời gian nhanh nhất để đạt tối đa 3 sao!
4. **Chơi Online**:
   - Người thứ nhất nhấn **Online Multiplayer** ➔ **Create Room** ➔ Nhận mã PIN (4 số).
   - Người thứ hai chọn **Online Multiplayer** ➔ **Join Room** ➔ Nhập mã PIN.
   - Host nhấn **Start Game** khi các người chơi đã sẵn sàng.

---

## 🛠️ Công nghệ sử dụng

- **HTML5 & CSS3**: Thiết kế bố cục chuẩn ngữ nghĩa, Flexbox, Grid và hiệu ứng hoạt họa 3D.
- **JavaScript (ES6+)**: Xử lý logic hướng đối tượng (OOP) theo module tách biệt.
- **Firebase Realtime Database**: Đồng bộ dữ liệu phòng chơi và lượt đấu tức thời qua WebSocket.
- **Font Awesome 4.6**: Bộ icon biểu tượng trên các thẻ bài và nút chức năng.
- **Google Fonts (Coda, Open Sans)**: Phông chữ hiển thị hiện đại, phong cách game.

---

## 👤 Tác giả

- **GitHub**: [@Vuvuive22](https://github.com/Vuvuive22)
- **Repository**: [Memorygame](https://github.com/Vuvuive22/Memorygame)

---

## 📄 Bản quyền (License)

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
