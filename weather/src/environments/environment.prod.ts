// Environment configuration for production
export const environment = {
  production: true,

  // OpenWeatherMap API Configuration
  weatherApi: {
    key: '9a755e38ff059806bf283e3174fdeae7', // Replace with your API key
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },

  // For production, consider setting up a backend proxy
  // to hide your API key and avoid CORS issues
  corsProxy: 'https://api.allorigins.win/raw?url=',

  useProxy: false,
};
