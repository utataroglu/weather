import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// OpenWeatherMap API Raw Response Interface
export interface OpenWeatherMapResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Transformed Weather Response (for component use)
export interface WeatherResponse {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  forecast?: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  humidity: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // Weather condition code ranges
  private readonly THUNDERSTORM_MIN = 200;
  private readonly THUNDERSTORM_MAX = 300;
  private readonly DRIZZLE_MIN = 300;
  private readonly DRIZZLE_MAX = 400;
  private readonly RAIN_MIN = 500;
  private readonly RAIN_MAX = 600;
  private readonly SNOW_MIN = 600;
  private readonly SNOW_MAX = 700;
  private readonly ATMOSPHERE_MIN = 700;
  private readonly ATMOSPHERE_MAX = 800;
  private readonly CLEAR_SKY = 800;
  private readonly FEW_CLOUDS = 801;

  // Base URLs when using proxy vs direct calls
  private readonly PROXY_BASE_URL = '/api/data/2.5';
  private readonly DEFAULT_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  private readonly apiKey = environment.weatherApi?.key?.trim() ?? '';
  private readonly useProxy = environment.useProxy === true;
  private readonly corsProxy = environment.corsProxy?.trim() ?? '';
  private readonly configuredBaseUrl = environment.weatherApi?.baseUrl?.trim() ?? this.DEFAULT_BASE_URL;

  constructor(private http: HttpClient) {}

  /**
   * Get weather data by city name
   */
  getWeatherByCity(city: string, units: 'metric' | 'imperial' = 'imperial'): Observable<WeatherResponse> {
    if (!this.isApiKeyConfigured()) {
      return throwError(() => new Error('Weather API key is not configured. Please update environment.weatherApi.key.'));
    }

    const url = this.buildApiUrl('/weather', {
      q: city,
      units,
      appid: this.apiKey
    });

    return this.http.get<OpenWeatherMapResponse>(url).pipe(
      map(data => this.transformWeatherData(data, units)),
      catchError(this.handleError)
    );
  }

  /**
   * Get weather data by coordinates
   */
  getWeatherByCoordinates(lat: number, lon: number, units: 'metric' | 'imperial' = 'imperial'): Observable<WeatherResponse> {
    if (!this.isApiKeyConfigured()) {
      return throwError(() => new Error('Weather API key is not configured. Please update environment.weatherApi.key.'));
    }

    const url = this.buildApiUrl('/weather', {
      lat,
      lon,
      units,
      appid: this.apiKey
    });

    return this.http.get<OpenWeatherMapResponse>(url).pipe(
      map(data => this.transformWeatherData(data, units)),
      catchError(this.handleError)
    );
  }

  /**
   * Get 5-day weather forecast
   */
  getForecast(city: string, units: 'metric' | 'imperial' = 'imperial'): Observable<DailyForecast[]> {
    if (!this.isApiKeyConfigured()) {
      return throwError(() => new Error('Weather API key is not configured. Please update environment.weatherApi.key.'));
    }

    const url = this.buildApiUrl('/forecast', {
      q: city,
      units,
      appid: this.apiKey
    });

    return this.http.get<any>(url).pipe(
      map(data => this.transformForecastData(data)),
      catchError(this.handleError)
    );
  }

