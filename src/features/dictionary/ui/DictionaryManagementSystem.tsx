import React, { useState } from "react";
import {
  Database,
  Upload,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Download,
  TestTube,
  Save,
} from "lucide-react";
import { useDictionaryManager } from "../hooks/useDictionaryManager";

const formatFileSize = (bytes) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const StatusBadge = ({ status }) => {
  const config = {
    active: {
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
      text: "Active",
    },
    inactive: {
      icon: AlertTriangle,
      color: "text-yellow-600 bg-yellow-100",
      text: "Inactive",
    },
    error: { icon: XCircle, color: "text-red-600 bg-red-100", text: "Error" },
  }[status];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};

const DictionaryCard = ({
  dictionary,
  onDelete,
  onStatusChange,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {dictionary.name}
          </h3>
          <p className="text-sm text-gray-500">
            Language: {dictionary.language.toUpperCase()} • Size:{" "}
            {formatFileSize(dictionary.size)}
          </p>
        </div>
        <StatusBadge status={dictionary.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm font-medium">
            {dictionary.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Template</p>
          <p className="text-sm font-medium">{dictionary.parserTemplate}</p>
        </div>
      </div>

      {dictionary.lastTestResult && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Last Test Result</p>
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                dictionary.lastTestResult.success
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dictionary.lastTestResult.success ? "✓ Passed" : "✗ Failed"}
            </span>
            <span className="text-xs text-gray-500">
              Query:{" "}
              {dictionary.lastTestResult.performance.queryTime.toFixed(1)}ms
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <select
            value={dictionary.status}
            onChange={(e) => onStatusChange(dictionary.id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(dictionary)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(dictionary.id)}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AddDictionaryModal = ({ isOpen, onClose, templates, onAdd, onTest }) => {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customConfig, setCustomConfig] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);

  const resetModal = () => {
    setStep(1);
    setSelectedFile(null);
    setSelectedTemplate("");
    setCustomConfig(null);
    setTestResult(null);
    setTesting(false);
    setAdding(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStep(2);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setStep(3);
  };

  const handleTest = async () => {
    if (!selectedFile) return;

    setTesting(true);
    try {
      const template = templates.find((t) => t.id === selectedTemplate);
      const config = customConfig || template?.config;
      const result = await onTest(selectedFile, config, ["テスト", "日本"]);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        sampleResults: [],
        errors: [error.message],
        performance: { queryTime: 0, parseTime: 0 },
      });
    } finally {
      setTesting(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedFile || !testResult?.success) return;

    setAdding(true);
    try {
      await onAdd(selectedFile, selectedTemplate, customConfig);
      resetModal();
      onClose();
    } catch (error) {
      console.error("Failed to add dictionary:", error);
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Dictionary</h2>
            <button
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-0.5 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Dictionary File</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Choose SQLite dictionary file
                </p>
                <input
                  type="file"
                  accept=".sqlite,.db"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="dictionary-file"
                />
                <label
                  htmlFor="dictionary-file"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Choose Parser Template</h3>
              <p className="text-sm text-gray-600">
                Selected file:{" "}
                <span className="font-medium">{selectedFile?.name}</span>
              </p>

              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          {template.description}
                        </p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded mt-2">
                          {template.language.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-blue-600">
                        <Settings className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => handleTemplateSelect("custom")}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Custom Parser</h4>
                      <p className="text-sm text-gray-600">
                        Configure your own parsing rules
                      </p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded mt-2">
                        CUSTOM
                      </span>
                    </div>
                    <div className="text-blue-600">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Test & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  Test Parser Configuration
                </h3>
                <p className="text-sm text-gray-600">
                  Template:{" "}
                  <span className="font-medium">
                    {templates.find((t) => t.id === selectedTemplate)?.name ||
                      "Custom"}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Parser Test</h4>
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    {testing ? "Testing..." : "Test"}
                  </button>
                </div>

                {testResult && (
                  <div className="space-y-3">
                    <div
                      className={`flex items-center text-sm ${
                        testResult.success ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {testResult.success ? "Test Passed" : "Test Failed"}
                    </div>

                    {testResult.errors.length > 0 && (
                      <div className="text-sm text-red-600">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {testResult.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.sampleResults.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sample Results:
                        </p>
                        <div className="space-y-2">
                          {testResult.sampleResults.map((result, i) => (
                            <div
                              key={i}
                              className="bg-white p-3 rounded border text-sm"
                            >
                              <div className="font-medium">
                                {result.word} ({result.reading})
                              </div>
                              <div className="text-gray-600">
                                {result.meanings.join(", ")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Performance: Query{" "}
                      {testResult.performance.queryTime.toFixed(1)}ms, Parse{" "}
                      {testResult.performance.parseTime.toFixed(1)}ms
                    </div>
                  </div>
                )}
              </div>

              {testResult?.success && (
                <div className="flex justify-end">
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {adding ? "Adding..." : "Add Dictionary"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DictionaryDetailsModal = ({ dictionary, isOpen, onClose }) => {
  if (!isOpen || !dictionary) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Dictionary Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{dictionary.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium">
                  {dictionary.language.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">{formatFileSize(dictionary.size)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={dictionary.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {dictionary.createdAt.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated</p>
                <p className="font-medium">
                  {dictionary.updatedAt.toLocaleString()}
                </p>
              </div>
            </div>

            {dictionary.lastTestResult && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Last Test Result</h3>
                <div className="space-y-4">
                  <div
                    className={`flex items-center text-sm ${
                      dictionary.lastTestResult.success
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dictionary.lastTestResult.success ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {dictionary.lastTestResult.success
                      ? "Test Passed"
                      : "Test Failed"}
                  </div>

                  {dictionary.lastTestResult.sampleResults.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Sample Results:
                      </p>
                      <div className="space-y-2">
                        {dictionary.lastTestResult.sampleResults.map(
                          (result, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 p-3 rounded border text-sm"
                            >
                              <div className="font-medium">
                                {result.word} ({result.reading})
                              </div>
                              <div className="text-gray-600">
                                {result.meanings.join(", ")}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Type: {result.type}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>
                      Query Time:{" "}
                      {dictionary.lastTestResult.performance.queryTime.toFixed(
                        1
                      )}
                      ms
                    </p>
                    <p>
                      Parse Time:{" "}
                      {dictionary.lastTestResult.performance.parseTime.toFixed(
                        1
                      )}
                      ms
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DictionaryManagementSystem = () => {
  const {
    dictionaries,
    templates,
    loading,
    totalSize,
    addDictionary,
    deleteDictionary,
    updateDictionaryStatus,
    testParser,
  } = useDictionaryManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDictionary, setSelectedDictionary] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dictionary?")) {
      await deleteDictionary(id);
    }
  };

  const handleViewDetails = (dictionary) => {
    setSelectedDictionary(dictionary);
    setShowDetailsModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dictionary Management
          </h1>
          <p className="text-gray-600">
            {dictionaries.length} dictionaries • {formatFileSize(totalSize)}{" "}
            total
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dictionary
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{dictionaries.length}</p>
              <p className="text-sm text-gray-600">Total Dictionaries</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {dictionaries.filter((d) => d.status === "active").length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {dictionaries.filter((d) => d.status === "inactive").length}
              </p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Download className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-gray-600">Storage Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dictionary Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dictionaries...</p>
        </div>
      ) : dictionaries.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No dictionaries yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first dictionary.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Dictionary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dictionaries.map((dictionary) => (
            <DictionaryCard
              key={dictionary.id}
              dictionary={dictionary}
              onDelete={handleDelete}
              onStatusChange={updateDictionaryStatus}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddDictionaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        templates={templates}
        onAdd={addDictionary}
        onTest={testParser}
      />

      <DictionaryDetailsModal
        dictionary={selectedDictionary}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};
