import { Eye } from "lucide-react";

export default function AppPreviewPlaceholder() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Eye className="w-4 h-4" />
        App Preview
      </div>

      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">
            No preview yet
          </p>
          <p className="text-xs text-gray-300">
            Your generated app will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
