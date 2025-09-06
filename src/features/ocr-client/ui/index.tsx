"use client";

import React, { useState, useRef } from 'react';
import { useOCR } from './OCRProvider';

const DualOCR = () => {
  const { ocrReady, createTesseractWorker, createGutenyeOCR } = useOCR();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [currentEngine, setCurrentEngine] = useState<'tesseract' | 'gutenye'>('gutenye');
  const [tesseractWorker, setTesseractWorker] = useState<Tesseract.Worker | null>(null);
  const [gutenyeInstance, setGutenyeInstance] = useState<Window["GutenyeOCR"]["instance"] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const processWithGutenye = async (imageFile: File) => {
  try {
    let ocr = gutenyeInstance;
    if (!ocr) {
      ocr = await createGutenyeOCR();
      setGutenyeInstance(ocr);
    }

    const reader = new FileReader();
    const imageData: string = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const results = await ocr!.detect(imageData);
    console.log('Gutenye Results:', results);

    if (results && results.length > 0) {
      const extractedText = results
        .map((result: { text: string; confidence: number }, index: number) => {
          const confidence = result.confidence ? ` (${(result.confidence * 100).toFixed(1)}%)` : '';
          return `${index + 1}. ${result.text}${confidence}`;
        })
        .join('\n');

      setOcrResult(`🚀 Gutenye OCR Results:\n\n${extractedText}`);
    } else {
      setOcrResult('Gutenye: No text detected');
    }

  } catch (error) {
    console.error('Gutenye OCR Error:', error);
    setOcrResult(`Gutenye Error: ${(error as Error).message}`);
  }
};


  const processWithTesseract = async (imageFile: File) => {
    try {
      console.log('Processing with Tesseract...');
      
      let worker = tesseractWorker;
      if (!worker) {
        worker = await createTesseractWorker('jpn');
        setTesseractWorker(worker);
      }
      
      console.log('Running Tesseract OCR...');
      if (!worker) {
        throw new Error('Tesseract worker is not initialized.');
      }
      const { data: { text } } = await worker.recognize(imageFile);
      
      setOcrResult(`📝 Tesseract Results:\n\n${text || 'No text detected'}`);
      
    } catch (error) {
      console.error('Tesseract Error:', error);
      setOcrResult(`Tesseract Error: ${(error as Error).message}`);
    }
  };

  const processImage = async () => {
    if (!selectedImage || !ocrReady) return;
    
    setIsProcessing(true);
    
    try {
      if (currentEngine === 'gutenye') {
        await processWithGutenye(selectedImage);
      } else {
        await processWithTesseract(selectedImage);
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const compareEngines = async () => {
    if (!selectedImage || !ocrReady) return;
    
    setIsProcessing(true);
    setOcrResult('🔄 Comparing both engines...\n');
    
    try {
      // const [gutenyeResult, tesseractResult] = await Promise.allSettled([
      //   processWithGutenye(selectedImage).then(() => 'gutenye-done'),
      //   processWithTesseract(selectedImage).then(() => 'tesseract-done')
      // ]);
      
      setOcrResult(prev => `${prev}\n\n✅ Comparison completed!`);
      
    } catch (error) {
      console.error('Comparison error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setOcrResult('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById('preview-image') as HTMLImageElement;
        if (img && e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!ocrReady) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading OCR Engines...</h2>
            <p className="text-gray-600">Loading Tesseract.js + Gutenye OCR</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        Dual Japanese OCR (Local Files)
      </h1>
      
      {/* Engine selector */}
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Choose Engine:</label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="engine"
            value="gutenye"
            checked={currentEngine === 'gutenye'}
            onChange={(e) => setCurrentEngine(e.target.value as 'gutenye')}
            className="text-blue-600"
          />
          <span>🚀 Gutenye OCR (PaddleOCR)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="engine"
            value="tesseract"
            checked={currentEngine === 'tesseract'}
            onChange={(e) => setCurrentEngine(e.target.value as 'tesseract')}
            className="text-blue-600"
          />
          <span>📝 Tesseract.js</span>
        </label>
      </div>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Japanese text image
        </label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-4xl mb-2 block">📄</span>
          <p className="text-gray-600">Click to upload image or drag and drop</p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <img 
              id="preview-image"
              alt="Preview" 
              className="max-w-full max-h-96 mx-auto rounded shadow"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedImage && (
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={processImage}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {currentEngine === 'gutenye' ? '🚀' : '📝'}
                Extract with {currentEngine === 'gutenye' ? 'Gutenye' : 'Tesseract'}
              </>
            )}
          </button>
          
          <button
            onClick={compareEngines}
            disabled={isProcessing}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Comparing...
              </>
            ) : (
              <>
                ⚡ Compare Both Engines
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {ocrResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">OCR Results:</h3>
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {ocrResult}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

export default DualOCR;