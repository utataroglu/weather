# Weather Icons

The weather widget now supports both **emoji icons** and **custom image icons** (SVG/PNG).

## Icon Types

### 1. Emoji Icons (Default)
The widget uses emoji icons by default:
- ☀️ Clear (day)
- 🌙 Clear (night)
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧️ Rain
- 🌦️ Drizzle
- ⛈️ Thunderstorm
- ❄️ Snow
- 🌫️ Fog/Mist

### 2. Custom Image Icons
You can use custom SVG or PNG icons stored in the assets folder.

## Usage

### Using Emoji Icons (Default)
```html
<weather-widget
  [iconType]="'emoji'"
  [useRealData]="true"
  [enableSearch]="true">
</weather-widget>
```

### Using Custom Image Icons
```html
<weather-widget
  [iconType]="'image'"
  [iconBasePath]="'assets/'"
  [useRealData]="true"
  [enableSearch]="true">
</weather-widget>
```

### Available Icon Images
The following SVG icons are available in `public/assets/` (copied from `/src/stories/assets/`):
- `Sun.svg` - Clear day
- `Moon.svg` - Clear night
- `Cloud-Sun.svg` - Partly cloudy (day)
- `Cloud-Moon.svg` - Partly cloudy (night)
- `Cloud.svg` - Cloudy
- `Cloud-Drizzle.svg` - Rain/Drizzle
- `Cloud-Hail.svg` - Thunderstorm
- `Cloud-Snow-Alt.svg` - Snow
- `Cloud-Fog.svg` - Fog/Mist
- `Wind.svg` - Windy

## Icon Mapping

The `WeatherService` automatically maps OpenWeatherMap weather condition codes to the appropriate icons based on the `iconType` setting:

| Condition | Weather ID | Emoji | Image File |
|-----------|-----------|-------|------------|
| Thunderstorm | 200-299 | ⛈️ | Cloud-Hail.svg |
| Drizzle | 300-399 | 🌦️ | Cloud-Drizzle.svg |
| Rain | 500-599 | 🌧️ | Cloud-Drizzle.svg |
| Snow | 600-699 | ❄️ | Cloud-Snow-Alt.svg |
| Atmosphere | 700-799 | 🌫️ | Cloud-Fog.svg |
| Clear (day) | 800 | ☀️ | Sun.svg |
| Clear (night) | 800 | 🌙 | Moon.svg |
| Few clouds (day) | 801 | ⛅ | Cloud-Sun.svg |
| Few clouds (night) | 801 | ☁️ | Cloud-Moon.svg |
| Clouds | 802-804 | ☁️ | Cloud.svg |

## Programmatic Configuration

You can also configure icon type programmatically via the `WeatherService`:

```typescript
import { WeatherService } from './weather.service';

constructor(private weatherService: WeatherService) {
  // Use image icons
  this.weatherService.setIconType('image', 'assets/');
  
  // Or use emoji icons
  this.weatherService.setIconType('emoji');
}
```

## Icon Resources

Free weather icon sets:
- [Weather Icons](https://erikflowers.github.io/weather-icons/)
- [Feather Icons](https://feathericons.com/)
- [Font Awesome Weather](https://fontawesome.com/icons?d=gallery&c=weather)
- [OpenWeatherMap Icons](https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2)

## OpenWeatherMap Icon Codes

You can also use OpenWeatherMap's built-in icons:

```typescript
private getWeatherIcon(weatherId: number, iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
```

Icon codes: 01d, 01n, 02d, 02n, 03d, 04d, 09d, 10d, 11d, 13d, 50d
(d = day, n = night)
