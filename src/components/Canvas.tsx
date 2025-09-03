import { useEffect, useRef } from "react";
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

  // Theme backgrounds
  const getThemeBackground = (canvas?: FabricCanvas) => {
    switch (theme) {
      case "instagram":
        if (!canvas) return "#833ab4";
        const instagramGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        instagramGradient.addColorStop(0, "#833ab4");
        instagramGradient.addColorStop(0.5, "#fd1d1d");
        instagramGradient.addColorStop(1, "#fcb045");
        return instagramGradient;
      case "ocean":
        if (!canvas) return "#2E3192";
        const oceanGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        oceanGradient.addColorStop(0, "#2E3192");
        oceanGradient.addColorStop(1, "#1BFFFF");
        return oceanGradient;
      case "sunset":
        if (!canvas) return "#ff7e5f";
        const sunsetGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        sunsetGradient.addColorStop(0, "#ff7e5f");
        sunsetGradient.addColorStop(1, "#feb47b");
        return sunsetGradient;
      case "forest":
        if (!canvas) return "#134E5E";
        const forestGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        forestGradient.addColorStop(0, "#134E5E");
        forestGradient.addColorStop(1, "#71B280");
        return forestGradient;
      case "neon":
        if (!canvas) return "#00f260";
        const neonGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        neonGradient.addColorStop(0, "#00f260");
        neonGradient.addColorStop(1, "#0575e6");
        return neonGradient;
      case "pastel":
        if (!canvas) return "#a1c4fd";
        const pastelGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        pastelGradient.addColorStop(0, "#a1c4fd");
        pastelGradient.addColorStop(1, "#c2e9fb");
        return pastelGradient;
      case "royal":
        if (!canvas) return "#141E30";
        const royalGradient = canvas.contextContainer.createLinearGradient(0, 0, canvas.width!, canvas.height!);
        royalGradient.addColorStop(0, "#141E30");
        royalGradient.addColorStop(1, "#243B55");
        return royalGradient;
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
    });

    // Set actual dimensions for export (higher resolution)
    canvas.setDimensions({
      width: displayWidth,
      height: displayHeight
    }, {
      cssOnly: false
    });

    // Set background
    canvas.backgroundColor = getThemeBackground(canvas);

    // Store reference
    fabricCanvasRef.current = canvas;

    // Load page data if available
    const loadCanvasData = () => {
      if (page?.canvasData) {
        canvas.loadFromJSON(page.canvasData, () => {
          canvas.renderAll(); // Force render after loading
        });
      } else {
        // Add welcome text for new pages
        const welcomeText = new Textbox("Tap to edit text", {
          left: displayWidth / 2,
          top: displayHeight / 2,
          fontSize: 32,
          fill: theme === "minimal" || theme === "pastel" ? "#333333" : "#ffffff",
          fontFamily: "Inter",
          textAlign: "center",
          originX: "center",
          originY: "center",
          width: displayWidth * 0.8,
        });

        canvas.add(welcomeText);
        canvas.setActiveObject(welcomeText);
        canvas.renderAll(); // Force render after adding text
      }
    };

    loadCanvasData();

    // Setup canvas events
    canvas.on('selection:created', () => {
      console.log('Object selected');
    });

    canvas.on('object:modified', () => {
      console.log('Object modified');
    });

    // Initialize drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = theme === "minimal" || theme === "pastel" ? "#333333" : "#ffffff";
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

  // Update when page changes - this ensures the canvas re-renders
  useEffect(() => {
    if (fabricCanvasRef.current && page) {
      // Clear the canvas first
      fabricCanvasRef.current.clear();
      
      // Set the background
      fabricCanvasRef.current.backgroundColor = getThemeBackground(fabricCanvasRef.current);
      
      // Load the page data
      if (page.canvasData) {
        fabricCanvasRef.current.loadFromJSON(page.canvasData, () => {
          fabricCanvasRef.current?.renderAll(); // Force render
        });
      } else {
        // Add default content for empty pages
        const displayWidth = fabricCanvasRef.current.width || 500;
        const displayHeight = fabricCanvasRef.current.height || 500;
        
        const welcomeText = new Textbox("Tap to edit text", {
          left: displayWidth / 2,
          top: displayHeight / 2,
          fontSize: 32,
          fill: theme === "minimal" || theme === "pastel" ? "#333333" : "#ffffff",
          fontFamily: "Inter",
          textAlign: "center",
          originX: "center",
          originY: "center",
          width: displayWidth * 0.8,
        });

        fabricCanvasRef.current.add(welcomeText);
        fabricCanvasRef.current.renderAll(); // Force render
      }

      // Update brush color
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = theme === "minimal" || theme === "pastel" ? "#333333" : "#ffffff";
      }
    }
  }, [page?.id, theme]);

  // Update theme when it changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = getThemeBackground(fabricCanvasRef.current);
      
      // Update brush color when theme changes
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = theme === "minimal" || theme === "pastel" ? "#333333" : "#ffffff";
      }

      fabricCanvasRef.current.renderAll(); // Force render
    }
  }, [theme]);

  return (
    <div className="canvas-wrapper flex items-center justify-center">
      <div
        className="canvas-container relative rounded-lg overflow-hidden shadow-elegant border-2 border-border/50"
        style={{
          background: getThemeBackground(fabricCanvasRef.current || undefined),
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
//End