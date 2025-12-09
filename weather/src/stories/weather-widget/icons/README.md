# Weather Icons

This folder is available for custom weather icons if you want to use images instead of emoji.

## Current Implementation

The weather widget currently uses emoji icons mapped from OpenWeatherMap weather condition codes:

- ☀️ Clear (day)
- 🌙 Clear (night)
- ⛅ Partly Cloudy
- ☁️ Cloudy
- 🌧️ Rain
- 🌦️ Drizzle
- ⛈️ Thunderstorm
- ❄️ Snow
- 🌫️ Fog/Mist

## Adding Custom Icons

To use custom icon images instead of emoji:

1. Add your icon files to this folder (e.g., `sunny.svg`, `rainy.png`)

2. Update the `getWeatherIcon()` method in `weather.service.ts`:

```typescript
private getWeatherIcon(weatherId: number, iconCode: string): string {
  if (weatherId >= 200 && weatherId < 300) {
    return '/assets/icons/thunderstorm.svg';
  }
  // ... etc
}
```

3. Update the component template to use `<img>` tags:

```html
<img [src]="weatherData.icon" alt="Weather icon" class="weather-icon-img">
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
