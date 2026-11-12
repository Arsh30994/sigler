"""Non-destructive static handshape dataset inventory and contact-sheet utility."""
from __future__ import annotations
import csv, hashlib, json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw" / "DATASET"
META = ROOT / "metadata"
SHEET = ROOT / "reports" / "contact-sheet.jpg"

def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def perceptual(image: Image.Image) -> str:
    pixels = list(image.convert("L").resize((8, 8)).get_flattened_data()); mean = sum(pixels) / len(pixels)
    return "".join("1" if pixel >= mean else "0" for pixel in pixels)

def run(raw: Path = RAW) -> dict:
    META.mkdir(parents=True, exist_ok=True); SHEET.parent.mkdir(parents=True, exist_ok=True)
    rows, broken, thumbs = [], [], []
    for class_dir in sorted(path for path in raw.iterdir() if path.is_dir()):
        for path in sorted(class_dir.iterdir()):
            if not path.is_file(): continue
            try:
                with Image.open(path) as image:
                    image.verify()
                with Image.open(path) as image:
                    image.load(); width, height = image.size; mode = image.mode; phash = perceptual(image)
                    if len(thumbs) < 36 or not any(key == class_dir.name for key, _ in thumbs): thumbs.append((class_dir.name, image.copy().convert("RGB")))
            except Exception as error:
                broken.append({"path": str(path.relative_to(ROOT)), "error": str(error)}); continue
            rows.append({"image_path": str(path.relative_to(ROOT)), "raw_class_id": class_dir.name, "width": width, "height": height, "channels": len(mode) if mode not in {"L", "1"} else 1, "sha256": digest(path), "perceptual_hash": phash})
    with (META / "manifest.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]) if rows else ["image_path", "raw_class_id", "width", "height", "channels", "sha256", "perceptual_hash"]); writer.writeheader(); writer.writerows(rows)
    by_hash = Counter(row["sha256"] for row in rows); by_phash = Counter(row["perceptual_hash"] for row in rows)
    report = {"image_count": len(rows), "class_distribution": dict(Counter(row["raw_class_id"] for row in rows)), "corrupted_images": broken, "exact_duplicate_groups": sum(count > 1 for count in by_hash.values()), "near_duplicate_hash_groups": sum(count > 1 for count in by_phash.values()), "dimensions": dict(Counter(f'{row["width"]}x{row["height"]}' for row in rows)), "channels": dict(Counter(str(row["channels"]) for row in rows)), "background_annotation_inconsistency":"not automatically classified; inspect contact sheet"}
    (META / "inspection_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (META / "class_mapping.json").write_text(json.dumps({"mapping_status":"unverified", "note":"Raw folder IDs are preserved exactly and have no asserted meaning.", "classes": {key: {"raw_class_id": key, "meaning": None, "status": "UNVERIFIED"} for key in sorted(report["class_distribution"])}}, indent=2), encoding="utf-8")
    canvas = Image.new("RGB", (6 * 180, 6 * 200), "white"); draw = ImageDraw.Draw(canvas)
    for index, (label, image) in enumerate(thumbs[:36]):
        image.thumbnail((160, 160)); x, y = (index % 6) * 180 + 10, (index // 6) * 200 + 25; canvas.paste(image, (x, y)); draw.text((x, y - 18), f"raw: {label}", fill="black")
    canvas.save(SHEET, quality=92)
    return report
if __name__ == "__main__": print(json.dumps(run(), indent=2))
