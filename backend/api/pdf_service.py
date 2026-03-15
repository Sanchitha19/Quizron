import os
from pathlib import Path
from django.conf import settings
import markdown2


def generate_pdf_from_markdown(markdown_content: str, filename: str) -> str:
    """
    Convert markdown → HTML → PDF using WeasyPrint.
    Returns relative file path (for FileField).
    """
    from weasyprint import HTML, CSS

    html_content = markdown2.markdown(
        markdown_content,
        extras=['tables', 'fenced-code-blocks', 'header-ids']
    )

    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');
      body {{ font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.7;
               color: #1a1a2e; max-width: 780px; margin: 0 auto; padding: 40px 48px; }}
      h1 {{ font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a1a2e;
            border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 24px; }}
      h2 {{ font-family: 'DM Serif Display', serif; font-size: 20px; color: #3730a3;
            margin-top: 32px; margin-bottom: 12px; }}
      h3 {{ font-size: 15px; font-weight: 700; color: #1a1a2e; margin-top: 20px; }}
      p {{ margin: 0 0 12px; }}
      ul, ol {{ padding-left: 20px; margin: 0 0 12px; }}
      li {{ margin-bottom: 6px; }}
      table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }}
      th {{ background: #eef2ff; color: #3730a3; font-weight: 600;
            padding: 8px 12px; border: 1px solid #c7d2fe; text-align: left; }}
      td {{ padding: 7px 12px; border: 1px solid #e5e7eb; }}
      tr:nth-child(even) {{ background: #f9fafb; }}
      code {{ background: #f3f4f6; padding: 2px 6px; border-radius: 4px;
              font-family: monospace; font-size: 12px; }}
      pre {{ background: #1e1e2e; color: #cdd6f4; padding: 16px; border-radius: 8px;
             overflow-x: auto; font-size: 12px; }}
      strong {{ color: #1a1a2e; font-weight: 700; }}
      blockquote {{ border-left: 3px solid #3730a3; margin: 0; padding: 8px 16px;
                    background: #eef2ff; color: #4338ca; border-radius: 0 6px 6px 0; }}
      .page-break {{ page-break-before: always; }}
    </style>
    </head>
    <body>{html_content}</body>
    </html>
    """

    output_dir = Path(settings.MEDIA_ROOT) / 'cheatsheets'
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename

    HTML(string=styled_html).write_pdf(
        str(output_path),
        stylesheets=[CSS(string='@page { size: A4; margin: 0; }')]
    )

    return f'cheatsheets/{filename}'
