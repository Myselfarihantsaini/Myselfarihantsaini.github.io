import re
import urllib.parse

arihant_wa = "919057918251"
isha_wa = "917795374787"

def make_wa(phone, text):
    return f"https://wa.me/{phone}?text={urllib.parse.quote(text)}"

def make_actions(wa_link, read_more_link, name="Arihant"):
    if name == "Isha":
        primary_style = "background-color: var(--primary); color: #111; flex: 1; text-align: center; font-size: 0.9rem;"
    else:
        primary_style = "flex: 1; text-align: center; font-size: 0.9rem;"
        
    secondary_style = "flex: 1; text-align: center; background: transparent; border: 1px solid var(--primary); color: var(--primary-light); font-size: 0.9rem;"
    
    return f"""<div style="display: flex; gap: 8px; margin-top: 16px;">
                        <a href="{wa_link}" class="service-btn" target="_blank" style="{primary_style}">Book Now</a>
                        <a href="{read_more_link}" class="service-btn" style="{secondary_style}">Read More</a>
                    </div>"""

html_replacement = f"""<section id="vedic-services" class="section services-section" style="padding-top: 20px;">
        <div class="container" style="max-width: 1200px; padding: 0 24px;">
            <h2 style="font-size: 2.2rem; color: var(--text-light); text-align: center; margin-bottom: 40px; font-family: var(--font-serif);">Vedic Astrology by Arihant</h2>
            <div class="services-grid">
                <!-- 1. Career -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-career.webp" alt="Career">
                    <span class="service-label">Career</span>
                    <h3 class="service-title">Career & Govt Exams</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> UPSC/SSC timing, promotions, and business suitability.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in the Career Reading.'), 'career-astrology-consultation.html', 'Arihant')}
                </div>
                <!-- 2. Marriage -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-marriage.webp" alt="Marriage">
                    <span class="service-label">Marriage</span>
                    <h3 class="service-title">Marriage & Compatibility</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Marriage timing, partner analysis, and delay remedies.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in the Marriage Reading.'), 'marriage-astrology-consultation.html', 'Arihant')}
                </div>
                <!-- 3. Full Chart -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-full-chart.webp" alt="Full Chart">
                    <span class="service-label">Full Chart</span>
                    <h3 class="service-title">Full Birth Chart Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Complete life direction, strengths, and dasha timeline.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in a Full Reading.'), 'vedic-kundli-reading.html', 'Arihant')}
                </div>
                <!-- 4. Wealth -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-wealth.webp" alt="Wealth">
                    <span class="service-label">Wealth</span>
                    <h3 class="service-title">Wealth & Blockages</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Financial patterns, income timing, and traditional wealth-supportive remedies.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in the Wealth Reading.'), 'contact.html', 'Arihant')}
                </div>
                <!-- 5. Business -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-business.webp" alt="Business">
                    <span class="service-label">Business</span>
                    <h3 class="service-title">Business & Expansion</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Launch timing, partnership, and growth windows.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in a Business Analysis.'), 'contact.html', 'Arihant')}
                </div>
                <!-- 6. Health -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-health.webp" alt="Health">
                    <span class="service-label">Health</span>
                    <h3 class="service-title">Health & Obstacles</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Stress periods, wellness timing, and spiritual self-care indicators. This is not medical advice.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in the Health Reading.'), 'contact.html', 'Arihant')}
                </div>
                <!-- 7. Family -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-family.webp" alt="Family">
                    <span class="service-label">Family</span>
                    <h3 class="service-title">Family & Childbirth</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Childbirth timing, family harmony, and emotional clarity.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in the Family Reading.'), 'contact.html', 'Arihant')}
                </div>
                <!-- 8. Remedy Plan -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-remedies.webp" alt="Remedies">
                    <span class="service-label">Remedies</span>
                    <h3 class="service-title">Remedy Plan</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Nakshatra-based practical actions and mantra therapy.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in a Personalized Remedy Plan.'), 'remedies-consultation.html', 'Arihant')}
                </div>
                <!-- 9. Personalised Perfume -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-perfume-chart.webp" alt="Personalised Perfume as per Chart">
                    <span class="service-label">Aroma Remedy</span>
                    <h3 class="service-title">Personalised Perfume as per Chart</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Chart-based fragrance blend aligned with planetary needs.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in Personalised Perfume as per Chart.'), 'contact.html', 'Arihant')}
                </div>
                <!-- 10. BTR -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-btr.webp" alt="BTR">
                    <span class="service-label">Precision</span>
                    <h3 class="service-title">Birth Time Rectification</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Backtracking life events to find exact birth time.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I am interested in Birth Time Rectification.'), 'contact.html', 'Arihant')}
                </div>
            </div>
        </div>
    </section>"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Arihant's vedic-services section
new_html = re.sub(r'<section id="vedic-services" class="section services-section".*?</section>', html_replacement, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Arihant's grid restored to the 10 old services with dual buttons!")
