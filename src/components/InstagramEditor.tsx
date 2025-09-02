import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Palette, Download, Smartphone, Square, Plus } from "lucide-react";

export type CanvasFormat = "post" | "story";
export type Theme =
  | "instagram"
  | "minimal"
  | "dark"
  | "ocean"
  | "sunset"
  | "forest"
  | "neon"
  | "pastel"
  | "royal";

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
  const [projects, setProjects] = useLocalStorage<Project[]>(
    "instagram-projects",
    []
  );
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>("post");
  const [activeTheme, setActiveTheme] = useState<Theme>("instagram");
  const [fabricCanvases, setFabricCanvases] = useState<any[]>([]);

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

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);

    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProjects[0] || null);
    }
    toast("Project deleted");
  };

  // Save current project
  const saveProject = () => {
    if (!currentProject || fabricCanvases.length === 0) return;

    const updatedFabricData = fabricCanvases.map((fc) => ({
      data: fc.toJSON(),
      thumbnail: fc.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 0.2,
      }),
    }));

    const updatedProject = {
      ...currentProject,
      canvasData: updatedFabricData,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = projects.map((p) =>
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

  // Export all canvases
  const exportCanvas = () => {
    if (fabricCanvases.length === 0) return;

    fabricCanvases.forEach((fc, index) => {
      const dataURL = fc.toDataURL({
        format: "png",
        quality: 1,
        multiplier: canvasFormat === "post" ? 2 : 1.5,
      });

      const link = document.createElement("a");
      link.download = `instagram-${canvasFormat}-${index + 1}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    });

    toast("All canvases downloaded!");
  };

  useEffect(() => {
    if (projects.length === 0) {
      createNewProject();
    } else if (!currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [projects]);

  const canvasDimensions =
    canvasFormat === "post"
      ? { width: 1080, height: 1080 }
      : { width: 1080, height: 1920 };

  return (
    <div className="h-screen flex bg-gradient-subtle overflow-hidden">
      {/* Sidebar fixed on left */}
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onLoadProject={loadProject}
        onCreateNew={createNewProject}
        onDeleteProject={deleteProject}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header fixed at top */}
        <div className="p-4 flex items-center justify-between border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-playfair font-semibold text-foreground">
              {currentProject?.name || "Instagram Editor"}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant={canvasFormat === "post" ? "default" : "outline"}
                size="sm"
                onClick={() => setCanvasFormat("post")}
              >
                <Square className="w-4 h-4 mr-1" />
                Post
              </Button>
              <Button
                variant={canvasFormat === "story" ? "default" : "outline"}
                size="sm"
                onClick={() => setCanvasFormat("story")}
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
                className="bg-background border border-border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="instagram">Instagram</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
                <option value="ocean">Ocean</option>
                <option value="sunset">Sunset</option>
                <option value="forest">Forest</option>
                <option value="neon">Neon</option>
                <option value="pastel">Pastel</option>
                <option value="royal">Royal</option>
              </select>
            </div>
            <Button onClick={saveProject} variant="outline" size="sm">
              Save
            </Button>
            <Button
              onClick={exportCanvas}
              size="sm"
              className="bg-gradient-primary"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {fabricCanvases.map((_, index) => (
            <Card
              key={index}
              className="canvas-container p-6 mb-6 flex justify-center"
            >
              <Canvas
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                theme={activeTheme}
                format={canvasFormat}
                project={currentProject}
                onCanvasReady={(fc) => {
                  const newArr = [...fabricCanvases];
                  newArr[index] = fc;
                  setFabricCanvases(newArr);
                }}
              />
            </Card>
          ))}

          {/* Add new canvas */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setFabricCanvases([...fabricCanvases, null])}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Canvas
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar fixed on right */}
      <div className="w-64 border-l border-border bg-background sticky top-0 h-screen">
        <Toolbar
          canvas={fabricCanvases[fabricCanvases.length - 1]}
          theme={activeTheme}
          format={canvasFormat}
        />
      </div>
    </div>
  );
};
