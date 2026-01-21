const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Dark Mode</p>
          <p className="text-sm text-gray-500">Switch between light and dark themes</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 bg-gray-200 rounded-full p-1"
        >
          <span className={`p-2 rounded-full transition duration-200 ${darkMode ? 'bg-white text-gray-900' : 'bg-green-500 text-white'}`}>
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </span>
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('appearance')}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Appearance Settings'}
        </button>
      </div>
    </div>
  );