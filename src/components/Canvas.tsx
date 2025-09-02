import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Textbox, FabricImage } from "fabric";
import { CanvasFormat, Theme, Page } from "./InstagramEditor";
import { toast } from "sonner";

interface CanvasProps {
  width: number;
  height: number;
  theme: Theme;
  format: CanvasFormat;
  page: Page | null;
  onCanvasReady: (canvas: FabricCanvas) => void;
}

export const Canvas = ({ 
  width, 
  height, 
  theme, 
  format, 
  page, 
  onCanvasReady 
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  // Theme backgrounds
  const getThemeBackground = () => {
    switch (theme) {
      case "instagram":
        return "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)";
      case "minimal":
        return "#ffffff";
      case "dark":
        return "#1a1a1a";
      default:
        return "#ffffff";
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dispose existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // Calculate display size (maintain aspect ratio, max 600px height)
    const maxDisplayHeight = 600;
    const aspectRatio = width / height;
    const displayHeight = Math.min(maxDisplayHeight, height);
    const displayWidth = displayHeight * aspectRatio;

    // Create new canvas
    const canvas = new FabricCanvas(canvasRef.current, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: getThemeBackground(),
    });

    // Set actual dimensions for export (higher resolution)
    canvas.setDimensions({
      width: displayWidth,
      height: displayHeight
    }, {
      cssOnly: false
    });

    // Store reference
    fabricCanvasRef.current = canvas;

    // Load project data if available
    if (page?.canvasData) {
      canvas.loadFromJSON(page.canvasData, () => {
        canvas.renderAll();
      });
    } else {
      // Add welcome text for new projects
      const welcomeText = new Textbox("Tap to edit text", {
        left: displayWidth / 2,
        top: displayHeight / 2,
        fontSize: 32,
        fill: theme === "minimal" ? "#333333" : "#ffffff",
        fontFamily: "Inter",
        textAlign: "center",
        originX: "center",
        originY: "center",
        width: displayWidth * 0.8,
      });
      
      canvas.add(welcomeText);
      canvas.setActiveObject(welcomeText);
    }

    // Setup canvas events
    canvas.on('selection:created', () => {
      console.log('Object selected');
    });

    canvas.on('object:modified', () => {
      console.log('Object modified');
    });

    // Initialize drawing brush - check if it exists first
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = theme === "minimal" ? "#333333" : "#ffffff";
      canvas.freeDrawingBrush.width = 3;
    }

    onCanvasReady(canvas);
    toast(`${format} canvas ready!`);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [width, height, theme, format, page?.id]);

  // Update theme when it changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = getThemeBackground();
      
      // Update brush color when theme changes
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = theme === "minimal" ? "#333333" : "#ffffff";
      }
      
      fabricCanvasRef.current.renderAll();
    }
  }, [theme]);

  return (
    <div className="canvas-wrapper flex items-center justify-center">
      <div 
        className="canvas-container relative rounded-lg overflow-hidden shadow-elegant border-2 border-border/50"
        style={{
          background: getThemeBackground(),
        }}
      >
        <canvas 
          ref={canvasRef} 
          className="block"
        />
        
        {/* Format indicator */}
        <div className="absolute top-2 left-2 z-10">
          <div className="glass rounded-full px-3 py-1 text-xs font-medium">
            {format === "post" ? "1:1 Post" : "9:16 Story"}
          </div>
        </div>
      </div>
    </div>
  );
};