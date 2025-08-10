import React from "react";
import { formatFileSize } from "@features/dictionary/lib/formatters";
import { StatusBadge } from "@/entities/DictionaryManagementSystem/ui/StatusBadge";
import { DictionaryMetadata } from "@features/dictionary/types";
import { Modal } from "@/shared/ui/Modal";

interface DictionaryDetailsModalProps {
  dictionary: DictionaryMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DictionaryDetailsModal: React.FC<DictionaryDetailsModalProps> = ({
  dictionary,
  isOpen,
  onClose,
}) => {
  if (!dictionary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dictionary Details">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{dictionary.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Language</p>
            <p className="font-medium">{dictionary.language.toUpperCase()}</p>
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
            <h3 className="text-lg font-medium mb-4">Parser Configuration</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Template</p>
                <p className="font-medium">{dictionary.parserTemplate}</p>
              </div>

              {dictionary.customParser && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Parser Name</p>
                    <p className="font-medium">
                      {dictionary.customParser.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Search Strategy</p>
                    <p className="font-medium">
                      {dictionary.customParser.searchStrategy.type}
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-gray-500">Last Test Result</p>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    dictionary.lastTestResult.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {dictionary.lastTestResult.success ? "✓ Passed" : "✗ Failed"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Query:{" "}
                  {dictionary.lastTestResult.performance.queryTime.toFixed(1)}
                  ms, Parse:{" "}
                  {dictionary.lastTestResult.performance.parseTime.toFixed(1)}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
