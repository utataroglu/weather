import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './services/weather.service';
import { WeatherResponse, IconType, WeatherData } from './models/weather.model';

@Component({
  selector: 'weather-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [WeatherService],
  templateUrl: './weather-widget.html',
  styleUrls: ['./weather-widget.css'],
})
export class WeatherWidgetComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);

  /** Enable search functionality */
  @Input()
  enableSearch: boolean = false;

  /** Initial city to load */
  @Input()
  initialCity: string = 'The Hague';

  /** Use real API data (if false, uses mock data) */
  @Input()
  useRealData: boolean = false;

  /** Weather data to display */
  @Input()
  weatherData: WeatherData = {
    location: 'The Hague',
    temperature: 5,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: '⛅',
  };

  /** Temperature unit (C or F) */
  @Input()
  unit: 'C' | 'F' = 'F';

  /** Wind speed unit */
  @Input()
  windUnit: 'mph' | 'km/h' = 'km/h';

  /** Theme of the widget */
  @Input()
  theme: 'light' | 'dark' | 'gradient' | 'high-contrast' = 'light';

  /** Widget size */
  @Input()
  size: 'small' | 'medium' | 'large' = 'medium';

  /** Icon type - emoji or image */
  @Input()
  iconType: IconType = 'emoji';

  /** Base path for icon images (only used when iconType is 'image') */
  @Input()
  iconBasePath: string = 'assets/';

  currentDate: string = '';
  currentDateISO: string = '';
  searchCity: string = '';
  loading: boolean = false;
  error: string = '';
  lastSearchedCity: string = '';
  lastUpdated: string = '';
  lastUpdatedISO: string = '';

  ngOnInit() {
    this.updateCurrentDate();
    this.searchCity = this.initialCity;
    this.lastSearchedCity = this.initialCity;

    // Configure icon type in service
    this.weatherService.setIconType(this.iconType, this.iconBasePath);

    // Load initial city weather if real API is enabled
    if (this.useRealData) {
      this.loadWeather(this.initialCity);
    }
  }

  /**
   * Search weather by city name
   */
  searchWeather(): void {
    if (!this.searchCity.trim()) {
      this.error = 'Please enter a city name';
      return;
    }
    this.loadWeather(this.searchCity.trim());
  }

  /**
   * Get weather for current location using geolocation
   */
  async getCurrentLocationWeather(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const coords = await this.weatherService.getCurrentPosition();
      const units = this.unit === 'C' ? 'metric' : 'imperial';

      this.weatherService.getWeatherByCoordinates(coords.latitude, coords.longitude, units)
        .subscribe({
          next: (data) => this.handleWeatherData(data),
          error: (err) => this.handleError(err)
        });
    } catch (err) {
      this.loading = false;
      this.error = err instanceof Error ? err.message : 'Unable to get your location';
    }
  }

  /**
   * Refresh current weather data
   */
  refreshWeather(): void {
    if (this.lastSearchedCity) {
      this.loadWeather(this.lastSearchedCity);
    }
  }

  /**
   * Retry after error
   */
  retry(): void {
    if (this.lastSearchedCity) {
      this.loadWeather(this.lastSearchedCity);
    } else {
      this.error = '';
    }
  }

  /**
   * Load weather data from API
   */
  private loadWeather(city: string) {
    this.loading = true;
    this.error = '';
    this.lastSearchedCity = city;

    const units = this.unit === 'C' ? 'metric' : 'imperial';

    this.weatherService.getWeatherByCity(city, units).subscribe({
      next: (data) => {
        console.log('Weather data received:', data);
        this.handleWeatherData(data);
      },
      error: (err) => {
        console.error('Weather service error:', err);
        this.handleError(err);
      },
      complete: () => {
        console.log('Weather request completed');
      }
    });
  }

  /**
   * Handle successful weather data response
   */
  private handleWeatherData(data: WeatherResponse) {
    this.weatherData = {
      location: data.location,
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      icon: data.icon
    };
    this.loading = false;
    this.error = '';
    this.updateLastUpdatedTime();
  }

  /**
   * Handle API errors
   */
  private handleError(err: any) {
    this.loading = false;

    // Log the full error for debugging
    console.error('Full error object:', err);

    // Provide specific error messages based on error type
    if (err.status === 404) {
      this.error = `City "${this.lastSearchedCity}" not found. Please check the spelling and try again.`;
    } else if (err.status === 401 || err.status === 403) {
      this.error = 'API authentication failed. Please check your API key configuration.';
    } else if (err.status === 429) {
      this.error = 'Too many requests. Please wait a moment and try again.';
    } else if (err.status >= 500) {
      this.error = 'Weather service is currently unavailable. Please try again later.';
    } else if (err.status === 0) {
      this.error = 'Network error. Please check your internet connection.';
    } else if (err.message) {
      this.error = err.message;
    } else if (err.error?.message) {
      this.error = err.error.message;
    } else {
      this.error = 'Failed to load weather data. Please try again.';
    }

    console.error('Weather widget error:', this.error);
  }

  /**
   * Update current date display
   */
  private updateCurrentDate() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.currentDateISO = now.toISOString().split('T')[0];
  }

  /**
   * Update last updated time display
   */
  private updateLastUpdatedTime() {
    const now = new Date();
    this.lastUpdated = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.lastUpdatedISO = now.toISOString();
  }

  get themeClass(): string {
    return `weather-widget--${this.theme} weather-widget--${this.size}`;
  }
}