  /**
   * Get current position using browser geolocation
   */
  getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => {
          const errorMessages: Record<number, string> = {
            [error.PERMISSION_DENIED]: 'Location permission denied',
            [error.POSITION_UNAVAILABLE]: 'Location information unavailable',
            [error.TIMEOUT]: 'Location request timed out'
          };
          reject(new Error(errorMessages[error.code] || 'Failed to get location'));
        }
      );
    });
  }

  /**
   * Transform OpenWeatherMap API response to our WeatherResponse format
   */
  private transformWeatherData(data: OpenWeatherMapResponse, units: string): WeatherResponse {
    // Validate required data exists
    if (!data || !data.main || !data.weather || !data.weather[0] || !data.wind || !data.sys) {
      throw new Error('Invalid API response structure');
    }

    return {
      location: `${data.name || 'Unknown'}${data.sys?.country ? ', ' + data.sys.country : ''}`,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      icon: this.getWeatherIcon(data.weather[0].id, data.weather[0].icon),
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility || 0,
      sunrise: data.sys.sunrise || 0,
      sunset: data.sys.sunset || 0
    };
  }

  /**
   * Transform forecast data
   */
  private transformForecastData(data: any): DailyForecast[] {
    if (!data || !Array.isArray(data.list)) {
      throw new Error('Invalid forecast API response structure');
    }

    const dailyData: { [key: string]: any[] } = {};

    // Group forecasts by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Get daily summary (first 5 days)
    return Object.entries(dailyData).slice(0, 5).map(([date, items]) => {
      const temps = items.map(item => item.main.temp);
      const mainItem = items[Math.floor(items.length / 2)]; // Use midday data

      return {
        date,
        tempMax: Math.round(Math.max(...temps)),
        tempMin: Math.round(Math.min(...temps)),
        condition: mainItem.weather[0].main,
        icon: this.getWeatherIcon(mainItem.weather[0].id, mainItem.weather[0].icon),
        humidity: mainItem.main.humidity
      };
    });
  }

  /**
   * Map OpenWeatherMap weather codes to emoji icons
   * Weather condition codes: https://openweathermap.org/weather-conditions
   */
  private getWeatherIcon(weatherId: number, iconCode: string): string {
    const isNight = iconCode.endsWith('n');

    if (weatherId >= this.THUNDERSTORM_MIN && weatherId < this.THUNDERSTORM_MAX) {
      return '⛈️';
    }

    if (weatherId >= this.DRIZZLE_MIN && weatherId < this.DRIZZLE_MAX) {
      return '🌦️';
    }

    if (weatherId >= this.RAIN_MIN && weatherId < this.RAIN_MAX) {
      return '🌧️';
    }

    if (weatherId >= this.SNOW_MIN && weatherId < this.SNOW_MAX) {
      return '❄️';
    }

    if (weatherId >= this.ATMOSPHERE_MIN && weatherId < this.ATMOSPHERE_MAX) {
      return '🌫️';
    }

    if (weatherId === this.CLEAR_SKY) {
      return isNight ? '🌙' : '☀️';
    }

    if (weatherId === this.FEW_CLOUDS) {
      return isNight ? '☁️' : '⛅';
    }

    if (weatherId > this.FEW_CLOUDS) {
      return '☁️';
    }

    return '⛅';
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred while fetching weather data';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      const statusMessages: Record<number, string> = {
        401: 'Invalid API key',
        404: 'City not found',
        429: 'API rate limit exceeded'
      };
      errorMessage = statusMessages[error.status] || `Error: ${error.message}`;
    }

    console.error('Weather API Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Build the API URL depending on proxy/cors configuration
   */
  private buildApiUrl(endpoint: string, params: Record<string, string | number>): string {
    const base = this.useProxy ? this.PROXY_BASE_URL : this.configuredBaseUrl;
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      urlParams.set(key, String(value));
    });

    const apiUrl = `${normalizedBase}${normalizedEndpoint}?${urlParams.toString()}`;

    if (this.useProxy || !this.corsProxy) {
      return apiUrl;
    }

    // When not using proxy, optionally prepend configured CORS proxy
    if (this.corsProxy.includes('{url}')) {
      return this.corsProxy.replace('{url}', encodeURIComponent(apiUrl));
    }

    const shouldEncode = this.corsProxy.endsWith('=') || this.corsProxy.includes('?url=');
    return shouldEncode
      ? `${this.corsProxy}${encodeURIComponent(apiUrl)}`
      : `${this.corsProxy}${apiUrl}`;
  }

  private isApiKeyConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'YOUR_OPENWEATHERMAP_API_KEY';
  }
}
