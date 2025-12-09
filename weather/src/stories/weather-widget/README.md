# Weather Widget

A fully functional weather widget component for Angular that fetches real-time weather data from OpenWeatherMap API.

## Features

- 🌤️ Real-time weather data from OpenWeatherMap
- 📍 Geolocation support to get weather for your current location
- 🔍 Search weather by city name
- 🎨 Three beautiful themes (light, dark, gradient)
- 📏 Three size options (small, medium, large)
- 🌡️ Support for both Celsius and Fahrenheit
- 💨 Wind speed in mph or km/h
- 🔄 Refresh functionality
- ⚡ Loading and error states
- 📱 Responsive design

## Setup

### 1. Get an API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API keys section
4. Generate a new API key

### 2. Configure the API Key

Open `src/environments/environment.ts` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key:

\`\`\`typescript
export const environment = {
  weatherApi: {
    key: 'your-actual-api-key-here',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  // ...
};
\`\`\`

Or update the API key directly in the `weather.service.ts`:

\`\`\`typescript
private readonly API_KEY = 'your-actual-api-key-here';
\`\`\`

### 3. CORS Configuration

OpenWeatherMap API doesn't provide CORS headers, so you have three options:

#### Option 1: Use a CORS Proxy (Default)
The widget is configured to use `https://api.allorigins.win/raw?url=` by default. This works immediately but is not recommended for production.

#### Option 2: Use Angular Proxy (Recommended for Development)
1. Update `angular.json` to include the proxy configuration:
\`\`\`json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
\`\`\`

2. Update the `weather.service.ts` to use the proxy:
\`\`\`typescript
private readonly BASE_URL = '/api/data/2.5';
private readonly CORS_PROXY = ''; // Empty for proxy
\`\`\`

#### Option 3: Deploy Your Own CORS Proxy
1. Clone and deploy [cors-anywhere](https://github.com/Rob--W/cors-anywhere)
2. Update the CORS_PROXY URL in the service

## Usage

### Basic Usage (Mock Data)

\`\`\`typescript
import { WeatherWidgetComponent } from './stories/weather-widget/weather-widget.component';

@Component({
  template: \`
    <weather-widget 
      [weatherData]="mockData"
      [unit]="'F'"
      [theme]="'gradient'">
    </weather-widget>
  \`
})
\`\`\`

### With Real API Data

\`\`\`typescript
<weather-widget 
  [useRealData]="true"
  [enableSearch]="true"
  [initialCity]="'The Hague'"
  [unit]="'F'"
  [theme]="'dark'"
  [size]="'large'">
</weather-widget>
\`\`\`

### In Your App Component

\`\`\`typescript
import { WeatherWidgetComponent } from '../stories/weather-widget/weather-widget.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [WeatherWidgetComponent, HttpClientModule],
  template: \`
    <weather-widget 
      [useRealData]="true"
      [enableSearch]="true"
      [initialCity]="'New York'">
    </weather-widget>
  \`
})
\`\`\`

## Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `enableSearch` | boolean | false | Enable city search and geolocation |
| `useRealData` | boolean | false | Fetch real data from API |
| `initialCity` | string | 'The Hague' | Initial city to load |
| `weatherData` | WeatherData | {...} | Mock weather data (when useRealData is false) |
| `unit` | 'C' \| 'F' | 'F' | Temperature unit |
| `windUnit` | 'mph' \| 'km/h' | 'mph' | Wind speed unit |
| `theme` | 'light' \| 'dark' \| 'gradient' | 'light' | Widget theme |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Widget size |

## Storybook

View all component variations in Storybook:

\`\`\`bash
npm run storybook
\`\`\`

## API Service

The `WeatherService` provides methods to:

- `getWeatherByCity(city, units)` - Get weather by city name
- `getWeatherByCoordinates(lat, lon, units)` - Get weather by coordinates
- `getForecast(city, units)` - Get 5-day forecast
- `getCurrentPosition()` - Get user's current location

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Requires JavaScript enabled
- Geolocation requires HTTPS (except localhost)

## Notes

- Free OpenWeatherMap API tier allows 60 calls/minute
- API key takes a few hours to activate after registration
- Geolocation requires user permission
- CORS proxy may have rate limits

## License

MIT
