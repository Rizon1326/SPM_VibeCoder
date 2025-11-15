"""
codebleu_utils.py - CodeBLEU metric calculation for code verification
"""
from typing import Dict, Any

def normalize_code(code: str) -> str:
    """
    Normalize code formatting using Black (Python) or basic normalization.
    Falls back to original code if Black is not available.
    """
    try:
        import black
        mode = black.Mode(line_length=88)
        return black.format_str(code, mode=mode)
    except ImportError:
        # Black not installed - return original
        return code
    except Exception:
        # Formatting failed (syntax error, etc.) - return original
        return code

def calculate_codebleu(
    reference: str,
    candidate: str,
    language: str = "python",
    normalize: bool = True
) -> Dict[str, Any]:
    """
    Calculate CodeBLEU score between reference and candidate code.
    
    CodeBLEU measures code similarity using:
    - N-gram match: Token-level similarity
    - Weighted N-gram match: Keyword-weighted similarity
    - Syntax match: AST structure similarity
    - Dataflow match: Program behavior similarity
    
    Returns dict with:
    - available: bool (whether CodeBLEU is available)
    - score: float (overall score 0-1)
    - ngram_match: float
    - weighted_ngram_match: float
    - syntax_match: float
    - dataflow_match: float
    - error: str (if any)
    """
    try:
        from codebleu import calc_codebleu
    except ImportError:
        return {
            "available": False,
            "error": "CodeBLEU library not installed. Run: pip install codebleu"
        }
    
    try:
        # Normalize code if requested
        if normalize and language.lower() == "python":
            reference = normalize_code(reference)
            candidate = normalize_code(candidate)
        
        # Calculate CodeBLEU
        result = calc_codebleu(
            references=[reference],
            predictions=[candidate],
            lang=language.lower(),
            weights=(0.25, 0.25, 0.25, 0.25)  # Equal weights for all components
        )
        
        return {
            "available": True,
            "score": result.get("codebleu", 0.0),
            "ngram_match": result.get("ngram_match_score", 0.0),
            "weighted_ngram_match": result.get("weighted_ngram_match_score", 0.0),
            "syntax_match": result.get("syntax_match_score", 0.0),
            "dataflow_match": result.get("dataflow_match_score", 0.0)
        }
    
    except Exception as e:
        return {
            "available": False,
            "error": f"CodeBLEU calculation failed: {str(e)}"
        }
