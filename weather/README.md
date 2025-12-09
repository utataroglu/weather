# Weather

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Technologies Used
* Angular 21 - Modern frontend framework with standalone components
* TypeScript 5.9.2 - Strongly-typed JavaScript superset (target: ES2022)
* RxJS 7.8 - Reactive programming with Observables for async data handling
* Signals - Angular's new reactive primitives for state management
* ES2022 - Modern JavaScript features (ES6+)
* CSS3 - Component styling
* Vitest 4.0 - Fast unit testing framework
* Storybook 10.1 - Component development and documentation
* Compodoc - Documentation generation for Angular applications
* HTTP Client - Angular's built-in HTTP service for API calls
* Prettier - Code formatting
* Proxy Configuration - Development server proxy for API calls
* SVG Assets - Scalable vector graphics for weather icons
* NPM - Package management (v11.6.2)

Build & Development Features
* Code Splitting - Built-in with Angular's application builder
* Optimization - Production builds with bundle budgets (500kB warning, 1MB error)
* Output Hashing - Cache busting for production builds
* Source Maps - Debugging support in development mode
* Hot Module Replacement - Via Angular dev server

Architecture Patterns
* Standalone Components - Modern Angular architecture without NgModules
* Service-based Architecture - WeatherService for API integration
* Component-based UI - Reusable components (WeatherWidget, Header, Button, Page)
* TypeScript Strict Mode - Enhanced type safety and code quality
* Reactive Programming - RxJS operators (map, catchError) for data transformation
