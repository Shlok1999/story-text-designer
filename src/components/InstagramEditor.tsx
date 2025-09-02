import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Palette, Download, Smartphone, Square } from "lucide-react";

export type CanvasFormat = "post" | "story";
export type Theme = "instagram" | "minimal" | "dark";

export interface Project {
  id: string;
  name: string;
  format: CanvasFormat;
  theme: Theme;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  canvasData?: any;
}

export const InstagramEditor = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>("instagram-projects", []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>("post");
  const [activeTheme, setActiveTheme] = useState<Theme>("instagram");
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);

  // Create new project
  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Project ${projects.length + 1}`,
      format: canvasFormat,
      theme: activeTheme,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    toast("New project created!");
  };

  // Save current project
  const saveProject = () => {
    if (!currentProject || !fabricCanvas) return;
    
    const canvasData = fabricCanvas.toJSON();
    const thumbnail = fabricCanvas.toDataURL({ 
      format: 'png', 
      quality: 0.8,
      multiplier: 0.2
    });
    
    const updatedProject = {
      ...currentProject,
      canvasData,
      thumbnail,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = projects.map(p => 
      p.id === currentProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    toast("Project saved!");
  };

  // Load project
  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setCanvasFormat(project.format);
    setActiveTheme(project.theme);
    toast(`Loaded ${project.name}`);
  };

  // Export canvas
  const exportCanvas = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: canvasFormat === "post" ? 2 : 1.5
    });
    
    const link = document.createElement('a');
    link.download = `instagram-${canvasFormat}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast("Image downloaded!");
  };

  useEffect(() => {
    if (projects.length === 0) {
      createNewProject();
    } else if (!currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [projects]);

  const canvasDimensions = canvasFormat === "post" 
    ? { width: 1080, height: 1080 } 
    : { width: 1080, height: 1920 };

  return (
    <div className="h-screen flex bg-gradient-subtle">
      {/* Sidebar */}
      <Sidebar 
        projects={projects}
        currentProject={currentProject}
        onLoadProject={loadProject}
        onCreateNew={createNewProject}
      />
      
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="toolbar-container p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-playfair font-semibold text-foreground">
              {currentProject?.name || "Instagram Editor"}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant={canvasFormat === "post" ? "default" : "outline"}
                size="sm"
                onClick={() => setCanvasFormat("post")}
                className="transition-smooth"
              >
                <Square className="w-4 h-4 mr-1" />
                Post
              </Button>
              <Button
                variant={canvasFormat === "story" ? "default" : "outline"}
                size="sm"
                onClick={() => setCanvasFormat("story")}
                className="transition-smooth"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Story
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value as Theme)}
                className="bg-background border border-border rounded-md px-3 py-1 text-sm transition-smooth focus:ring-2 focus:ring-primary"
              >
                <option value="instagram">Instagram</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <Button onClick={saveProject} variant="outline" size="sm">
              Save
            </Button>
            <Button onClick={exportCanvas} size="sm" className="bg-gradient-primary">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <Card className="canvas-container p-6 h-full flex items-center justify-center">
              <Canvas
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                theme={activeTheme}
                format={canvasFormat}
                project={currentProject}
                onCanvasReady={setFabricCanvas}
              />
            </Card>
          </div>
          
          {/* Toolbar */}
          <Toolbar 
            canvas={fabricCanvas}
            theme={activeTheme}
            format={canvasFormat}
          />
        </div>
      </div>
    </div>
  );
};