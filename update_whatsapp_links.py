import os
import re
import urllib.parse

directories = ['content_drafts/services', 'content_drafts/resources']
wa_base = "https://wa.me/919057918251?text="

for d in directories:
    if not os.path.exists(d):
        continue
    for file in os.listdir(d):
        if file.endswith('.md'):
            filepath = os.path.join(d, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the title to use in the WhatsApp message
            title_match = re.search(r'title:\s*"(.*?)"', content)
            title = title_match.group(1).replace(" | Shambhavaa", "").strip() if title_match else "Consultation"
            
            # Some resource pages have generic titles, let's just use "Consultation" if it's a resource
            if "resources" in filepath:
                message = "Hi! I would like to book a Consultation."
            else:
                message = f"Hi! I would like to book a {title}."
                
            wa_link = wa_base + urllib.parse.quote(message)
            
            # Replace ](/contact) and ](/contact.html) with ](wa_link)
            # Make sure it only replaces the exact pattern for booking links
            new_content = re.sub(r'\]\(/contact(?:\.html)?\)', f']({wa_link})', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
