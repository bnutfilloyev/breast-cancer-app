"""Test script to understand the new model structure and inference."""
import torch
import numpy as np
from PIL import Image
from pathlib import Path

def inspect_model(model_path: str):
    """Inspect the model structure."""
    print(f"Loading model from: {model_path}")
    model = torch.load(model_path, map_location='cpu')
    
    print("\n=== Model Structure ===")
    if isinstance(model, dict):
        print(f"Model is a dictionary with keys: {list(model.keys())}")
        for key in model.keys():
            value = model[key]
            print(f"\n{key}:")
            print(f"  Type: {type(value)}")
            if hasattr(value, 'shape'):
                print(f"  Shape: {value.shape}")
            elif isinstance(value, dict):
                print(f"  Dict keys: {list(value.keys())}")
    else:
        print(f"Model type: {type(model)}")
        print(f"Model: {model}")
    
    return model

def test_inference(model_path: str, test_image_path: str = None):
    """Test inference with the model."""
    print("\n=== Testing Inference ===")
    
    # Load model
    checkpoint = torch.load(model_path, map_location='cpu')
    
    # Try to extract the actual model
    if isinstance(checkpoint, dict):
        if 'model' in checkpoint:
            model = checkpoint['model']
            print("Extracted 'model' from checkpoint")
        elif 'state_dict' in checkpoint:
            print("Found 'state_dict' - need model architecture")
            return
        else:
            print(f"Unknown checkpoint structure: {list(checkpoint.keys())}")
            return
    else:
        model = checkpoint
    
    # Set to eval mode
    if hasattr(model, 'eval'):
        model.eval()
        print("Model set to eval mode")
    
    # Check if model has useful methods
    print(f"\nModel class: {model.__class__.__name__}")
    print(f"Model methods: {[m for m in dir(model) if not m.startswith('_')][:20]}")
    
    # Try to understand input/output
    if hasattr(model, 'forward'):
        print("\nModel has 'forward' method")
    
    # Create a dummy input to test
    print("\n=== Testing with dummy input ===")
    try:
        # Try common image sizes
        for size in [(224, 224), (512, 512), (1280, 1280)]:
            dummy_input = torch.randn(1, 3, size[0], size[1])
            print(f"\nTrying input shape: {dummy_input.shape}")
            try:
                with torch.no_grad():
                    output = model(dummy_input)
                print(f"✓ Success! Output type: {type(output)}")
                if isinstance(output, torch.Tensor):
                    print(f"  Output shape: {output.shape}")
                    print(f"  Output sample: {output[0][:5] if len(output.shape) > 1 else output}")
                elif isinstance(output, (list, tuple)):
                    print(f"  Output length: {len(output)}")
                    for i, out in enumerate(output):
                        if isinstance(out, torch.Tensor):
                            print(f"  Output[{i}] shape: {out.shape}")
                break
            except Exception as e:
                print(f"  ✗ Failed: {str(e)[:100]}")
    except Exception as e:
        print(f"Error during inference test: {e}")
    
    # If we have a test image, try with real data
    if test_image_path and Path(test_image_path).exists():
        print(f"\n=== Testing with real image: {test_image_path} ===")
        try:
            img = Image.open(test_image_path).convert('RGB')
            print(f"Image size: {img.size}")
            
            # Convert to tensor and normalize
            img_array = np.array(img)
            img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0).float() / 255.0
            print(f"Tensor shape: {img_tensor.shape}")
            
            with torch.no_grad():
                output = model(img_tensor)
            print(f"✓ Inference successful!")
            print(f"  Output: {output}")
        except Exception as e:
            print(f"✗ Failed with real image: {e}")

def analyze_class_mapping():
    """Try to understand what class 0 and 1 represent."""
    print("\n=== Analyzing Class Mapping ===")
    print("Based on medical terminology:")
    print("  Class 0: Likely BENIGN (less severe, typically labeled first)")
    print("  Class 1: Likely MALIGNANT (more severe, higher risk)")
    print("\nTo confirm, we need to:")
    print("  1. Check if there's a config file with class names")
    print("  2. Test on known benign/malignant samples")
    print("  3. Check training logs or dataset info")

if __name__ == "__main__":
    model_path = "/Users/bnutfilloyev/Developer/Freelance/breast-cancer-app/model_final.pth"
    
    # Inspect model
    model = inspect_model(model_path)
    
    # Test inference
    test_inference(model_path)
    
    # Analyze class mapping
    analyze_class_mapping()
