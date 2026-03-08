#!/usr/bin/env python3
"""
Mobile UX Audit Script - Adapted for React Web / Capacitor
Modified from original specialist tool to support web-based mobile apps.
"""

import sys
import os
import re
import json
from pathlib import Path

class MobileAuditor:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.passed_count = 0
        self.files_checked = 0

    def audit_file(self, filepath: str) -> None:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except:
            return

        self.files_checked += 1
        filename = os.path.basename(filepath)

        # Detect framework - Adapted for React Web
        is_react = bool(re.search(r'import\s+React|from\s+[\'"]react[\'"]|className=', content))
        
        if not is_react:
            return  # Skip non-react files for now

        # --- 1. TOUCH PSYCHOLOGY CHECKS ---

        # 1.1 Touch Target Size Check (CSS/Tailwind patterns)
        # Look for small fixed sizes in tailwind or inline styles
        small_tailwind = re.findall(r'h-([0-9])\b|w-([0-9])\b|size-([0-9])\b', content)
        for matches in small_tailwind:
            size_val = next((m for m in matches if m), None)
            if size_val and int(size_val) < 10: # h-10 is 40px, under 44px
                self.issues.append(f"[Touch Target] {filename}: Small Tailwind class (h/w-{size_val}) found. Likely < 44px.")

        small_inline = re.findall(r'(?:width|height):\s*([0-3]\d)px', content)
        for size in small_inline:
            if int(size) < 44:
                self.issues.append(f"[Touch Target] {filename}: Inline style size {size}px < 44px minimum.")

        # 1.2 Touch Target Spacing Check
        small_gaps = re.findall(r'(?:margin|gap|p|m)-([0-1])\b', content)
        for gap in small_gaps:
            if int(gap) < 2: # p-2 is 8px
                self.warnings.append(f"[Touch Spacing] {filename}: Small spacing class ({gap}) found. Accidental taps risk.")

        # --- 2. MOBILE PERFORMANCE CHECKS ---

        # 2.1 Heavy Image check
        if re.search(r'<img|<Image', content) and not re.search(r'loading=["\']lazy["\']', content):
             self.warnings.append(f"[Performance] {filename}: Image tag without lazy loading. Can impact mobile TTI.")

        # 2.2 Console.log Detection
        console_logs = len(re.findall(r'console\.log|console\.warn', content))
        if console_logs > 3:
            self.warnings.append(f"[Performance] {filename}: {console_logs} console logs. Remove for cleaner mobile performance.")

        # --- 4. MOBILE TYPOGRAPHY CHECKS ---
        font_sizes = re.findall(r'fontSize:\s*([\d.]+)|text-\[?([\d.]+)(?:px|rem)?\]?', content)
        for fs_matches in font_sizes:
            fs = next((m for m in fs_matches if m), None)
            if fs:
                try:
                    size = float(fs)
                    if size < 12:
                         self.warnings.append(f"[Typography] {filename}: fontSize {size} below 12px readability threshold.")
                except: pass

        # --- 5. MOBILE COLOR SYSTEM CHECKS ---

        # 5.1 Pure Black Avoidance
        if re.search(r'#000000|bg-black|text-black', content) and not re.search(r'dark:', content):
            self.warnings.append(f"[Color] {filename}: Pure black (#000000) detected outside dark mode. Use soft grays (bg-slate-950 etc).")

    def audit_directory(self, directory: str) -> None:
        extensions = {'.tsx', '.ts', '.jsx', '.js', '.css'}
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'dist'}]
            for file in files:
                if Path(file).suffix in extensions:
                    self.audit_file(os.path.join(root, file))

    def get_report(self):
        return {
            "files_checked": self.files_checked,
            "issues": self.issues,
            "warnings": self.warnings,
            "compliant": len(self.issues) == 0
        }

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    auditor = MobileAuditor()
    if os.path.isfile(path):
        auditor.audit_file(path)
    else:
        auditor.audit_directory(path)
    report = auditor.get_report()
    with open('mobile_audit_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    print(f"Audit complete. Results saved to mobile_audit_report.json")

if __name__ == "__main__":
    main()
