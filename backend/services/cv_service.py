import os
import io
import hashlib
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


class ComputerVisionService:
    @staticmethod
    def compute_sha256(file_bytes: bytes) -> str:
        """Compute standard SHA-256 hash of file."""
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def compute_perceptual_hash(image_path: str) -> str:
        """Compute an 8x8 average hash to detect visually identical or re-encoded screenshots."""
        try:
            with Image.open(image_path) as img:
                img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
                pixels = list(img.getdata())
                avg = sum(pixels) / len(pixels)
                bits = "".join(['1' if p > avg else '0' for p in pixels])
                # Convert 64 bits to 16 hex chars
                return hex(int(bits, 2))[2:].zfill(16)
        except Exception:
            return ""

    @staticmethod
    def perform_error_level_analysis(image_path: str, quality: int = 90) -> dict:
        """
        Error Level Analysis (ELA):
        Resaves image at a standard JPEG quality level and calculates pixel delta.
        Digitally edited or spliced parts will retain different compression error levels.
        """
        try:
            with Image.open(image_path) as original:
                original = original.convert("RGB")
                
                # Save to memory buffer at specific quality
                buffer = io.BytesIO()
                original.save(buffer, "JPEG", quality=quality)
                buffer.seek(0)
                
                # Reopen and compute a difference
                recompressed = Image.open(buffer)
                diff = ImageChops.difference(original, recompressed)
                
                # Enhance difference for measurement
                extrema = diff.getextrema()
                max_diff = max([ex[1] for ex in extrema]) if extrema else 0
                scale = 255.0 / max_diff if max_diff > 0 else 1.0
                
                diff_enhanced = ImageEnhance.Brightness(diff).enhance(scale)
                diff_arr = np.array(diff)
                mean_diff = float(np.mean(diff_arr))
                max_error = float(np.max(diff_arr))
                std_diff = float(np.std(diff_arr))
                
                # Suspicion heuristic: very high std/max delta indicates spliced text
                anomaly_flag = bool(max_error > 50 and std_diff > 12)
                
                return {
                    "ela_mean_delta": round(float(mean_diff), 2),
                    "ela_max_delta": round(float(max_error), 2),
                    "ela_std_delta": round(float(std_diff), 2),
                    "ela_anomaly_detected": anomaly_flag,
                }
        except Exception as e:
            return {
                "ela_mean_delta": 0.0,
                "ela_max_delta": 0.0,
                "ela_std_delta": 0.0,
                "ela_anomaly_detected": False,
                "error": str(e)
            }

    @staticmethod
    def analyze_image_quality_and_edges(image_path: str) -> dict:
        """
        Examine image focus/blur (Laplacian variance) and edge sharpness
        which often differs in fake screenshot generators vs native screenshots.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {"blur_score": 0.0, "is_blurry": False, "edge_density_pct": 0.0}
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Laplacian variance for blur/sharpness
            lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            
            # Canny edge density
            edges = cv2.Canny(gray, 100, 200)
            edge_density = float(np.count_nonzero(edges) / (edges.shape[0] * edges.shape[1]))
            
            # Dimensions check
            h, w = int(gray.shape[0]), int(gray.shape[1])
            aspect_ratio = round(float(h / w), 2) if w > 0 else 0.0
            
            return {
                "sharpness_score": round(lap_var, 2),
                "is_blurry": bool(lap_var < 50.0),
                "edge_density_pct": round(edge_density * 100, 2),
                "resolution": f"{w}x{h}",
                "aspect_ratio": aspect_ratio,
                "is_mobile_aspect": bool(1.6 <= aspect_ratio <= 2.4)
            }
        except Exception as e:
            return {"error": str(e)}

    @classmethod
    def run_full_cv_pipeline(cls, image_path: str, file_bytes: bytes, db_session=None) -> dict:
        """Executes full computer vision forensic checks."""
        sha256 = cls.compute_sha256(file_bytes)
        phash = cls.compute_perceptual_hash(image_path)
        ela_metrics = cls.perform_error_level_analysis(image_path)
        quality_metrics = cls.analyze_image_quality_and_edges(image_path)
        
        # Check duplicate submissions
        is_duplicate = False
        duplicate_count = 0
        if db_session:
            from models import AnalysisRecord
            match = db_session.query(AnalysisRecord).filter(
                (AnalysisRecord.image_hash == sha256)
            ).all()
            if len(match) > 0:
                is_duplicate = True
                duplicate_count = len(match)
        
        return {
            "sha256": sha256,
            "phash": phash,
            "is_duplicate": is_duplicate,
            "duplicate_count": duplicate_count,
            "ela": ela_metrics,
            "quality": quality_metrics,
        }
