import os
import re

def read_template():
    with open('about.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract everything before the hero
    head_match = re.search(r'(.*?<header class="[^"]*hero[^"]*"[^>]*>.*?)<h1', html, re.DOTALL)
    if not head_match:
        print("Could not parse head")
        return None, None
    
    head_str = head_match.group(1)
    
    # Extract footer
    foot_match = re.search(r'(<footer class="footer">.*)', html, re.DOTALL)
    if not foot_match:
        print("Could not parse foot")
        return None, None
    
    foot_str = foot_match.group(1)
    
    return head_str, foot_str

def simple_markdown_to_html(md_text):
    html = md_text
    
    # Headers
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and Italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Lists
    # First, wrap consecutive list items in <ul>
    html = re.sub(r'(?:^- .*$\n?)+', lambda m: '<ul>\n' + m.group(0) + '</ul>\n', html, flags=re.MULTILINE)
    # Then replace '- ' with <li>
    html = re.sub(r'^- (.*)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    
    # Numbered Lists
    html = re.sub(r'(?:^\d+\. .*$\n?)+', lambda m: '<ol>\n' + m.group(0) + '</ol>\n', html, flags=re.MULTILINE)
    html = re.sub(r'^\d+\. (.*)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    
    # Paragraphs (any block of text separated by blank lines that doesn't start with a tag)
    blocks = html.split('\n\n')
    parsed_blocks = []
    for b in blocks:
        b = b.strip()
        if not b: continue
        if b.startswith('<h') or b.startswith('<ul') or b.startswith('<ol'):
            parsed_blocks.append(b)
        else:
            # It's a paragraph
            # Replace single newlines with <br> or space, let's just keep them
            parsed_blocks.append(f'<p>{b}</p>')
            
    return '\n'.join(parsed_blocks)

def process_markdown(file_path, is_resource=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract frontmatter
    title_match = re.search(r'title:\s*"(.*?)"', content)
    desc_match = re.search(r'description:\s*"(.*?)"', content)
    
    title = title_match.group(1) if title_match else ""
    desc = desc_match.group(1) if desc_match else ""
    
    # Remove frontmatter
    md_content = re.sub(r'---.*?---', '', content, flags=re.DOTALL).strip()
    
    # Fix internal links (append .html)
    # e.g., (/resources/how-vedic-kundli-reading-works) -> (/resources/how-vedic-kundli-reading-works.html)
    md_content = re.sub(r'\]\((/[^)]+?)(?<!\.html)\)', r'](\1.html)', md_content)
    
    html_content = simple_markdown_to_html(md_content)
    
    return title, desc, html_content

def build_page(file_path, head_tmpl, foot_tmpl, is_resource=False):
    title, desc, html_content = process_markdown(file_path, is_resource)
    
    # Replace title and description in head
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head_tmpl)
    head = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{desc}">', head)
    head = re.sub(r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{title}">', head)
    head = re.sub(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{desc}">', head)
    head = re.sub(r'<meta name="twitter:title" content=".*?">', f'<meta name="twitter:title" content="{title}">', head)
    head = re.sub(r'<meta name="twitter:description" content=".*?">', f'<meta name="twitter:description" content="{desc}">', head)
    
    if is_resource:
        head = head.replace('href="css/', 'href="../css/')
        head = head.replace('src="js/', 'src="../js/')
        head = head.replace('href="assets/', 'href="../assets/')
        head = head.replace('src="assets/', 'src="../assets/')
        head = head.replace('href="index.html', 'href="../index.html')
        head = head.replace('href="about.html', 'href="../about.html')
        head = head.replace('href="articles.html', 'href="../articles.html')
        
        foot_tmpl = foot_tmpl.replace('src="js/', 'src="../js/')
        foot_tmpl = foot_tmpl.replace('src="assets/', 'src="../assets/')
        foot_tmpl = foot_tmpl.replace('href="index.html', 'href="../index.html')
        foot_tmpl = foot_tmpl.replace('href="contact.html', 'href="../contact.html')
        foot_tmpl = foot_tmpl.replace('href="about.html', 'href="../about.html')
        foot_tmpl = foot_tmpl.replace('href="privacy-policy.html', 'href="../privacy-policy.html')
        foot_tmpl = foot_tmpl.replace('href="terms-and-conditions.html', 'href="../terms-and-conditions.html')
        foot_tmpl = foot_tmpl.replace('href="disclaimer.html', 'href="../disclaimer.html')
        foot_tmpl = foot_tmpl.replace('href="refund-cancellation-policy.html', 'href="../refund-cancellation-policy.html')
        foot_tmpl = foot_tmpl.replace('href="sitemap.xml', 'href="../sitemap.xml')
        
        # Consultation links
        foot_tmpl = foot_tmpl.replace('href="vedic-kundli-reading.html', 'href="../vedic-kundli-reading.html')
        foot_tmpl = foot_tmpl.replace('href="marriage-astrology-consultation.html', 'href="../marriage-astrology-consultation.html')
        foot_tmpl = foot_tmpl.replace('href="career-astrology-consultation.html', 'href="../career-astrology-consultation.html')
        foot_tmpl = foot_tmpl.replace('href="dasha-transit-reading.html', 'href="../dasha-transit-reading.html')
        foot_tmpl = foot_tmpl.replace('href="remedies-consultation.html', 'href="../remedies-consultation.html')

    # Construct hero and section
    hero = f'''
        <div class="container hero-content">
            <h1 style="font-size: 3.5rem;">{title}</h1>
        </div>
    </header>
    '''
    
    section = f'''
    <section class="section">
        <div class="container" style="max-width: 900px; margin: 0 auto; line-height: 1.8;">
            <div class="post-body">
                {html_content}
            </div>
        </div>
    </section>
    '''
    
    return head + hero + section + foot_tmpl

def main():
    head, foot = read_template()
    if not head:
        return
    
    if not os.path.exists('resources'):
        os.makedirs('resources')
        
    sitemap_urls = []
        
    directories = {
        'content_drafts/trust': False,
        'content_drafts/services': False,
        'content_drafts/resources': True
    }
    
    for d, is_resource in directories.items():
        if os.path.exists(d):
            for file in os.listdir(d):
                if file.endswith('.md'):
                    file_path = os.path.join(d, file)
                    html_name = file.replace('.md', '.html')
                    
                    if is_resource:
                        out_path = os.path.join('resources', html_name)
                        url_path = f'https://shambhavaa.com/resources/{html_name}'
                    else:
                        out_path = html_name
                        url_path = f'https://shambhavaa.com/{html_name}'
                        
                    final_html = build_page(file_path, head, foot, is_resource)
                    
                    with open(out_path, 'w', encoding='utf-8') as f:
                        f.write(final_html)
                        
                    sitemap_urls.append(url_path)
                    print(f"Generated {out_path}")

    # Append to sitemap.xml
    try:
        with open('sitemap.xml', 'r', encoding='utf-8') as f:
            sitemap_content = f.read()
            
        import datetime
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        
        new_entries = ""
        for url in sitemap_urls:
            if url not in sitemap_content:
                new_entries += f"""
  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>"""
                
        if new_entries:
            sitemap_content = sitemap_content.replace('</urlset>', new_entries + '\n</urlset>')
            with open('sitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap_content)
            print("Updated sitemap.xml")
            
    except Exception as e:
        print("Could not update sitemap:", e)

if __name__ == '__main__':
    main()
