
import React, { useRef } from 'react';
import { File, CheckCircle, UploadCloud } from 'lucide-react';

interface FileUploadProps {
    onFileChange: (file: File | null) => void;
    pdfName: string | null;
    disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, pdfName, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file);
    };

    return (
        <div className="mt-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
                disabled={disabled}
            />
            {pdfName ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center min-w-0">
                        <File className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">{pdfName}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 ml-2 flex-shrink-0" />
                </div>
            ) : (
                <button
                    onClick={handleFileSelect}
                    disabled={disabled}
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UploadCloud className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Click to upload PDF</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">or drag and drop</span>
                </button>
            )}
        </div>
    );
};
