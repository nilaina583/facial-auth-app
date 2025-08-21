/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuration spécifique pour face-api.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
      }
      
      // Ignorer les warnings spécifiques
      config.ignoreWarnings = [
        { module: /node_modules\/tfjs-image-recognition-base/ },
        { file: /node_modules\/tfjs-image-recognition-base/ },
      ]
    }
    
    return config
  }
}

module.exports = nextConfig