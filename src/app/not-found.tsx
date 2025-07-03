import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-background dark:to-muted/60 text-center px-4">
      <h1 className="text-7xl font-extrabold text-blue-600 mb-4 drop-shadow-lg">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.<br />
        If you think this is a mistake, please let us know.
      </p>
      <Link href="/">
        <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-lg">
          Go back home
        </span>
      </Link>
      <div className="mt-10 opacity-60">
        <svg width="120" height="120" fill="none" viewBox="0 0 120 120">
          <ellipse cx="60" cy="100" rx="40" ry="10" fill="#e0e7ef" />
          <circle cx="60" cy="60" r="40" fill="#f1f5f9" />
          <path d="M50 70c0-5 10-5 10 0" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="55" r="3" fill="#94a3b8" />
          <circle cx="72" cy="55" r="3" fill="#94a3b8" />
        </svg>
      </div>
    </div>
  );
} 