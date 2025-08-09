import React, { useRef, useEffect, useState } from 'react';
import { Upload, Pen, Eraser, Download, RotateCcw, Move, Palette, Printer } from 'lucide-react';

const ImageAnnotationCanvas = ({ onImageChange }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#01D48C');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to A4 proportions (portrait)
      const canvasWidth = 600;
      const canvasHeight = 800;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Clear and set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Calculate image dimensions to fit in canvas while maintaining aspect ratio
      const imgAspectRatio = uploadedImage.width / uploadedImage.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas ratio
        drawWidth = canvasWidth * 0.9; // 90% of canvas width
        drawHeight = drawWidth / imgAspectRatio;
      } else {
        // Image is taller than canvas ratio
        drawHeight = canvasHeight * 0.9; // 90% of canvas height
        drawWidth = drawHeight * imgAspectRatio;
      }
      
      // Center the image
      drawX = (canvasWidth - drawWidth) / 2 + imageOffset.x;
      drawY = (canvasHeight - drawHeight) / 2 + imageOffset.y;
      
      ctx.drawImage(uploadedImage, drawX, drawY, drawWidth * imageScale, drawHeight * imageScale);
    }
  }, [uploadedImage, imageOffset, imageScale]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
      setImageOffset({ x: 0, y: 0 });
      setImageScale(1);
    };
    img.src = URL.createObjectURL(file);
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const coords = getCanvasCoordinates(e);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    } else if (currentTool === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current || (!isDrawing && !isDragging)) return;
    const ctx = canvasRef.current.getContext('2d');

    if (isDrawing) {
      const coords = getCanvasCoordinates(e);
      ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (isDragging) {
      const dx = (e.clientX - dragStart.x) * 0.5; // Reduced movement sensitivity
      const dy = (e.clientY - dragStart.y) * 0.5;
      setDragStart({ x: e.clientX, y: e.clientY });
      setImageOffset((prev) => ({ 
        x: Math.max(-100, Math.min(100, prev.x + dx)), // Limit movement range
        y: Math.max(-100, Math.min(100, prev.y + dy))
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) setIsDrawing(false);
    if (isDragging) setIsDragging(false);

    if (onImageChange && canvasRef.current) {
      onImageChange(canvasRef.current.toDataURL());
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current && uploadedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw the image
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgAspectRatio = uploadedImage.width / uploadedImage.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = canvasWidth * 0.9;
        drawHeight = drawWidth / imgAspectRatio;
      } else {
        drawHeight = canvasHeight * 0.9;
        drawWidth = drawHeight * imgAspectRatio;
      }
      
      drawX = (canvasWidth - drawWidth) / 2 + imageOffset.x;
      drawY = (canvasHeight - drawHeight) / 2 + imageOffset.y;
      
      ctx.drawImage(uploadedImage, drawX, drawY, drawWidth * imageScale, drawHeight * imageScale);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `medical-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Image Annotation</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              background: white;
            }
            img { 
              max-width: 100%; 
              max-height: 100vh; 
              border: 1px solid #ccc;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            @media print {
              body { padding: 0; }
              img { 
                width: 100%; 
                height: auto; 
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Medical Image Annotation" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleResetView = () => {
    setImageOffset({ x: 0, y: 0 });
    setImageScale(1);
  };

  if (!uploadedImage) {
    return (
      <div className="bg-white rounded-lg border-2 border-[var(--accent-color)] shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color)]/90 transition-all flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Upload Image
          </button>
        </div>
        
        <div className="p-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-[var(--accent-color)] hover:bg-gray-50 transition-all"
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 mb-2">Click to upload medical image</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, GIF formats</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-[var(--accent-color)] shadow-sm">
      {/* Header with tools */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Upload className="mr-2 text-[var(--accent-color)]" size={20} />
          Medical Image Annotation
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tool Selection */}
          <div className="flex items-center border rounded-lg overflow-hidden bg-white">
            {[
              { tool: 'pen', icon: Pen, label: 'Draw' }, 
              { tool: 'eraser', icon: Eraser, label: 'Erase' }, 
              { tool: 'move', icon: Move, label: 'Move' }
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                type="button"
                onClick={() => setCurrentTool(tool)}
                className={`p-2 transition-all ${
                  currentTool === tool 
                    ? 'bg-[var(--accent-color)] text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <Palette size={16} className="text-gray-600" />
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
            />
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-16"
            />
            <span className="text-xs text-gray-600 w-4">{brushSize}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={handleResetView} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-all" 
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              type="button" 
              onClick={handleClearCanvas} 
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-all" 
              title="Clear Annotations"
            >
              <Eraser size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-center">
          <div className="relative bg-white rounded-lg shadow-lg border">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`rounded-lg transition-all ${
                currentTool === 'move' ? 'cursor-move' : 'cursor-crosshair'
              }`}
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                height: 'auto',
                aspectRatio: '3/4' // A4 portrait ratio
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer with Download and Print */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Tools:</span> Use pen to draw, eraser to remove, move to reposition
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageAnnotationCanvas;