import os
import tempfile
from datetime import datetime
from typing import Dict, List, Any, Optional
import pdfkit
from jinja2 import Environment, FileSystemLoader

template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(template_dir))

def generate_pdf_report(
    url: str,
    product_names: List[str],
    category_links: List[str],
    prices: List[str],
    advice: str,
    competitor_summary: Optional[str] = None,
    social_links: Optional[Dict[str, str]] = None,
    diagnostic_scores: Optional[Dict[str, float]] = None
) -> bytes:
    """
    HTMLテンプレートからPDFレポートを生成する
    """
    try:
        template = env.get_template("report_template.html")
        
        products = []
        for i, name in enumerate(product_names):
            product = {"name": name}
            if i < len(prices):
                product["price"] = prices[i]
            products.append(product)
        
        categories = category_links
        
        scores = {
            "sns_score": 5.0,
            "structure_score": 5.0,
            "ux_score": 5.0,
            "app_score": 5.0,
            "theme_score": 5.0
        }
        
        if diagnostic_scores:
            scores.update(diagnostic_scores)
        
        now = datetime.now()
        date_str = now.strftime("%Y年%m月%d日 %H:%M")
        
        html_content = template.render(
            url=url,
            date=date_str,
            year=now.year,
            products=products,
            categories=categories,
            advice=advice,
            competitor_summary=competitor_summary,
            social_links=social_links,
            scores=scores
        )
        
        pdf = pdfkit.from_string(html_content, False)
        
        return pdf
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        raise e
