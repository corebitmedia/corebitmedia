/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: produces plain HTML/CSS/JS in /out that can be FTP'd
  // straight to Namecheap shared hosting (no Node server needed there).
  output: 'export',
  trailingSlash: true, // plays nicer with Apache on shared hosting (folder/index.html routing)
  images: {
    unoptimized: true // Next's image optimizer needs a server; shared hosting can't run it
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.corebitmedia.com'
  }
};

module.exports = nextConfig;
