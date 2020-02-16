const routes = [
  {
    location: '/ip138.com/',
    proxyPass: 'http://ip138.com/',
    replace: {
      'http://2000019.ip138.com': '/2000019.ip138.com',
    },
  },
  {
    location: '/2000019.ip138.com',
    proxyPass: 'http://2000019.ip138.com/',
  },
  {
    location: '/ip',
    proxyPass: 'http://2000019.ip138.com/',
  },
]

export default routes
