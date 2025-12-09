import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { WeatherWidgetComponent } from './weather-widget.component';
import { WeatherService } from './services/weather.service';
import { WeatherResponse } from './models/weather.model';

describe('WeatherWidgetComponent', () => {
  let component: WeatherWidgetComponent;
  let fixture: ComponentFixture<WeatherWidgetComponent>;
  let weatherService: any;

  const mockWeatherResponse: WeatherResponse = {
    location: 'London',
    temperature: 20,
    condition: 'Clear',
    description: 'clear sky',
    humidity: 50,
    windSpeed: 10,
    icon: '☀️',
    feelsLike: 19,
    pressure: 1013,
    visibility: 10000,
    sunrise: Date.now(),
    sunset: Date.now(),
  };

  beforeEach(async () => {
    const weatherServiceSpy = {
      getWeatherByCity: vi.fn(),
      getWeatherByCoordinates: vi.fn(),
      getCurrentPosition: vi.fn(),
      setIconType: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WeatherService, useValue: weatherServiceSpy },
      ],
    }).overrideComponent(WeatherWidgetComponent, {
      remove: { providers: [WeatherService] },
    }).compileComponents();

    weatherService = TestBed.inject(WeatherService);
    fixture = TestBed.createComponent(WeatherWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with default values', () => {
      weatherService.setIconType.mockReturnValue(undefined);

      fixture.detectChanges();

      expect(component.searchCity).toBe('The Hague');
      expect(component.lastSearchedCity).toBe('The Hague');
      expect(component.currentDate).toBeTruthy();
      expect(component.currentDateISO).toBeTruthy();
      expect(weatherService.setIconType).toHaveBeenCalledWith('emoji', 'assets/');
    });

    it('should load weather if useRealData is true', () => {
      component.useRealData = true;
      weatherService.setIconType.mockReturnValue(undefined);
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));

      fixture.detectChanges();

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('The Hague', 'imperial');
    });

    it('should not load weather if useRealData is false', () => {
      component.useRealData = false;
      weatherService.setIconType.mockReturnValue(undefined);

      fixture.detectChanges();

      expect(weatherService.getWeatherByCity).not.toHaveBeenCalled();
    });
  });

  describe('searchWeather', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should show error if search city is empty', () => {
      component.searchCity = '';
      component.searchWeather();

      expect(component.error).toBe('Please enter a city name');
    });

    it('should show error if search city is only whitespace', () => {
      component.searchCity = '   ';
      component.searchWeather();

      expect(component.error).toBe('Please enter a city name');
    });

    it('should load weather data when city is provided', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.searchCity = 'Paris';

      component.searchWeather();

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Paris', 'imperial');
    });

    it('should trim whitespace from city name', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.searchCity = '  New York  ';

      component.searchWeather();

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('New York', 'imperial');
    });
  });

  describe('getCurrentLocationWeather', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should get weather by coordinates', async () => {
      const mockCoords = { latitude: 51.5074, longitude: -0.1278 };
      weatherService.getCurrentPosition.mockReturnValue(Promise.resolve(mockCoords));
      weatherService.getWeatherByCoordinates.mockReturnValue(of(mockWeatherResponse));

      await component.getCurrentLocationWeather();

      expect(weatherService.getCurrentPosition).toHaveBeenCalled();
      expect(weatherService.getWeatherByCoordinates).toHaveBeenCalledWith(
        mockCoords.latitude,
        mockCoords.longitude,
        'imperial'
      );
    });

    it('should handle geolocation error', async () => {
      weatherService.getCurrentPosition.mockReturnValue(
        Promise.reject(new Error('Geolocation is not supported by your browser'))
      );

      await component.getCurrentLocationWeather();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Geolocation is not supported by your browser');
    });

    it('should use metric units when unit is C', async () => {
      component.unit = 'C';
      const mockCoords = { latitude: 51.5074, longitude: -0.1278 };
      weatherService.getCurrentPosition.mockReturnValue(Promise.resolve(mockCoords));
      weatherService.getWeatherByCoordinates.mockReturnValue(of(mockWeatherResponse));

      await component.getCurrentLocationWeather();

      expect(weatherService.getWeatherByCoordinates).toHaveBeenCalledWith(
        mockCoords.latitude,
        mockCoords.longitude,
        'metric'
      );
    });
  });

  describe('refreshWeather', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should reload weather for last searched city', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.lastSearchedCity = 'Berlin';

      component.refreshWeather();

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Berlin', 'imperial');
    });

    it('should not call service if no city was searched', () => {
      component.lastSearchedCity = '';

      component.refreshWeather();

      expect(weatherService.getWeatherByCity).not.toHaveBeenCalled();
    });
  });

  describe('retry', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should reload weather for last searched city', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.lastSearchedCity = 'Rome';
      component.error = 'Some error';

      component.retry();

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Rome', 'imperial');
    });

    it('should clear error if no city was searched', () => {
      component.lastSearchedCity = '';
      component.error = 'Some error';

      component.retry();

      expect(component.error).toBe('');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should handle 404 error', () => {
      const error = { status: 404 };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'InvalidCity';

      component.searchWeather();

      expect(component.loading).toBe(false);
      expect(component.error).toContain('City "InvalidCity" not found');
    });

    it('should handle 401 error', () => {
      const error = { status: 401 };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.error).toBe('API authentication failed. Please check your API key configuration.');
    });

    it('should handle 429 error', () => {
      const error = { status: 429 };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.error).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should handle 500 error', () => {
      const error = { status: 500 };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.error).toBe('Weather service is currently unavailable. Please try again later.');
    });

    it('should handle network error', () => {
      const error = { status: 0 };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.error).toBe('Network error. Please check your internet connection.');
    });

    it('should handle error with message', () => {
      const error = { message: 'Custom error message' };
      weatherService.getWeatherByCity.mockReturnValue(throwError(() => error));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.error).toBe('Custom error message');
    });
  });

  describe('themeClass', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should return correct class for light theme and medium size', () => {
      component.theme = 'light';
      component.size = 'medium';

      expect(component.themeClass).toBe('weather-widget--light weather-widget--medium');
    });

    it('should return correct class for dark theme and large size', () => {
      component.theme = 'dark';
      component.size = 'large';

      expect(component.themeClass).toBe('weather-widget--dark weather-widget--large');
    });

    it('should return correct class for gradient theme and small size', () => {
      component.theme = 'gradient';
      component.size = 'small';

      expect(component.themeClass).toBe('weather-widget--gradient weather-widget--small');
    });
  });

  describe('weather data updates', () => {
    beforeEach(() => {
      weatherService.setIconType.mockReturnValue(undefined);
      fixture.detectChanges();
    });

    it('should update weather data on successful response', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.weatherData.location).toBe('London');
      expect(component.weatherData.temperature).toBe(20);
      expect(component.weatherData.condition).toBe('Clear');
      expect(component.weatherData.humidity).toBe(50);
      expect(component.weatherData.windSpeed).toBe(10);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });

    it('should update last updated time', () => {
      weatherService.getWeatherByCity.mockReturnValue(of(mockWeatherResponse));
      component.searchCity = 'London';

      component.searchWeather();

      expect(component.lastUpdated).toBeTruthy();
      expect(component.lastUpdatedISO).toBeTruthy();
    });
  });

  describe('input properties', () => {
    it('should accept enableSearch input', () => {
      component.enableSearch = true;
      expect(component.enableSearch).toBe(true);
    });

    it('should accept initialCity input', () => {
      component.initialCity = 'Amsterdam';
      expect(component.initialCity).toBe('Amsterdam');
    });

    it('should accept unit input', () => {
      component.unit = 'C';
      expect(component.unit).toBe('C');
    });

    it('should accept windUnit input', () => {
      component.windUnit = 'mph';
      expect(component.windUnit).toBe('mph');
    });

    it('should accept iconType input', () => {
      component.iconType = 'image';
      expect(component.iconType).toBe('image');
    });
  });
});
