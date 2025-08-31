export const MobileUsageTips = () => {
  return (
    <div className="sm:hidden mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
      <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
        <span className="mr-2">💡</span>
        Mobile Tips
      </h4>
      <ul className="text-xs text-indigo-800 space-y-1.5 leading-relaxed">
        <li className="flex items-start">
          <span className="mr-2 mt-0.5">👆</span>
          <span>Tap any highlighted text to select it</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-0.5">🎯</span>
          <span>Long press for context menu with actions</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-0.5">📖</span>
          <span>Double tap for quick dictionary lookup</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-0.5">🔊</span>
          <span>Use floating action button to hear text read aloud</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2 mt-0.5">⚙️</span>
          <span>Adjust text size and visibility in settings panel</span>
        </li>
      </ul>
    </div>
  );
};
