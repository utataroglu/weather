import type { Meta, StoryObj } from '@storybook/angular';
import { WeatherWidgetComponent, WeatherData } from './weather-widget.component';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';

const meta: Meta<WeatherWidgetComponent> = {
  title: 'Components/WeatherWidget',
  component: WeatherWidgetComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideHttpClient()],
    }),
  ],
  argTypes: {
    unit: {
      control: 'radio',
      options: ['C', 'F'],
      description: 'Temperature unit',
    },
    windUnit: {
      control: 'radio',
      options: ['mph', 'km/h'],
      description: 'Wind speed unit',
    },
    theme: {
      control: 'radio',
      options: ['light', 'dark', 'gradient'],
      description: 'Widget theme',
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
      description: 'Widget size',
    },
    enableSearch: {
      control: 'boolean',
      description: 'Enable city search and geolocation features',
    },
    useRealData: {
      control: 'boolean',
      description: 'Use real API data (requires API key setup)',
    },
    initialCity: {
      control: 'text',
      description: 'Initial city to load when using real data',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A weather widget component that displays current weather conditions. Can use mock data or fetch real data from OpenWeatherMap API. Supports search, geolocation, and multiple themes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<WeatherWidgetComponent>;

const defaultWeatherData: WeatherData = {
  location: 'The Hague',
  temperature: 5,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  icon: '⛅',
};

/**
 * Default weather widget with mock data
 */
export const Default: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Interactive widget with search functionality (mock data)
 */
export const WithSearch: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'medium',
    enableSearch: true,
    useRealData: false,
    initialCity: 'The Hague',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget with search bar enabled. Note: Real API integration requires API key setup in weather.service.ts',
      },
    },
  },
};

/**
 * Real API integration example
 * Note: Requires OpenWeatherMap API key configuration
 */
export const WithRealAPI: Story = {
  args: {
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'large',
    enableSearch: true,
    useRealData: true,
    initialCity: 'The Hague',
  },
  parameters: {
    docs: {
      description: {
        story: 'Widget fetching real weather data. Requires API key setup. See README.md for configuration instructions.',
      },
    },
  },
};

/**
 * Sunny weather condition
 */
export const Sunny: Story = {
  args: {
    weatherData: {
      location: 'Antalya',
      temperature: 35,
      condition: 'Sunny',
      humidity: 45,
      windSpeed: 8,
      icon: '☀️',
    },
    unit: 'C',
    windUnit: 'km/h',
    theme: 'light',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Rainy weather condition with dark theme
 */
export const Rainy: Story = {
  args: {
    weatherData: {
      location: 'Dublin',
      temperature: 30,
      condition: 'Rainy',
      humidity: 85,
      windSpeed: 15,
      icon: '🌧️',
    },
    unit: 'F',
    windUnit: 'mph',
    theme: 'dark',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Snowy weather condition
 */
export const Snowy: Story = {
  args: {
    weatherData: {
      location: 'Bursa',
      temperature: 15,
      condition: 'Snowy',
      humidity: 75,
      windSpeed: 20,
      icon: '❄️',
    },
    unit: 'C',
    windUnit: 'km/h',
    theme: 'light',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Cloudy weather with metric units
 */
export const Cloudy: Story = {
  args: {
    weatherData: {
      location: 'Giresun',
      temperature: 20,
      condition: 'Cloudy',
      humidity: 70,
      windSpeed: 18,
      icon: '☁️',
    },
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Stormy weather with gradient theme
 */
export const Stormy: Story = {
  args: {
    weatherData: {
      location: 'Miami',
      temperature: 78,
      condition: 'Thunderstorm',
      humidity: 90,
      windSpeed: 25,
      icon: '⛈️',
    },
    unit: 'F',
    windUnit: 'mph',
    theme: 'gradient',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Gradient theme variant
 */
export const GradientTheme: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'gradient',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'light',
    size: 'small',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'light',
    size: 'large',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Widget with metric units (Celsius and km/h)
 */
export const MetricUnits: Story = {
  args: {
    weatherData: {
      location: 'Paris',
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 60,
      windSpeed: 20,
      icon: '⛅',
    },
    unit: 'C',
    windUnit: 'km/h',
    theme: 'gradient',
    size: 'medium',
    enableSearch: false,
    useRealData: false,
  },
};

/**
 * Loading state simulation
 */
export const Loading: Story = {
  args: {
    weatherData: defaultWeatherData,
    unit: 'C',
    windUnit: 'km/h',
    theme: 'dark',
    size: 'medium',
    enableSearch: true,
    useRealData: false,
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <weather-widget
        [weatherData]="weatherData"
        [unit]="unit"
        [windUnit]="windUnit"
        [theme]="theme"
        [size]="size"
        [enableSearch]="enableSearch"
        [useRealData]="useRealData">
      </weather-widget>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the loading state when fetching weather data',
      },
    },
  },
};
