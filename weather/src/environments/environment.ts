// Environment configuration for development
export const environment = {
  production: false,

  // OpenWeatherMap API Configuration
  // Get your free API key at: https://openweathermap.org/api
  weatherApi: {
    key: '9a755e38ff059806bf283e3174fdeae7', // Replace with your API key
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },

  // CORS Proxy Configuration
  // Options:
  // 1. https://api.allorigins.win/raw?url= (free, no auth required)
  // 2. https://corsproxy.io/? (free, no auth required)
  // 3. Deploy your own: https://github.com/Rob--W/cors-anywhere
  corsProxy: 'https://api.allorigins.win/raw?url=',

  // Alternative: Use Angular proxy configuration (recommended for development)
  // See proxy.conf.json
  useProxy: false,
};
