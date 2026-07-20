#!/usr/bin/env python3

import contextlib
import importlib.metadata
import json
import os
import subprocess
import sys
from pathlib import Path


REQUIRED_GENERATOR_VERSION = "0.1.1"
MIN_COMPLETENESS_RATIO = 0.75

ROOT = Path(__file__).resolve().parent.parent
LOCKFILE = ROOT / "package-lock.json"
OUTPUT = ROOT / "flatpak-node-sources.json"
NODE_MODULES = ROOT / "node_modules"
NODE_MODULES_BACKUP = ROOT / "node_modules_flatpak_gen_backup"


def ensure_generator() -> None:
    try:
        installed_version = importlib.metadata.version("flatpak-node-generator")
    except importlib.metadata.PackageNotFoundError:
        installed_version = None

    if installed_version == REQUIRED_GENERATOR_VERSION:
        return

    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "--user",
            "--disable-pip-version-check",
            f"flatpak-node-generator=={REQUIRED_GENERATOR_VERSION}",
        ],
        cwd=ROOT,
        check=True,
    )


@contextlib.contextmanager
def without_node_modules():
    """
    flatpak-node-generator must run with node_modules absent; see:
    https://github.com/flatpak/flatpak-builder-tools/blob/master/node/README.md
    Temporarily rename the directory and restore it afterwards.
    """
    renamed = NODE_MODULES.exists()
    if renamed:
        NODE_MODULES.rename(NODE_MODULES_BACKUP)
    try:
        yield
    finally:
        if renamed and NODE_MODULES_BACKUP.exists():
            NODE_MODULES_BACKUP.rename(NODE_MODULES)


def generate_sources() -> None:
    with without_node_modules():
        subprocess.run(
            [
                sys.executable,
                "-m",
                "flatpak_node_generator",
                "npm",
                str(LOCKFILE),
                "-o",
                str(OUTPUT),
            ],
            cwd=ROOT,
            check=True,
        )


def validate_sources() -> None:
    lockfile = json.loads(LOCKFILE.read_text())
    generated = json.loads(OUTPUT.read_text())

    package_count = max(len(lockfile.get("packages", {})) - 1, 1)
    inline_count = sum(1 for item in generated if item.get("type") == "inline")
    package_blob_count = sum(
        1 for item in generated if item.get("type") in {"file", "archive"}
    )
    electron_urls = {
        item.get("url", "")
        for item in generated
        if item.get("type") == "file" and "github.com/electron/electron/releases" in item.get("url", "")
    }

    min_expected = int(package_count * MIN_COMPLETENESS_RATIO)
    required_electron_suffixes = (
        "electron-v43.1.0-linux-arm64.zip",
        "electron-v43.1.0-linux-armv7l.zip",
        "electron-v43.1.0-linux-x64.zip",
    )

    missing_electron_files = [
        suffix
        for suffix in required_electron_suffixes
        if not any(url.endswith(suffix) for url in electron_urls)
    ]

    if inline_count < min_expected or package_blob_count < min_expected or missing_electron_files:
        raise SystemExit(
            "Incomplete flatpak-node-sources.json generated: "
            f"{len(generated)} entries, {inline_count} inline entries, "
            f"{package_blob_count} file/archive entries for {package_count} lockfile packages. "
            f"Missing electron archives: {', '.join(missing_electron_files) or 'none'}."
        )

    print(
        "Generated flatpak-node-sources.json successfully: "
        f"{len(generated)} entries for {package_count} packages."
    )


def main() -> None:
    ensure_generator()
    generate_sources()
    validate_sources()


if __name__ == "__main__":
    main()
