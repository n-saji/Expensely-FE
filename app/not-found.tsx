export const metadata = {
  title: "Page Not Found | Expensely",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">

      <div className="text-center z-10">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-4 text-lg text-gray-300">Page Not Found</p>
        <p className="mt-2 text-sm text-gray-400">
          Hmm, it seems the page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
