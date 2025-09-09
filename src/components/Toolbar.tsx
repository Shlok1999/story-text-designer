import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  Upload,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Canvas as FabricCanvas, Textbox, FabricImage } from "fabric";
import { CanvasFormat, Theme } from "./InstagramEditor";
import { toast } from "sonner";

interface ToolbarProps {
  canvas: FabricCanvas | null;
  theme: Theme;
  format: CanvasFormat;
}

export const Toolbar = ({ canvas, theme }: ToolbarProps) => {
  const [activeObject, setActiveObject] = useState<any>(null);
  const [textContent, setTextContent] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#ffffff");

  // Handle canvas selection changes
  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject() as any;
      setActiveObject(active);

      if (active && active.type === "textbox") {
        setTextContent(active.text || "");
        setFontSize(active.fontSize || 32);
        const fillColor = active.fill;
        setTextColor(typeof fillColor === "string" ? fillColor : "#ffffff");
      }
    };

    const handleClearSelection = () => {
      setActiveObject(null);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleClearSelection);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleClearSelection);
    };
  }, [canvas]);

  // Add text
  const addText = () => {
    if (!canvas) return;

    const text = new Textbox("New text", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 32,
      fill: theme === "minimal" ? "#333333" : "#ffffff",
      fontFamily: "Inter",
      textAlign: "center",
      originX: "center",
      originY: "center",
      width: canvas.width * 0.8,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    toast("Text added!");
  };

  // Add image
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;

        FabricImage.fromURL(imgUrl)
          .then((img) => {
            const canvasAspect = canvas.width / canvas.height;
            const imgAspect = img.width / img.height;

            let scale = 1;
            if (imgAspect > canvasAspect) {
              scale = (canvas.width * 0.6) / img.width;
            } else {
              scale = (canvas.height * 0.6) / img.height;
            }

            img.scale(scale);
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: "center",
              originY: "center",
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            toast("Image added!");
          })
          .catch(() => {
            toast.error("Failed to load image");
          });
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  // Update text content
  const updateText = () => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== "textbox") return;

    active.set("text", textContent);
    canvas.renderAll();
  };

  // Update font size
  const updateFontSize = (size: number) => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== "textbox") return;

    setFontSize(size);
    active.set("fontSize", size);
    canvas.renderAll();
  };

  // Update text color
  const updateTextColor = (color: string) => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== "textbox") return;

    setTextColor(color);
    active.set("fill", color);
    canvas.renderAll();
  };

  // Text alignment
  const setTextAlign = (align: "left" | "center" | "right") => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active || active.type !== "textbox") return;

    active.set("textAlign", align);
    canvas.renderAll();
  };

  // Delete active object
  const deleteObject = () => {
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
    toast("Object deleted!");
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor =
      theme === "instagram"
        ? "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"
        : theme === "minimal"
        ? "#ffffff"
        : "#1a1a1a";
    canvas.renderAll();
    toast("Canvas cleared!");
  };

  // Z-index helpers
  const getSelectedObjects = (active: any) => {
    if (!active) return [];
    if (active.type === "activeSelection" && typeof active.getObjects === "function") {
      return active.getObjects();
    }
    if (Array.isArray((active as any).objects)) {
      return (active as any).objects;
    }
    return [active];
  };

  const bringToFront = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active) return toast.error("No selection");

    const objs = getSelectedObjects(active);
    const maxIndex = canvas.getObjects().length - 1;

    objs.forEach((obj: any, i: number) => {
      canvas.moveObjectTo(obj, Math.max(0, maxIndex - i));
    });

    canvas.renderAll();
    toast("Brought to front!");
  };

  const sendToBack = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active) return toast.error("No selection");

    const objs = getSelectedObjects(active);
    objs.forEach((obj: any, i: number) => {
      canvas.moveObjectTo(obj, i);
    });

    canvas.renderAll();
    toast("Sent to back!");
  };

  const bringForward = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active) return toast.error("No selection");

    const objs = getSelectedObjects(active);
    objs.forEach((obj: any) => {
      const idx = canvas.getObjects().indexOf(obj);
      if (idx !== -1) {
        canvas.moveObjectTo(obj, Math.min(idx + 1, canvas.getObjects().length - 1));
      }
    });

    canvas.renderAll();
    toast("Brought forward!");
  };

  const sendBackward = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active) return toast.error("No selection");

    const objs = getSelectedObjects(active);
    objs.forEach((obj: any) => {
      const idx = canvas.getObjects().indexOf(obj);
      if (idx !== -1) {
        canvas.moveObjectTo(obj, Math.max(idx - 1, 0));
      }
    });

    canvas.renderAll();
    toast("Sent backward!");
  };

  return (
    <div className="w-80 border-l border-border bg-card">
      <ScrollArea className="h-full custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* Tools */}
          <div>
            <h3 className="font-medium text-sm mb-3 text-foreground">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={addText} variant="outline" size="sm">
                <Type className="w-4 h-4 mr-1" />
                Text
              </Button>
              <Button onClick={addImage} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Image
              </Button>
            </div>
          </div>

          <Separator />

          {/* Text Properties */}
          {activeObject && activeObject.type === "textbox" && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-foreground">Text Properties</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content" className="text-xs">
                    Content
                  </Label>
                  <Textarea
                    id="text-content"
                    value={textContent}
                    onChange={(e) => {
                      setTextContent(e.target.value);
                      updateText();
                    }}
                    placeholder="Enter text..."
                    className="mt-1 text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="font-size" className="text-xs">
                    Font Size
                  </Label>
                  <Input
                    id="font-size"
                    type="number"
                    value={fontSize}
                    onChange={(e) => updateFontSize(parseInt(e.target.value) || 32)}
                    className="mt-1 text-sm"
                    min="8"
                    max="200"
                  />
                </div>

                <div>
                  <Label htmlFor="text-color" className="text-xs">
                    Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => updateTextColor(e.target.value)}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => updateTextColor(e.target.value)}
                      className="flex-1 text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Alignment</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Button onClick={() => setTextAlign("left")} variant="outline" size="sm" className="p-2">
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => setTextAlign("center")} variant="outline" size="sm" className="p-2">
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => setTextAlign("right")} variant="outline" size="sm" className="p-2">
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Z-Index Controls */}
          {activeObject && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-foreground">Layering</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={bringToFront} variant="outline" size="sm" title="Bring to Front">
                  <BringToFront className="w-4 h-4" />
                </Button>
                <Button onClick={sendToBack} variant="outline" size="sm" title="Send to Back">
                  <SendToBack className="w-4 h-4" />
                </Button>
                <Button onClick={bringForward} variant="outline" size="sm" title="Bring Forward">
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button onClick={sendBackward} variant="outline" size="sm" title="Send Backward">
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <h3 className="font-medium text-sm mb-3 text-foreground">Actions</h3>
            <div className="space-y-2">
              {activeObject && (
                <Button
                  onClick={deleteObject}
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              )}
              <Button onClick={clearCanvas} variant="outline" size="sm" className="w-full">
                Clear Canvas
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
