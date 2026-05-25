import os
import shutil
import random
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def split_dataset(src_dir, train_dir, val_dir, split_ratio=0.8):
    if not os.path.exists(src_dir):
        print(f"❌ Không tìm thấy thư mục nguồn: {src_dir}")
        print("Vui lòng đợi lệnh giải nén hoàn tất trước khi chạy script này.")
        return

    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)

    classes = [d for d in os.listdir(src_dir) if os.path.isdir(os.path.join(src_dir, d))]
    
    if not classes:
        print(f"❌ Không tìm thấy class nào trong thư mục: {src_dir}")
        return

    total_images = 0
    print(f"Bắt đầu chia dataset ({len(classes)} classes)...")
    
    for cls in classes:
        cls_src_dir = os.path.join(src_dir, cls)
        cls_train_dir = os.path.join(train_dir, cls)
        cls_val_dir = os.path.join(val_dir, cls)
        
        os.makedirs(cls_train_dir, exist_ok=True)
        os.makedirs(cls_val_dir, exist_ok=True)
        
        images = [f for f in os.listdir(cls_src_dir) if os.path.isfile(os.path.join(cls_src_dir, f))]
        # Lọc ra các file ảnh hợp lệ (ẩn đi các file hệ thống nếu có)
        images = [f for f in images if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        # Cố định random seed để mỗi lần chia đều giống nhau (tránh bị rò rỉ tập train sang val khi chạy lại)
        random.seed(42)
        random.shuffle(images)
        
        train_count = int(len(images) * split_ratio)
        train_images = images[:train_count]
        val_images = images[train_count:]
        
        for img in train_images:
            shutil.copy2(os.path.join(cls_src_dir, img), os.path.join(cls_train_dir, img))
            
        for img in val_images:
            shutil.copy2(os.path.join(cls_src_dir, img), os.path.join(cls_val_dir, img))
            
        total_images += len(images)
        print(f"  - {cls}: {len(train_images)} train, {len(val_images)} val")

    print(f"\n✅ Hoàn thành! Tổng cộng {total_images} ảnh đã được chia.")

if __name__ == "__main__":
    SRC_DIR = "./dataset/plantvillage dataset/color"
    TRAIN_DIR = "./dataset/train"
    VAL_DIR = "./dataset/val"
    
    print("--- CHIA TỈ LỆ DATASET (80% TRAIN / 20% VAL) ---")
    split_dataset(SRC_DIR, TRAIN_DIR, VAL_DIR)
