import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './weather.service';
import { WeatherResponse, IconType } from './models/weather.model';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

@Component({
  selector: 'weather-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [WeatherService],
  template: `
    <main class="weather-widget" [ngClass]="themeClass" role="application" aria-label="Weather widget">
      <!-- Search Bar -->
      <div class="weather-search" *ngIf="enableSearch" role="search">
        <label for="city-search" class="visually-hidden">Search for a city</label>
        <input
          id="city-search"
          type="text"
          [(ngModel)]="searchCity"
          (keyup.enter)="searchWeather()"
          placeholder="Enter city name..."
          class="search-input"
          aria-label="City name"
          aria-describedby="search-help"
        />
        <span id="search-help" class="visually-hidden">Press enter or click search button to get weather</span>
        <button
          (click)="searchWeather()"
          class="search-button"
          aria-label="Search weather"
          type="button">
          <span aria-hidden="true">🔍</span>
          <span class="button-text">Search</span>
        </button>
        <button
          (click)="getCurrentLocationWeather()"
          class="location-button"
          aria-label="Use my current location"
          type="button">
          <span aria-hidden="true">📍</span>
          <span class="button-text">Location</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="weather-loading" role="status" aria-live="polite" aria-busy="true">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading weather data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="weather-error" role="alert" aria-live="assertive">
        <span class="error-icon" aria-hidden="true">⚠️</span>
        <p>{{ error }}</p>
        <button (click)="retry()" class="retry-button" type="button" aria-label="Try loading weather again">
          Try Again
        </button>
      </div>

      <!-- Weather Content -->
      <div *ngIf="!loading && !error" class="weather-content" role="region" aria-live="polite" aria-label="Current weather information">
        <header class="weather-header">
          <h2 class="location" id="location-heading">{{ weatherData.location }}</h2>
          <time class="date" [attr.datetime]="currentDateISO">{{ currentDate }}</time>
        </header>

        <div class="weather-main" aria-labelledby="location-heading">
          <div class="weather-icon" aria-hidden="true">
            <span *ngIf="iconType === 'emoji'">{{ weatherData.icon }}</span>
            <img *ngIf="iconType === 'image'" [src]="weatherData.icon" [alt]="weatherData.condition + ' weather icon'" class="weather-icon-img" />
          </div>
          <div class="temperature" aria-label="Temperature: {{ weatherData.temperature }} degrees {{ unit === 'C' ? 'Celsius' : 'Fahrenheit' }}">
            {{ weatherData.temperature }}°{{ unit }}
          </div>
        </div>

        <div class="weather-condition" role="text" aria-label="Current condition">{{ weatherData.condition }}</div>

        <div class="weather-details" role="list" aria-label="Weather details">
          <div class="detail-item" role="listitem">
            <span class="detail-label" id="humidity-label">Humidity</span>
            <span class="detail-value" aria-labelledby="humidity-label" aria-label="Humidity {{ weatherData.humidity }} percent">
              {{ weatherData.humidity }}%
            </span>
          </div>
          <div class="detail-item" role="listitem">
            <span class="detail-label" id="wind-label">Wind Speed</span>
            <span class="detail-value" aria-labelledby="wind-label" aria-label="Wind speed {{ weatherData.windSpeed }} {{ windUnit }}">
              {{ weatherData.windSpeed }} {{ windUnit }}
            </span>
          </div>
        </div>

        <!-- Last Updated -->
        <div *ngIf="lastUpdated" class="last-updated" aria-live="polite">
          <small>Last updated: <time [attr.datetime]="lastUpdatedISO">{{ lastUpdated }}</time></small>
        </div>

        <!-- Refresh Button -->
        <button
          *ngIf="enableSearch"
          (click)="refreshWeather()"
          class="refresh-button"
          type="button"
          aria-label="Refresh weather data">
          <span aria-hidden="true">🔄</span>
          <span class="button-text">Refresh</span>
        </button>
      </div>
    </main>
  `,
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
