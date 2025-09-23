export default function Tooltip({ content }: { content: string }) {
  return (
    <div className="relative inline-block">
      <div className="absolute bottom-full mb-2 w-12 p-2 text-sm text-white bg-black rounded-md shadow-lg">
              {content}
          </div>
    </div>
  );
}
