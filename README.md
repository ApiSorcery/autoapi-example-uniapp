# ApiSorcery - UniApp Example

This is a UniApp cross-platform application that demonstrates API integration using ApiSorcery. It can be compiled to multiple platforms including H5, WeChat Mini Program, iOS, and Android.

## Features

- ✅ User Management (CRUD operations)
- ✅ Search and Filter
- ✅ Pagination
- ✅ Form Validation
- ✅ Image Upload
- ✅ Status Management
- ✅ Type-safe API calls with ApiSorcery
- ✅ Cross-platform support

## Tech Stack

- **UniApp** - Cross-platform framework
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **Day.js** - Date formatting
- **ApiSorcery** - API code generation

## Supported Platforms

- 📱 H5 (Web)
- 📱 WeChat Mini Program
- 📱 iOS App
- 📱 Android App
- 📱 Other mini programs (Alipay, Baidu, etc.)

## Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- HBuilderX (recommended for development)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate API Client Code

```bash
npm run swagger
```

This will generate TypeScript API client code from the OpenAPI specification.

### 3. Development

#### Using HBuilderX (Recommended)

1. Open the project in HBuilderX
2. Select the platform you want to run (H5, WeChat Mini Program, etc.)
3. Click "Run" to start development

#### Using CLI

For H5 development:
```bash
npm run dev:h5
```

For WeChat Mini Program:
```bash
npm run dev:mp-weixin
```

## Available Scripts

- `npm run swagger` - Generate API client code
- `npm run api:pretty` - Format generated API code
- `npm run dev:h5` - Run H5 development server
- `npm run dev:mp-weixin` - Build for WeChat Mini Program development
- `npm run build:h5` - Build H5 for production
- `npm run build:mp-weixin` - Build WeChat Mini Program for production

## Project Structure

```
apisorcery-example-uniapp/
├── apis/
│   └── auto/              # Auto-generated API code
│       └── demo/
│           ├── ApiUser.ts # User API methods
│           ├── ApiFile.ts # File API methods
│           ├── base.ts    # Base configuration
│           └── model.ts   # Type definitions
├── pages/
│   └── user/              # User management pages
│       ├── index/         # User list page
│       └── details/       # User details page
├── static/                # Static resources
├── App.vue                # Root component
├── main.js                # Application entry
├── manifest.json          # App configuration
├── pages.json             # Page routing configuration
└── uni.scss               # Global styles
```

## API Configuration

The application uses ApiSorcery to generate type-safe API client code. Configuration is in `.apisorceryrc.json`:

```json
{
  "application": {
    "language": "ts",
    "outputDir": "./apis/auto"
  },
  "servers": [
    {
      "code": "demo",
      "token": "72735b33815c4e5c9c2a924a8f4907ef",
      "version": 3,
      "enabled": true,
      "source": "https://apisorcery.com/demo-api/swagger-json"
    }
  ]
}
```

## Page Configuration

Pages are configured in `pages.json`:

```json
{
  "pages": [
    {
      "path": "pages/user/index/index",
      "style": {
        "navigationBarTitleText": "User Management"
      }
    },
    {
      "path": "pages/user/details/details",
      "style": {
        "navigationBarTitleText": "User Details"
      }
    }
  ]
}
```

## Development

### UniApp API

UniApp provides unified APIs for different platforms:

```javascript
// Network request
uni.request({
  url: 'https://api.example.com/data',
  success: (res) => {
    console.log(res.data);
  }
});

// Navigation
uni.navigateTo({
  url: '/pages/user/details/details?id=1'
});

// Storage
uni.setStorageSync('key', 'value');
const value = uni.getStorageSync('key');
```

### Adding New Pages

1. Create page directory in `pages/`
2. Add page configuration to `pages.json`
3. Implement page logic and UI
4. Update API client if needed: `npm run swagger`

### Platform-Specific Code

Use conditional compilation for platform-specific code:

```vue
<!-- #ifdef H5 -->
<view>This is only for H5</view>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<view>This is only for WeChat Mini Program</view>
<!-- #endif -->
```

### Code Style

- Follow UniApp best practices
- Use Vue 3 Composition API when possible
- Use TypeScript for type safety
- Format code with Prettier before committing

## Building for Production

### H5
```bash
npm run build:h5
```

### WeChat Mini Program
```bash
npm run build:mp-weixin
```

The built files will be in the `unpackage/dist/` directory.

## Deployment

### H5 Deployment

Use the provided deployment script:

```bash
./deploy_prod.sh
```

### Mini Program Deployment

1. Build the project for the target platform
2. Open the built project in the corresponding developer tools
3. Upload and submit for review

## Testing

### H5 Testing
- Open in browser: http://localhost:8080
- Test responsive design
- Test API integration

### Mini Program Testing
- Use WeChat Developer Tools
- Test on real devices
- Check platform-specific features

## Troubleshooting

### Common Issues

1. **API Request Failed**
   - Check network configuration in `manifest.json`
   - Verify API base URL
   - Check CORS settings

2. **Build Failed**
   - Clear cache: Delete `unpackage` directory
   - Reinstall dependencies: `npm install`
   - Check Node version

3. **Platform-Specific Issues**
   - Check conditional compilation syntax
   - Verify platform capabilities
   - Test on real devices

## Resources

- [UniApp Documentation](https://uniapp.dcloud.io/)
- [Vue 3 Documentation](https://vuejs.org/)
- [ApiSorcery Documentation](https://apisorcery.com/)

## License

MIT
