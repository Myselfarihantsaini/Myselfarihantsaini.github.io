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
            <div class="services-grid">
                <!-- Arihant's Services -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-full-chart.webp" alt="Vedic Kundli Reading">
                    <span class="service-label">Full Chart</span>
                    <h3 class="service-title">Full Birth Chart Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Lagna, Moon, Sun, house lords, yogas, dasha, transit, and life themes.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Full Birth Chart Reading.'), 'vedic-kundli-reading.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-marriage.webp" alt="Marriage Astrology">
                    <span class="service-label">Marriage</span>
                    <h3 class="service-title">Marriage Astrology</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> 7th house, Venus, Jupiter, Darakaraka, Navamsa, dasha, transit, and compatibility.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Marriage Astrology Consultation.'), 'marriage-astrology-consultation.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-career.webp" alt="Career Astrology">
                    <span class="service-label">Career</span>
                    <h3 class="service-title">Career Astrology</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> 10th house, D10, job/business direction, promotion timing, and career change windows.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Career Astrology Consultation.'), 'career-astrology-consultation.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/cosmic_banner.png" alt="Dasha and Transit Reading">
                    <span class="service-label">Timing</span>
                    <h3 class="service-title">Dasha and Transit Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Mahadasha, Antardasha, Jupiter, Saturn, and Rahu-Ketu transit timing.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Dasha and Transit Reading.'), 'dasha-transit-reading.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-remedies.webp" alt="Astrology Remedies">
                    <span class="service-label">Remedies</span>
                    <h3 class="service-title">Remedies Consultation</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Mantra, donation, discipline, fasting, gemstones, or Rudraksha after full chart analysis.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book an Astrology Remedies Consultation.'), 'remedies-consultation.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-marriage.webp" alt="Kundli Matching">
                    <span class="service-label">Compatibility</span>
                    <h3 class="service-title">Kundli Matching</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> D1, D9, guna matching, Manglik, Rahu-Ketu, emotional compatibility, and long-term patterns.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Kundli Matching Consultation.'), 'kundli-matching-consultation.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/zodiac_wheel-640.webp" alt="Nakshatra Reading">
                    <span class="service-label">Nakshatra</span>
                    <h3 class="service-title">Nakshatra Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Janma Nakshatra, Lagna Nakshatra, nakshatra lord, pada, temperament, and dasha links.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Nakshatra Reading.'), 'nakshatra-reading.html', 'Arihant')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-remedies.webp" alt="Rahu Ketu Consultation">
                    <span class="service-label">Karmic Axis</span>
                    <h3 class="service-title">Rahu Ketu & Kaal Sarpa</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Rahu-Ketu axis, Kaal Sarpa assessment, dasha activation, transit triggers, and non-fear-based remedies.</p>
                    </div>
                    {make_actions(make_wa(arihant_wa, 'Hi! I would like to book a Rahu Ketu Consultation.'), 'rahu-ketu-kaal-sarpa-consultation.html', 'Arihant')}
                </div>
                
                <!-- Isha's Services -->
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-vastu.jpg" alt="Vastu Shastra">
                    <span class="service-label">Environment</span>
                    <h3 class="service-title">Vastu Consultation</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Harmonizing home/office energy, identifying spatial blockages, and non-destructive elemental remedies.</p>
                    </div>
                    {make_actions(make_wa(isha_wa, 'Hi! I would like to book a Vastu Shastra Consultation.'), 'vastu-consultation.html', 'Isha')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/service-full-chart.webp" alt="Manifestation">
                    <span class="service-label">Mindset</span>
                    <h3 class="service-title">Manifestation Support</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Law of Attraction guidance, clearing subconscious blockages, and energetic alignment for your goals.</p>
                    </div>
                    {make_actions(make_wa(isha_wa, 'Hi! I would like to book a Manifestation Consultation.'), 'contact.html', 'Isha')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/zodiac_wheel-640.webp" alt="Numerology">
                    <span class="service-label">Numbers</span>
                    <h3 class="service-title">Numerology Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Life path number, destiny number, name correction, and energetic compatibility with your goals.</p>
                    </div>
                    {make_actions(make_wa(isha_wa, 'Hi! I would like to book a Numerology Reading.'), 'contact.html', 'Isha')}
                </div>
                <div class="service-card">
                    <img loading="lazy" decoding="async" width="640" height="427" class="card-image-small lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" data-src="assets/cosmic_banner.png" alt="Tarot Reading">
                    <span class="service-label">Intuition</span>
                    <h3 class="service-title">Tarot Reading</h3>
                    <div class="service-details">
                        <p><strong>Focus:</strong> Immediate clarity on pressing situations, psychological guidance, and intuitive decision-making support.</p>
                    </div>
                    {make_actions(make_wa(isha_wa, 'Hi! I would like to book a Tarot Reading.'), 'tarot-reading-consultation.html', 'Isha')}
                </div>
            </div>
        </div>
    </section>"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the entire vedic-services section
new_html = re.sub(r'<section id="vedic-services" class="section services-section" style="padding-top: 20px;">.*?</section>', html_replacement, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("index.html updated successfully with middle path!")
