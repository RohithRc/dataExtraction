import markdown
from bs4 import BeautifulSoup

def clean_text(text):
    # Remove emojis and other non-latin-1 characters to avoid PDF rendering issues
    return text.encode('latin-1', 'ignore').decode('latin-1').strip()

def parse_markdown_to_elements(md_content):
    # Convert MD to HTML with extensions
    # 'fenced_code' for code blocks, 'tables' for tables
    html = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
    soup = BeautifulSoup(html, 'html.parser')
    
    elements = []
    
    # Iterate through direct children to maintain order
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'table', 'ul', 'ol', 'blockquote', 'pre']):
        # Skip if parent is not main body (simple check to avoid nested duplicates if find_all is too aggressive)
        if tag.parent.name not in ['[document]', 'body', 'div']:
             # Note: simple soup.find_all(recursive=False) is better but lets just filter by tag types
             continue

        if tag.name.startswith('h'):
            level = int(tag.name[1])
            elements.append({'type': 'heading', 'level': level, 'text': clean_text(tag.get_text())})
        
        elif tag.name == 'p':
            text = clean_text(tag.get_text())
            if text:
                elements.append({'type': 'paragraph', 'text': text})
        
        elif tag.name in ['ul', 'ol']:
            items = []
            for li in tag.find_all('li', recursive=False):
                items.append(clean_text(li.get_text()))
            elements.append({
                'type': 'list', 
                'style': 'unordered' if tag.name == 'ul' else 'ordered', 
                'items': items
            })
            
        elif tag.name == 'blockquote':
            text = clean_text(tag.get_text())
            if text:
                elements.append({'type': 'blockquote', 'text': text})
                
        elif tag.name == 'pre':
            # Handle code blocks
            code = clean_text(tag.get_text())
            if code:
                elements.append({'type': 'code', 'text': code})

        elif tag.name == 'table':
            rows = []
            # Handle headers
            thead = tag.find('thead')
            if thead:
                headers = [clean_text(th.get_text()) for th in thead.find_all('th')]
                if headers:
                    rows.append(headers)
            
            # Handle rows
            tbody = tag.find('tbody')
            if tbody:
                for tr in tbody.find_all('tr'):
                    cells = [clean_text(td.get_text()) for td in tr.find_all('td')]
                    if cells:
                        rows.append(cells)
            # Fallback for simple tables without thead/tbody
            if not rows and not thead and not tbody:
                 for tr in tag.find_all('tr'):
                    header_cells = [clean_text(th.get_text()) for th in tr.find_all('th')]
                    if header_cells:
                        rows.append(header_cells)
                    else:
                        cells = [clean_text(td.get_text()) for td in tr.find_all('td')]
                        if cells:
                            rows.append(cells)

            if rows:
                elements.append({'type': 'table', 'data': rows})
                
    return elements
