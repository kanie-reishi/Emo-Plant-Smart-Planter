import os
import subprocess
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def check_kaggle_auth():
    kaggle_json_path = os.path.expanduser('~/.kaggle/kaggle.json')
    if not os.path.exists(kaggle_json_path):
        print("❌ Lỗi: Không tìm thấy file ~/.kaggle/kaggle.json")
        print("Vui lòng thực hiện các bước sau:")
        print("1. Đăng ký/Đăng nhập tài khoản tại https://www.kaggle.com/")
        print("2. Vào Profile -> Account -> Create New API Token (sẽ tải file kaggle.json về)")
        print(f"3. Copy file kaggle.json vào thư mục: {os.path.expanduser('~/.kaggle/')}")
        print("Sau đó chạy lại script này.")
        return False
    return True

def download_plantvillage():
    dataset_dir = "./dataset"
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        
    print("⏳ Đang tải bộ dữ liệu PlantVillage từ Kaggle (khoảng 800MB)...")
    try:
        # Sử dụng kaggle CLI để tải (chỉ tải file zip)
        print("Đang tải file ZIP...")
        subprocess.check_call(
            "kaggle datasets download -d abdallahalidev/plantvillage-dataset -p ./dataset", 
            shell=True
        )
        print("Đã tải xong file ZIP. Đang tiến hành giải nén (sẽ mất vài phút)...")
        
        # Giải nén bằng powershell vì python zipfile bị lỗi path trên windows
        subprocess.check_call(
            'powershell -Command "Expand-Archive -Path ./dataset/plantvillage-dataset.zip -DestinationPath ./dataset -Force"',
            shell=True
        )
        
        print("✅ Đã tải và giải nén dữ liệu thành công!")
        
        # Cấu trúc của dataset này sau khi giải nén có thể chứa các thư mục color, segmented, grayscale.
        # Script train_mobilenet.py yêu cầu cấu trúc dataset/train và dataset/val.
        # Ở bước tiếp theo, bạn cần viết code chia tỉ lệ (train/val split) các thư mục từ "color" sang "train" và "val".
        print("⚠️ Lưu ý: Kaggle Dataset này chứa các thư mục như 'color', 'segmented'.")
        print("Bạn hãy tham khảo code trong thư mục dataset để chia tỷ lệ ảnh 80% train / 20% val.")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi khi gọi kaggle: {e}")
    except FileNotFoundError:
        print("❌ Chưa cài đặt Kaggle CLI. Đang tự động cài đặt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle"])
        print("Vui lòng chạy lại script này.")

if __name__ == "__main__":
    print("--- CÔNG CỤ HỖ TRỢ TẢI DỮ LIỆU PLANTVILLAGE ---")
    if check_kaggle_auth():
        download_plantvillage()
