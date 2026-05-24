import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import os

# --- Cấu hình siêu tham số (Hyperparameters) ---
DATA_DIR = './dataset' # Đường dẫn tới thư mục PlantVillage (Cần chuẩn bị trước khi chạy)
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.001
NUM_CLASSES = 38 # PlantVillage có 38 class bệnh lý và lá khỏe

def train_model():
    """
    Hàm huấn luyện mô hình MobileNetV2 để phân loại bệnh lá cây.
    Mô hình sẽ sử dụng Pre-trained weights từ ImageNet để hội tụ nhanh hơn.
    """
    # 1. Kiểm tra thiết bị phần cứng (Dùng GPU nếu có)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Training device: {device}")

    # 2. Data Augmentation (Tăng cường dữ liệu) để mô hình tránh overfitting
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224), # Resize về 224x224 (kích thước chuẩn của MobileNet)
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Tải dữ liệu từ thư mục (Yêu cầu cấu trúc: DATA_DIR/train/class_names và DATA_DIR/val/class_names)
    try:
        image_datasets = {x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x]) 
                          for x in ['train', 'val']}
        dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=BATCH_SIZE, 
                                                     shuffle=True, num_workers=4) 
                       for x in ['train', 'val']}
        dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
        class_names = image_datasets['train'].classes
        print(f"✅ Found {len(class_names)} classes.")
    except Exception as e:
        print(f"❌ Lỗi load dữ liệu: {e}\nĐảm bảo bạn đã giải nén thư mục dataset PlantVillage vào '{DATA_DIR}'.")
        return

    # 3. Khởi tạo mô hình MobileNetV2
    print("⏳ Loading pre-trained MobileNetV2...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Tuỳ chọn: Freeze các layer feature extractor để chỉ train lại layer cuối cùng
    # for param in model.parameters():
    #     param.requires_grad = False

    # Thay thế Classifier layer cuối cùng cho khớp số lượng class của chúng ta (38)
    model.classifier[1] = nn.Linear(model.last_channel, NUM_CLASSES)
    model = model.to(device)

    # 4. Thiết lập Loss Function và Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # 5. Vòng lặp huấn luyện chính (Training Loop)
    print("🔥 Bắt đầu huấn luyện...")
    for epoch in range(NUM_EPOCHS):
        print(f'Epoch {epoch}/{NUM_EPOCHS - 1}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()  # Chế độ training (Kích hoạt Dropout/BatchNorm)
            else:
                model.eval()   # Chế độ evaluation (Tắt Dropout/BatchNorm)

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                # Reset gradients
                optimizer.zero_grad()

                # Feed forward
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    # Backpropagation nếu ở phase train
                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                # Thống kê
                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'[{phase.upper()}] Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # 6. Lưu file trọng số (Weights)
    save_path = 'mobilenetv2_plantvillage.pth'
    torch.save(model.state_dict(), save_path)
    print(f"🎉 Huấn luyện hoàn tất! Mô hình đã được lưu tại '{save_path}'")

if __name__ == '__main__':
    train_model()
