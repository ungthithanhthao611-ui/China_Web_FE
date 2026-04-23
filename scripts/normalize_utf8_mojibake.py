from __future__ import annotations

import argparse
import json
from pathlib import Path

try:
    from ftfy import fix_encoding as ftfy_fix_encoding
except Exception:  # pragma: no cover
    ftfy_fix_encoding = None


TEXT_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".vue",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".html",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".txt",
}

MARKER_TOKENS = ("Ã", "Â", "Ä", "Å", "áº", "á»", "â€", "ï»¿", "Ð", "Ñ")
VIETNAMESE_CHARS = set(
    "AaĂăÂâBbCcDdĐđEeÊêGgHhIiKkLlMmNnOoÔôƠơPpQqRrSsTtUuƯưVvXxYy"
    "ÁÀẢÃẠẤẦẨẪẬẮẰẲẴẶÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ"
    "áàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ"
)


def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS


def mojibake_score(text: str) -> int:
    score = 0
    for token in MARKER_TOKENS:
        score += text.count(token)
    score += sum(1 for ch in text if 0x80 <= ord(ch) <= 0x9F)
    return score


def vietnamese_score(text: str) -> int:
    return sum(1 for ch in text if ch in VIETNAMESE_CHARS)


def try_transcode_once(text: str) -> str:
    base_bad = mojibake_score(text)
    if base_bad == 0:
        return text

    best = text
    best_bad = base_bad
    best_vn = vietnamese_score(text)

    for source_encoding in ("cp1252", "latin-1"):
        try:
            candidate = text.encode(source_encoding).decode("utf-8")
        except UnicodeError:
            continue

        candidate_bad = mojibake_score(candidate)
        candidate_vn = vietnamese_score(candidate)
        if candidate_bad < best_bad or (candidate_bad == best_bad and candidate_vn > best_vn):
            best = candidate
            best_bad = candidate_bad
            best_vn = candidate_vn

    return best


def fix_text(text: str) -> tuple[str, bool]:
    current = text
    changed = False

    if ftfy_fix_encoding is not None:
        for _ in range(3):
            candidate = ftfy_fix_encoding(current)
            if candidate == current:
                break
            current = candidate
            changed = True

    for _ in range(3):
        improved = try_transcode_once(current)
        if improved == current:
            break
        current = improved
        changed = True
    return current, changed


def normalize_file(path: Path, apply_changes: bool) -> tuple[bool, dict]:
    raw = path.read_bytes()
    if b"\x00" in raw:
        return False, {"path": str(path), "reason": "binary-skip"}

    had_bom = raw.startswith(b"\xef\xbb\xbf")

    try:
        original = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            original = raw.decode("cp1252")
        except UnicodeDecodeError:
            return False, {"path": str(path), "reason": "decode-skip"}

    fixed, changed = fix_text(original)
    needs_rewrite = changed or had_bom

    if not needs_rewrite:
        return False, {"path": str(path), "reason": "unchanged"}

    if apply_changes:
        path.write_text(fixed, encoding="utf-8", newline="")

    return True, {
        "path": str(path),
        "changed": changed,
        "removed_bom": had_bom,
        "old_bad_score": mojibake_score(original),
        "new_bad_score": mojibake_score(fixed),
    }


def collect_files(root: Path) -> list[Path]:
    if root.is_file():
        return [root] if is_text_file(root) else []
    files: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if ".git" in path.parts or "node_modules" in path.parts or "dist" in path.parts:
            continue
        if is_text_file(path):
            files.append(path)
    return files


def run(targets: list[Path], apply_changes: bool) -> dict:
    all_files: list[Path] = []
    for target in targets:
        all_files.extend(collect_files(target))

    scanned = 0
    modified = 0
    details: list[dict] = []
    for file_path in sorted(set(all_files)):
        scanned += 1
        was_modified, detail = normalize_file(file_path, apply_changes=apply_changes)
        if was_modified:
            modified += 1
            details.append(detail)

    return {
        "apply_changes": apply_changes,
        "scanned": scanned,
        "modified": modified,
        "details": details,
    }


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Normalize FE text files to UTF-8 and fix common mojibake.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only check and report; do not rewrite files.",
    )
    parser.add_argument(
        "--targets",
        nargs="*",
        default=["src", "public", "index.html"],
        help="Relative targets from FE root. Default: src public index.html",
    )
    args = parser.parse_args()

    target_paths = [(project_root / item).resolve() for item in args.targets]
    report = run(target_paths, apply_changes=not args.check)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
