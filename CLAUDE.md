# Claude Code Instructions - Ostermayer Jagd AG

## Google Gemini Image Generation API

### API Key
```
# Store your API key in environment variable GEMINI_API_KEY
# Never commit API keys to version control
```

### Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={API_KEY}
```

### Model
```
gemini-2.5-flash-image
```

### Request Format

**HTTP Method:** POST
**Content-Type:** application/json
**Timeout:** 120 seconds

**Payload Structure:**
```json
{
    "contents": [{
        "parts": [{
            "text": "Your image generation prompt here"
        }]
    }],
    "generationConfig": {
        "responseModalities": ["IMAGE", "TEXT"]
    }
}
```

**IMPORTANT:** The `responseModalities` parameter with `["IMAGE", "TEXT"]` is required to get image output. Without it, the model returns text only.

### Response Handling

The response contains the image in base64 format:

```python
import os

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if response.status_code == 200:
    result = response.json()
    if 'candidates' in result:
        for candidate in result['candidates']:
            if 'content' in candidate and 'parts' in candidate['content']:
                for part in candidate['content']['parts']:
                    if 'inlineData' in part and 'data' in part['inlineData']:
                        image_data = part['inlineData']['data']
                        image_bytes = base64.b64decode(image_data)
                        # Save to file
```

### Rate Limiting

- Wait 4 seconds between requests to avoid rate limiting
- Implement retry logic (3 attempts) with 3-second delays between retries

### Prompt Best Practices

For premium brand imagery, enhance prompts with:
```
Style requirements:
- Ultra premium, luxury brand aesthetic
- Professional commercial photography quality
- Rich, warm colors with forest green and gold accents
- Sophisticated and elegant composition
- No text or watermarks on the image
- 4K quality, sharp details
- Evokes tradition, trust, and premium quality
```

## Project Structure

- `index.html` - Main presentation file (GitHub Pages)
- `master_concept_images/` - Generated images directory

## Generated Images

All images in `master_concept_images/` were generated using the Gemini API:

### Original Images
- `hero_alpine_hunter.png` - Hunter in Alpine landscape
- `digital_ecosystem.png` - Futuristic hunting app visualization
- `community_gathering.png` - Hunters at lodge fireplace
- `premium_oils_product.png` - Weapon care product photography
- `serbia_quail_hunt.png` - Quail hunting scene
- `app_interface_mockup.png` - iPhone app mockup
- `ai_development.png` - AI neural network visualization
- `international_events.png` - Multi-destination collage

### Vision & Section Images
- `vision_hunting_scene.png` - Red deer stag in Alpine meadow

### Market & Pillars Images
- `market_european_hunter.png` - European hunter in traditional Loden
- `pillars_digital_platform.png` - Smartphone with hunting app
- `pillars_premium_events.png` - Luxury hunting lodge interior
- `pillars_community.png` - Group of hunters with dogs

### Destination Images
- `events_hero_hunting.png` - Mountain landscape at golden hour
- `destination_scotland.png` - Scottish Highlands moorland
- `destination_austria.png` - Alpine chamois on mountain peak
- `destination_finland.png` - Finnish winter forest
- `destination_serbia.png` - Serbian wheat fields at sunset
