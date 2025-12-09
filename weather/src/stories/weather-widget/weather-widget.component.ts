import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService, WeatherResponse } from './weather.service';

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
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [WeatherService],
  template: `
    <div class="weather-widget" [ngClass]="themeClass">
      <!-- Search Bar -->
      <div class="weather-search" *ngIf="enableSearch">
        <input
          type="text"
          [(ngModel)]="searchCity"
          (keyup.enter)="searchWeather()"
          placeholder="Enter city name..."
          class="search-input"
        />
        <button (click)="searchWeather()" class="search-button">🔍</button>
        <button (click)="getCurrentLocationWeather()" class="location-button" title="Use my location">📍</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="weather-loading">
        <div class="spinner"></div>
        <p>Loading weather data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="weather-error">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button (click)="retry()" class="retry-button">Try Again</button>
      </div>

      <!-- Weather Content -->
      <div *ngIf="!loading && !error" class="weather-content">
        <div class="weather-header">
          <h2 class="location">{{ weatherData.location }}</h2>
          <span class="date">{{ currentDate }}</span>
        </div>

        <div class="weather-main">
          <div class="weather-icon">{{ weatherData.icon }}</div>
          <div class="temperature">{{ weatherData.temperature }}°{{ unit }}</div>
        </div>

        <div class="weather-condition">{{ weatherData.condition }}</div>

        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">{{ weatherData.humidity }}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Wind Speed</span>
            <span class="detail-value">{{ weatherData.windSpeed }} {{ windUnit }}</span>
          </div>
        </div>

        <!-- Refresh Button -->
        <button *ngIf="enableSearch" (click)="refreshWeather()" class="refresh-button" title="Refresh">
          🔄
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./weather-widget.css'],
})
export class WeatherWidgetComponent implements OnInit {
  private weatherService = inject(WeatherService);

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
  theme: 'light' | 'dark' | 'gradient' = 'light';

  /** Widget size */
  @Input()
  size: 'small' | 'medium' | 'large' = 'medium';

  currentDate: string = '';
  searchCity: string = '';
  loading: boolean = false;
  error: string = '';
  lastSearchedCity: string = '';

  ngOnInit() {
    this.updateCurrentDate();
    this.searchCity = this.initialCity;
    this.lastSearchedCity = this.initialCity;

    // Load weather data if real API is enabled
    if (this.useRealData && this.enableSearch) {
      this.loadWeather(this.initialCity);
    }
  }

  /**
   * Search weather by city name
   */
  searchWeather() {
    if (!this.searchCity.trim()) {
      this.error = 'Please enter a city name';
      return;
    }
    this.loadWeather(this.searchCity.trim());
  }

  /**
   * Get weather for current location using geolocation
   */
  async getCurrentLocationWeather() {
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
    } catch (err: any) {
      this.loading = false;
      this.error = err.message || 'Unable to get your location';
    }
  }

  /**
   * Refresh current weather data
   */
  refreshWeather() {
    if (this.lastSearchedCity) {
      this.loadWeather(this.lastSearchedCity);
    }
  }

  /**
   * Retry after error
   */
  retry() {
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
      next: (data) => this.handleWeatherData(data),
      error: (err) => this.handleError(err)
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
  }

  /**
   * Handle API errors
   */
  private handleError(err: any) {
    this.loading = false;
    this.error = err.message || 'Failed to load weather data';
    console.error('Weather widget error:', err);
  }

  /**
   * Update current date display
   */
  private updateCurrentDate() {
    this.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get themeClass(): string {
    return `weather-widget--${this.theme} weather-widget--${this.size}`;
  }
}
