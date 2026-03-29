import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      // 静的アセット（JSバンドル・CSS）は長期キャッシュ
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 最適化済み画像も長期キャッシュ
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400' },
        ],
      },
      // ランディングページはCDNで1時間キャッシュ
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=3600' },
        ],
      },
      // 認証ページ・ユーザー固有ページはキャッシュ禁止
      {
        source: '/(dashboard|routes|activity|settings)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/(login|register|recovery|verification)',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
