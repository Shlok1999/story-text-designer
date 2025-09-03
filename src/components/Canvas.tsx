import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Textbox } from "fabric";
import { CanvasFormat, Theme, CanvasPage } from "./InstagramEditor";
import { toast } from "sonner";

interface CanvasProps {
  width: number;
  height: number;
  theme: Theme;
  format: CanvasFormat;
  page: CanvasPage | null;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Theme backgrounds - Fixed version
  const getThemeBackground = (canvas: FabricCanvas | null = null) => {
    // Return solid colors for themes that don't need gradients
    switch (theme) {
      case "minimal":
        return "#ffffff";
      case "dark":
        return "#1a1a1a";
      case "instagram":
        return "linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)";
      case "ocean":
        return "linear-gradient(45deg, #2E3192, #1BFFFF)";
      case "sunset":
        return "linear-gradient(45deg, #ff7e5f, #feb47b)";
      case "forest":
        return "linear-gradient(45deg, #134E5E, #71B280)";
      case "neon":
        return "linear-gradient(45deg, #00f260, #0575e6)";
      case "pastel":
        return "linear-gradient(45deg, #a1c4fd, #c2e9fb)";
      case "royal":
        return "linear-gradient(45deg, #141E30, #243B55)";
      default:
        return "#ffffff";
    }
  };

  // Get text color based on theme
  const getTextColor = () => {
    switch (theme) {
      case "minimal":
      case "pastel":
        return "#333333";
      default:
        return "#ffffff";
    }
  };

  // Initialize canvas
  const initializeCanvas = () => {
    if (!canvasRef.current) return;

    // Calculate display size
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

    // Set dimensions
    canvas.setDimensions({ width: displayWidth, height: displayHeight }, { cssOnly: false });

    // Store reference
    fabricCanvasRef.current = canvas;
    setIsInitialized(true);

    // Load page data or create default content
    loadCanvasData(canvas);

    // Setup canvas events
    setupCanvasEvents(canvas);

    // Initialize drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = getTextColor();
      canvas.freeDrawingBrush.width = 3;
    }

    onCanvasReady(canvas);
    toast.success(`${format} canvas ready!`);
  };

  // Load canvas data
  const loadCanvasData = (canvas: FabricCanvas) => {
    if (page?.canvasData) {
      canvas.loadFromJSON(page.canvasData, () => {
        canvas.renderAll();
      });
    } else {
      // Add welcome text for new pages
      const displayWidth = canvas.width || 500;
      const displayHeight = canvas.height || 500;
      
      const welcomeText = new Textbox("Tap to edit text", {
        left: displayWidth / 2,
        top: displayHeight / 2,
        fontSize: 32,
        fill: getTextColor(),
        fontFamily: "Inter",
        textAlign: "center",
        originX: "center",
        originY: "center",
        width: displayWidth * 0.8,
      });

      canvas.add(welcomeText);
      canvas.setActiveObject(welcomeText);
      canvas.renderAll();
    }
  };

  // Setup canvas events
  const setupCanvasEvents = (canvas: FabricCanvas) => {
    canvas.on('selection:created', () => {
      console.log('Object selected');
    });

    canvas.on('object:modified', () => {
      console.log('Object modified');
    });
  };

  // Update canvas background
  const updateCanvasBackground = () => {
    if (fabricCanvasRef.current) {
      const background = getThemeBackground();
      fabricCanvasRef.current.backgroundColor = background;
      
      // Also update the container background for CSS gradients
      const container = canvasRef.current?.parentElement;
      if (container) {
        container.style.background = background;
      }

      // Update brush color
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = getTextColor();
      }

      fabricCanvasRef.current.renderAll();
    }
  };

  useEffect(() => {
    initializeCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [width, height, format]);

  // Update when page changes
  useEffect(() => {
    if (fabricCanvasRef.current && page && isInitialized) {
      loadCanvasData(fabricCanvasRef.current);
    }
  }, [page?.id, isInitialized]);

  // Update theme when it changes
  useEffect(() => {
    if (fabricCanvasRef.current && isInitialized) {
      updateCanvasBackground();
    }
  }, [theme, isInitialized]);

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