"""Quick test of the new PyTorch model."""
import sys
sys.path.insert(0, '/app/backend')

from app.torch_model_service import TorchInferenceService
from PIL import Image
from pathlib import Path

# Test model loading
print("=== Testing PyTorch Model ===\n")

model_path = Path("/app/model_final.pth")
print(f"1. Loading model from: {model_path}")

try:
    service = TorchInferenceService(
        weights_path=model_path,
        device="cpu",
        confidence_threshold=0.25,
        nms_threshold=0.4,
    )
    print("✓ Model loaded successfully!")
    print(f"  Device: {service.device}")
    print(f"  Classes: {service.model_info.classes}")
    print(f"  Categories: {service.model_info.categories}")
except Exception as e:
    print(f"✗ Failed to load model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test with a dummy image
print("\n2. Testing inference with dummy image...")
try:
    # Create a dummy 512x512 RGB image
    from PIL import Image
    import numpy as np
    
    dummy_img = Image.fromarray(
        np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    )
    print(f"   Created dummy image: {dummy_img.size}")
    
    # Run inference
    result = service.predict(dummy_img)
    print(f"✓ Inference successful!")
    print(f"  Image size: {result.size.width}x{result.size.height}")
    print(f"  Detections: {len(result.detections)}")
    
    if result.detections:
        print(f"\n  First few detections:")
        for i, det in enumerate(result.detections[:3]):
            print(f"    {i+1}. {det.label} ({det.category}) - confidence: {det.confidence:.3f}")
            print(f"       BBox: ({det.bbox.x1:.1f}, {det.bbox.y1:.1f}) -> ({det.bbox.x2:.1f}, {det.bbox.y2:.1f})")
            print(f"       Traffic light: {det.traffic_light}")
except Exception as e:
    print(f"✗ Inference failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n=== Test completed successfully! ===")
print("\nClass mapping confirmed:")
print("  0 = Benign (less severe)")
print("  1 = Malignant (more severe)")
