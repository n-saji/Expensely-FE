export const metadata = {
  title: "Page Not Found | Expensely",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center z-10">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="mt-4 text-lg text-gray-900">Page Not Found</p>
        <p className="mt-2 text-sm text-gray-500">
          Hmm, it seems the page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}
