import os
import re
import glob

base_dir = "/Users/arihantsaini/Desktop/Myselfarihantsaini.github.io-main"

def fix_index_html():
    index_path = os.path.join(base_dir, 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the start of the Navagraha section
    start_str = '    <!-- Navagraha Transits Section -->'
    start_idx = content.find(start_str)
    if start_idx != -1:
        # Find the end of the interactive chart section
        end_str = '    <!-- Interactive Transit Chart (Hidden for now)'
        end_idx_temp = content.find(end_str, start_idx)
        if end_idx_temp != -1:
            end_tag = '    -->\n'
            end_idx = content.find(end_tag, end_idx_temp)
            if end_idx != -1:
                end_pos = end_idx + len(end_tag)
                # Remove the entire block
                content = content[:start_idx] + content[end_pos:]
                print("Removed Navagraha and Transit chart sections from index.html")
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_all_html_files():
    html_files = glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True)
    
    csp_pattern = re.compile(r'(<meta http-equiv="Content-Security-Policy"[^>]*>)')
    
    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # 1. Comment out CSP
        content = csp_pattern.sub(r'<!-- TEMPORARILY REMOVE THIS DURING ADSENSE REVIEW -->\n    <!-- \1 -->', content)
        
        # 2. Replace Sham<span class="logo-accent">bhava</span>
        content = content.replace('Sham<span class="logo-accent">bhava</span>', 'Sham<span class="logo-accent">bhavaa</span>')
        
        # 3. Replace word Shambhava (if not already Shambhavaa)
        content = re.sub(r'\bShambhava\b(?!a)', 'Shambhavaa', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")

def fix_robots_txt():
    robots_path = os.path.join(base_dir, 'robots.txt')
    content = """User-agent: *
Allow: /
User-agent: Mediapartners-Google
Allow: /
User-agent: Google-Display-Ads-Bot
Allow: /
Sitemap: https://shambhavaa.com/sitemap.xml
"""
    with open(robots_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated robots.txt")

def fix_ads_txt():
    ads_path = os.path.join(base_dir, 'ads.txt')
    content = "google.com, pub-9194178610009666, DIRECT, f08c47fec0942fa0\n"
    with open(ads_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated ads.txt")

if __name__ == "__main__":
    fix_index_html()
    fix_all_html_files()
    fix_robots_txt()
    fix_ads_txt()
