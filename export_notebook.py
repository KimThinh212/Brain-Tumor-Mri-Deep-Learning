"""
Chuyển notebook 07_final_dualhead_v2.ipynb thành Python script thuần,
sửa source cells từ dạng character-by-character sang string thông thường.
"""
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
nb_path = PROJECT_ROOT / "notebooks" / "07_final_dualhead_v2.ipynb"
out_py   = PROJECT_ROOT / "run_training.py"

with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

lines = [
    "# ============================================================",
    "# Auto-generated from 07_final_dualhead_v2.ipynb",
    "# Chay: venv\\Scripts\\python.exe run_training.py",
    "# ============================================================",
    "",
]

for i, cell in enumerate(nb["cells"]):
    cell_type = cell.get("cell_type", "")
    source    = cell.get("source", [])

    # source có thể là list of chars HOẶC list of strings
    # Ghép lại thành chuỗi đầy đủ
    src_str = "".join(source)

    if cell_type == "markdown":
        # Comment ra
        lines.append(f"# {'='*60}")
        for md_line in src_str.split("\n"):
            lines.append(f"# {md_line}")
        lines.append("")
    elif cell_type == "code" and src_str.strip():
        lines.append(f"# --- Cell {i} ---")
        lines.append(src_str)
        lines.append("")

py_content = "\n".join(lines)

with open(out_py, "w", encoding="utf-8") as f:
    f.write(py_content)

print(f"Generated: {out_py}")
print(f"Lines: {len(py_content.splitlines())}")

# Preview first 30 non-empty lines
print("\n--- Preview ---")
count = 0
for line in py_content.splitlines():
    if line.strip():
        print(line)
        count += 1
    if count >= 30:
        break
