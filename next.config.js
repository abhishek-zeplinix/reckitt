module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://codelabspace.com/api/:path*',
        },
      ];
    },
  };
  