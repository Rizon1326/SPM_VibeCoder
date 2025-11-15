"""
code_utils.py - Code extraction and sanitization utilities
"""
import re
import os

def extract_code_block(text: str, language: str = "python") -> str:
    """
    Extract code from markdown code blocks.
    Tries multiple patterns:
    1. ```language ... ```
    2. ``` ... ```
    3. Returns original text if no blocks found
    """
    # Try to extract code from markdown block with language
    pattern = rf"```{language}\s*\n(.*?)```"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    # Try generic markdown block
    pattern = r"```\s*\n(.*?)```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # No markdown block found - return original
    return text.strip()

def is_code_like(text: str) -> bool:
    """
    Heuristic check if text looks like code.
    Checks for common programming constructs.
    """
    if not text or len(text.strip()) < 10:
        return False
    
    # Common code patterns
    code_patterns = [
        r'\bdef\s+\w+\s*\(',  # Python function
        r'\bclass\s+\w+',     # Class definition
        r'\bimport\s+\w+',    # Import statement
        r'\bfrom\s+\w+\s+import',  # From import
        r'\bif\s+.*:',        # If statement
        r'\bfor\s+.*:',       # For loop
        r'\bwhile\s+.*:',     # While loop
        r'\breturn\s+',       # Return statement
        r'[{}\[\]]',          # Braces/brackets
        r'[;]$',              # Semicolon at end (C++, Java, etc.)
    ]
    
    for pattern in code_patterns:
        if re.search(pattern, text, re.MULTILINE):
            return True
    
    return False

def sanitize_filename(name: str) -> str:
    """
    Sanitize filename for safe file download.
    - Remove dangerous characters
    - Prevent path traversal
    - Ensure proper extension
    """
    # Remove path separators and dangerous chars
    name = re.sub(r'[/\\:*?"<>|]', '_', name)
    
    # Remove leading/trailing whitespace and dots
    name = name.strip('. ')
    
    # Ensure it's not empty
    if not name:
        name = "generated_code"
    
    # Ensure it has an extension
    if '.' not in name:
        name += ".py"
    
    # Limit length
    if len(name) > 100:
        ext = os.path.splitext(name)[1]
        name = name[:100-len(ext)] + ext
    
    return name
