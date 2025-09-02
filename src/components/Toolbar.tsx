import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Type, 
  Image, 
  Palette, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Upload
} from "lucide-react";
import { Canvas as FabricCanvas, Textbox, FabricImage } from "fabric";
import { CanvasFormat, Theme, Project, Page } from "./InstagramEditor";
import { toast } from "sonner";

interface ToolbarProps {
  canvas: FabricCanvas | null;
  theme: Theme;
  format: CanvasFormat;
  currentProject: Project | null;
  currentPage: Page | null;
  onPageSwitch: (page: Page) => void;
  onPageDelete: (pageId: string) => void;
}

export const Toolbar = ({ 
  canvas, 
  theme, 
  format, 
  currentProject, 
  currentPage, 
  onPageSwitch, 
  onPageDelete 
}: ToolbarProps) => {
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
      
      if (active && active.type === 'textbox') {
        setTextContent(active.text || "");
        setFontSize(active.fontSize || 32);
        const fillColor = active.fill;
        if (typeof fillColor === 'string') {
          setTextColor(fillColor);
        } else {
          setTextColor("#ffffff");
        }
      }
    };

    const handleClearSelection = () => {
      setActiveObject(null);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleClearSelection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleClearSelection);
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        
        FabricImage.fromURL(imgUrl).then((img) => {
          // Scale image to fit canvas
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
            originX: 'center',
            originY: 'center',
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          toast("Image added!");
        }).catch(() => {
          toast.error("Failed to load image");
        });
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  // Update text content
  const updateText = () => {
    if (!canvas || !activeObject || activeObject.type !== 'textbox') return;
    
    (activeObject as any).set('text', textContent);
    canvas.renderAll();
  };

  // Update font size
  const updateFontSize = (size: number) => {
    if (!canvas || !activeObject || activeObject.type !== 'textbox') return;
    
    setFontSize(size);
    (activeObject as any).set('fontSize', size);
    canvas.renderAll();
  };

  // Update text color
  const updateTextColor = (color: string) => {
    if (!canvas || !activeObject || activeObject.type !== 'textbox') return;
    
    setTextColor(color);
    (activeObject as any).set('fill', color);
    canvas.renderAll();
  };

  // Text alignment
  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    if (!canvas || !activeObject || activeObject.type !== 'textbox') return;
    
    (activeObject as any).set('textAlign', align);
    canvas.renderAll();
  };

  // Delete active object
  const deleteObject = () => {
    if (!canvas || !activeObject) return;
    
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
    toast("Object deleted!");
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvas) return;
    
    canvas.clear();
    canvas.backgroundColor = theme === "instagram" 
      ? "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"
      : theme === "minimal" 
      ? "#ffffff" 
      : "#1a1a1a";
    canvas.renderAll();
    toast("Canvas cleared!");
  };

  return (
    <div className="w-80 border-l border-border bg-card">
      <ScrollArea className="h-full custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* Tools */}
          <div>
            <h3 className="font-medium text-sm mb-3 text-foreground">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={addText}
                variant="outline" 
                size="sm"
                className="transition-smooth hover:bg-primary/10"
              >
                <Type className="w-4 h-4 mr-1" />
                Text
              </Button>
              <Button 
                onClick={addImage}
                variant="outline" 
                size="sm"
                className="transition-smooth hover:bg-primary/10"
              >
                <Upload className="w-4 h-4 mr-1" />
                Image
              </Button>
            </div>
          </div>

          {/* Page Navigation */}
          {currentProject && currentProject.pages.length > 1 && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-foreground">Pages</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {currentProject.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-smooth ${
                      currentPage?.id === page.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-accent/50 border border-transparent'
                    }`}
                    onClick={() => onPageSwitch(page)}
                  >
                    {page.thumbnail && (
                      <img 
                        src={page.thumbnail} 
                        alt={page.name}
                        className="w-8 h-8 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {page.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Page {index + 1}
                      </p>
                    </div>
                    {currentProject.pages.length > 1 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPageDelete(page.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Text Properties */}
          {activeObject && activeObject.type === 'textbox' && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-foreground">Text Properties</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content" className="text-xs">Content</Label>
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
                  <Label htmlFor="font-size" className="text-xs">Font Size</Label>
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
                  <Label htmlFor="text-color" className="text-xs">Color</Label>
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
                    <Button 
                      onClick={() => setTextAlign('left')}
                      variant="outline" 
                      size="sm"
                      className="p-2"
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button 
                      onClick={() => setTextAlign('center')}
                      variant="outline" 
                      size="sm"
                      className="p-2"
                    >
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button 
                      onClick={() => setTextAlign('right')}
                      variant="outline" 
                      size="sm"
                      className="p-2"
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
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
              <Button 
                onClick={clearCanvas}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Clear Canvas
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};