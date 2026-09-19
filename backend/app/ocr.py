import os
from typing import List

try:
    import easyocr
except ImportError:
    easyocr = None

_reader = None


def _get_reader():
    global _reader
    if _reader is None:
        if easyocr is None:
          
            raise RuntimeError(
                "easyocr not installed; install via `pip install easyocr`"
            )
        try:
            _reader = easyocr.Reader(['en'], gpu=False)
        except Exception as e:
           
            raise RuntimeError(f"failed to initialise OCR reader: {e}")
    return _reader


def extract_text_from_image(file_path: str) -> str:
    reader = _get_reader()
    results = reader.readtext(file_path, detail=0)
    
    return '\n'.join(results)
