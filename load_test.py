#!/usr/bin/env python3
"""
Load testing script for breast cancer detection API.
Creates 1000 Uzbek female patients (25+ years old) and sends inference requests.
"""

import asyncio
import httpx
import random
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import json

# API configuration
BASE_URL = "http://localhost:8000"
IMAGES_FOLDER = Path("images")
NUM_PATIENTS = 1000
MAX_CONCURRENT_REQUESTS = 10
BATCH_SIZE = 50  # Create patients in batches

# Uzbek female names
UZBEK_FEMALE_NAMES = [
    "Dilnoza", "Gulnora", "Malika", "Nodira", "Zilola",
    "Feruza", "Sevara", "Kamola", "Madina", "Nazira",
    "Umida", "Shaxnoza", "Dilfuza", "Gavhar", "Hilola",
    "Zarina", "Laylo", "Mohira", "Nigora", "Ozoda",
    "Parvina", "Ruxsora", "Saida", "Tahira", "Umida",
    "Vasila", "Yulduz", "Zulayho", "Barno", "Dildora",
    "Farida", "Gulshan", "Hulkar", "Iroda", "Jamila",
    "Komila", "Lobar", "Manzura", "Nargiza", "Oygul",
    "Rahima", "Shahnoza", "Tursunoy", "Vazira", "Yasmin"
]

UZBEK_SURNAMES = [
    "Karimova", "Alimova", "Rahimova", "Mahmudova", "Azimova",
    "Tursunova", "Yusupova", "Abdullayeva", "Sharipova", "Hamidova",
    "Ismoilova", "Sadikova", "Nazarova", "Rustamova", "Safarova",
    "Ahmedova", "Zakirova", "Rahmanova", "Mirzayeva", "Hasanova",
    "Qosimova", "Ergasheva", "Normatova", "Boboyeva", "Jurayeva",
    "Fayzullayeva", "Vohidova", "Saidova", "Umarova", "Xolmatova"
]


class LoadTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.images_folder = IMAGES_FOLDER
        self.created_patients: List[Dict] = []
        self.results = {
            "total_patients": 0,
            "patients_created": 0,
            "patients_failed": 0,
            "total_inferences": 0,
            "inferences_success": 0,
            "inferences_failed": 0,
            "inference_times": [],
            "total_detections": 0
        }
        
    def generate_patient_data(self, patient_id: int) -> dict:
        """Generate realistic Uzbek female patient data with unique identifiers."""
        first_name = random.choice(UZBEK_FEMALE_NAMES)
        last_name = random.choice(UZBEK_SURNAMES)
        
        # Age between 25 and 75
        age = random.randint(25, 75)
        date_of_birth = datetime.now() - timedelta(days=age * 365 + random.randint(0, 365))
        
        # Generate UNIQUE medical record number with timestamp
        timestamp = int(time.time() * 1000)  # milliseconds for uniqueness
        mrn = f"{timestamp}{patient_id:04d}"
        
        # Generate phone number (Uzbek format)
        phone = f"+998{random.randint(90, 99)}{random.randint(1000000, 9999999)}"
        
        # Generate UNIQUE email with timestamp
        email = f"{first_name.lower()}.{last_name.lower()}.{timestamp}.{patient_id}@example.uz"
        
        # Random address (Uzbek cities)
        cities = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan", "Farg'ona", 
                  "Qo'qon", "Xiva", "Urganch", "Nukus", "Termiz", "Jizzax"]
        city = random.choice(cities)
        address = f"{city} shahri, {random.randint(1, 100)}-mahalla, {random.randint(1, 50)}-uy"
        
        return {
            "full_name": f"{first_name} {last_name}",
            "medical_record_number": mrn,
            "date_of_birth": date_of_birth.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "gender": "female",
            "phone": phone,
            "email": email,
            "address": address,
            "notes": f"Load test patient {patient_id} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        }
    
    async def create_patient(self, client: httpx.AsyncClient, patient_id: int) -> Optional[Dict]:
        """Create a single patient via API."""
        patient_data = self.generate_patient_data(patient_id)
        
        try:
            response = await client.post(
                f"{self.base_url}/patients",
                json=patient_data,
                timeout=10.0
            )
            
            if response.status_code == 201:
                patient = response.json()
                self.results["patients_created"] += 1
                return patient
            else:
                self.results["patients_failed"] += 1
                print(f"Failed to create patient {patient_id}: {response.status_code}")
                if patient_id == 0:  # Show detailed error for first patient
                    print(f"\n❌ Detailed error for patient {patient_id}:")
                    print(f"   Status: {response.status_code}")
                    print(f"   Response: {response.text}")
                    print(f"   Request data: {patient_data}\n")
                return None
                
        except Exception as e:
            self.results["patients_failed"] += 1
            print(f"Error creating patient {patient_id}: {e}")
            return None
    
    async def create_patients_batch(self, client: httpx.AsyncClient, start_id: int, batch_size: int) -> List[Dict]:
        """Create a batch of patients concurrently."""
        tasks = [
            self.create_patient(client, patient_id)
            for patient_id in range(start_id, start_id + batch_size)
        ]
        
        patients = await asyncio.gather(*tasks)
        return [p for p in patients if p is not None]
    
    async def send_inference_request(
        self,
        client: httpx.AsyncClient,
        image_path: Path,
        patient_id: int
    ) -> Optional[Dict]:
        """Send an inference request for a specific patient."""
        try:
            start_time = time.time()
            
            with open(image_path, "rb") as f:
                files = {"image": (image_path.name, f, "image/jpeg")}
                data = {"patient_id": patient_id}
                
                response = await client.post(
                    f"{self.base_url}/infer/single",
                    files=files,
                    data=data,
                    timeout=30.0
                )
            
            inference_time = time.time() - start_time
            self.results["inference_times"].append(inference_time)
            
            if response.status_code == 200:
                result = response.json()
                self.results["inferences_success"] += 1
                
                # Count detections
                if "detections" in result:
                    num_detections = len(result["detections"])
                    self.results["total_detections"] += num_detections
                
                return result
            else:
                self.results["inferences_failed"] += 1
                print(f"Inference failed for patient {patient_id}: {response.status_code}")
                return None
                
        except Exception as e:
            self.results["inferences_failed"] += 1
            print(f"Error during inference for patient {patient_id}: {e}")
            return None
    
    async def run_inference_batch(
        self,
        client: httpx.AsyncClient,
        patients: List[Dict],
        image_files: List[Path]
    ):
        """Run inference requests for a batch of patients."""
        tasks = []
        
        for patient in patients:
            # Randomly select an image
            image_path = random.choice(image_files)
            task = self.send_inference_request(client, image_path, patient["id"])
            tasks.append(task)
            
            # Limit concurrent requests
            if len(tasks) >= MAX_CONCURRENT_REQUESTS:
                await asyncio.gather(*tasks)
                tasks = []
        
        # Process remaining tasks
        if tasks:
            await asyncio.gather(*tasks)
    
    def get_image_files(self) -> List[Path]:
        """Get all image files from the images folder."""
        if not self.images_folder.exists():
            print(f"❌ Images folder not found: {self.images_folder}")
            return []
        
        image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}
        image_files = [
            f for f in self.images_folder.iterdir()
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        return image_files
    
    def print_summary(self):
        """Print summary of load test results."""
        print("\n" + "="*60)
        print("LOAD TEST SUMMARY")
        print("="*60)
        
        # Patient creation stats
        print(f"\n📊 Patient Creation:")
        print(f"   Total attempted: {self.results['total_patients']}")
        print(f"   Successfully created: {self.results['patients_created']}")
        print(f"   Failed: {self.results['patients_failed']}")
        if self.results['total_patients'] > 0:
            success_rate = (self.results['patients_created'] / self.results['total_patients']) * 100
            print(f"   Success rate: {success_rate:.1f}%")
        
        # Inference stats
        print(f"\n🔬 Inference Requests:")
        print(f"   Total sent: {self.results['total_inferences']}")
        print(f"   Successful: {self.results['inferences_success']}")
        print(f"   Failed: {self.results['inferences_failed']}")
        if self.results['total_inferences'] > 0:
            success_rate = (self.results['inferences_success'] / self.results['total_inferences']) * 100
            print(f"   Success rate: {success_rate:.1f}%")
        
        # Timing stats
        if self.results['inference_times']:
            avg_time = sum(self.results['inference_times']) / len(self.results['inference_times'])
            min_time = min(self.results['inference_times'])
            max_time = max(self.results['inference_times'])
            print(f"\n⏱️  Inference Timing:")
            print(f"   Average: {avg_time:.2f}s")
            print(f"   Min: {min_time:.2f}s")
            print(f"   Max: {max_time:.2f}s")
        
        # Detection stats
        if self.results['inferences_success'] > 0:
            avg_detections = self.results['total_detections'] / self.results['inferences_success']
            print(f"\n🎯 Detections:")
            print(f"   Total detections: {self.results['total_detections']}")
            print(f"   Average per image: {avg_detections:.1f}")
        
        print("\n" + "="*60)
    
    async def run_load_test(self):
        """Main function to run the load test."""
        print(f"🚀 Starting load test...")
        print(f"   Target: {self.base_url}")
        print(f"   Patients to create: {NUM_PATIENTS}")
        print(f"   Batch size: {BATCH_SIZE}")
        print(f"   Max concurrent requests: {MAX_CONCURRENT_REQUESTS}\n")
        
        # Get image files
        image_files = self.get_image_files()
        if not image_files:
            print("❌ No image files found. Cannot proceed with inference tests.")
            return
        
        print(f"📁 Found {len(image_files)} image files\n")
        
        async with httpx.AsyncClient() as client:
            # Create patients in batches
            print("👥 Creating patients...")
            start_time = time.time()
            
            for batch_start in range(0, NUM_PATIENTS, BATCH_SIZE):
                batch_size = min(BATCH_SIZE, NUM_PATIENTS - batch_start)
                self.results['total_patients'] += batch_size
                
                patients = await self.create_patients_batch(client, batch_start, batch_size)
                self.created_patients.extend(patients)
                
                print(f"   Created batch {batch_start//BATCH_SIZE + 1}/{(NUM_PATIENTS + BATCH_SIZE - 1)//BATCH_SIZE}: "
                      f"{len(patients)}/{batch_size} successful")
            
            creation_time = time.time() - start_time
            print(f"\n✓ Created {len(self.created_patients)} patients in {creation_time:.2f}s")
            
            if not self.created_patients:
                print("\n✗ No patients created successfully. Exiting.")
                return
            
            # Run inference requests
            print(f"\n🔬 Running inference requests for {len(self.created_patients)} patients...")
            self.results['total_inferences'] = len(self.created_patients)
            
            inference_start = time.time()
            await self.run_inference_batch(client, self.created_patients, image_files)
            inference_time = time.time() - inference_start
            
            print(f"\n✓ Completed {self.results['inferences_success']} inferences in {inference_time:.2f}s")
        
        # Print summary
        self.print_summary()


async def main():
    """Entry point for the load test."""
    tester = LoadTester()
    await tester.run_load_test()


if __name__ == "__main__":
    asyncio.run(main())
