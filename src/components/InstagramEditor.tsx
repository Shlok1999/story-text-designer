import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Palette, Download, Smartphone, Square, Plus, Trash2 } from "lucide-react";

export type CanvasFormat = "post" | "story";
export type Theme = "instagram" | "minimal" | "dark" | "ocean" | "sunset" | "forest" | "neon" | "pastel" | "royal";

export interface CanvasPage {
  id: string;
  format: CanvasFormat;
  theme: Theme;
  canvasData?: any;
  thumbnail?: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  format: CanvasFormat;
  theme: Theme;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  pages: CanvasPage[];
}

export const InstagramEditor = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>("instagram-projects", []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>("post");
  const [activeTheme, setActiveTheme] = useState<Theme>("instagram");
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);

  // Get current page - add safe access
  const currentPage = currentProject?.pages?.[currentPageIndex] || null;

  // Create new project
  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Project ${(projects?.length || 0) + 1}`,
      format: canvasFormat,
      theme: activeTheme,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: Date.now().toString(),
          format: canvasFormat,
          theme: activeTheme,
          name: "Page 1"
        }
      ]
    };

    const updatedProjects = [newProject, ...(projects || [])];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    setCurrentPageIndex(0);
    toast("New project created!");
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = (projects || []).filter(p => p.id !== projectId);
    setProjects(updatedProjects);

    // If we're deleting the current project, clear it
    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProjects[0] || null);
      setCurrentPageIndex(0);
    }
    toast("Project deleted");
  };

  // In InstagramEditor.tsx, add this useEffect to handle canvas disposal
useEffect(() => {
  return () => {
    if (fabricCanvas) {
      fabricCanvas.dispose();
    }
  };
}, []);

  // Add new page to current project
  const addNewPage = () => {
    if (!currentProject) return;
    
    const newPage: CanvasPage = {
      id: Date.now().toString(),
      format: canvasFormat,
      theme: activeTheme,
      name: `Page ${(currentProject.pages?.length || 0) + 1}`
    };

    const updatedProject = {
      ...currentProject,
      pages: [...(currentProject.pages || []), newPage],
      updatedAt: new Date().toISOString(),
    };

    setProjects((projects || []).map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setCurrentPageIndex((updatedProject.pages?.length || 1) - 1);
    toast("New page added!");
  };

  // Delete current page
  const deleteCurrentPage = () => {
    if (!currentProject || (currentProject.pages?.length || 0) <= 1) return;
    
    const updatedPages = (currentProject.pages || []).filter((_, index) => index !== currentPageIndex);
    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    const newPageIndex = Math.min(currentPageIndex, (updatedPages.length || 1) - 1);
    
    setProjects((projects || []).map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
    setCurrentPageIndex(newPageIndex);
    toast("Page deleted");
  };

  // Save current page
  const saveProject = () => {
    if (!currentProject || !fabricCanvas || !currentPage) return;
    
    const canvasData = fabricCanvas.toJSON();
    const thumbnail = fabricCanvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: 0.2
    });

    const updatedPages = [...(currentProject.pages || [])];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      canvasData,
      thumbnail,
    };

    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = (projects || []).map(p =>
      p.id === currentProject.id ? updatedProject : p
    );

    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    toast("Project saved!");
  };
  
  //Save project every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProject();
    }, 100000);

    return () => clearInterval(interval);
  }, [currentProject, fabricCanvas, currentPage]);

  // Load project
  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setCanvasFormat(project.format);
    setActiveTheme(project.theme);
    setCurrentPageIndex(0);
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

  // Update canvas format for current page
  const updateCanvasFormat = (format: CanvasFormat) => {
    if (!currentProject || !currentPage) return;
    
    setCanvasFormat(format);
    
    const updatedPages = [...(currentProject.pages || [])];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      format,
    };

    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    setProjects((projects || []).map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  // Update theme for current page
  const updateTheme = (theme: Theme) => {
    if (!currentProject || !currentPage) return;
    
    setActiveTheme(theme);
    
    const updatedPages = [...(currentProject.pages || [])];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      theme,
    };

    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    setProjects((projects || []).map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentProject(updatedProject);
  };

  useEffect(() => {
    if (!projects || projects.length === 0) {
      createNewProject();
    } else if (!currentProject) {
      setCurrentProject(projects[0]);
      setCurrentPageIndex(0);
    }
  }, [projects]);

  useEffect(() => {
    if (currentPage) {
      setCanvasFormat(currentPage.format);
      setActiveTheme(currentPage.theme);
    }
  }, [currentPage]);

  const canvasDimensions = canvasFormat === "post"
    ? { width: 1080, height: 1080 }
    : { width: 1080, height: 1920 };

  return (
    <div className="h-screen flex bg-gradient-subtle">
      {/* Sidebar */}
      <Sidebar
        projects={projects || []}
        currentProject={currentProject}
        onLoadProject={loadProject}
        onCreateNew={createNewProject}
        onDeleteProject={deleteProject}
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
                onClick={() => updateCanvasFormat("post")}
                className="transition-smooth"
              >
                <Square className="w-4 h-4 mr-1" />
                Post
              </Button>
              <Button
                variant={canvasFormat === "story" ? "default" : "outline"}
                size="sm"
                onClick={() => updateCanvasFormat("story")}
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
                onChange={(e) => updateTheme(e.target.value as Theme)}
                className="bg-background border border-border rounded-md px-3 py-1 text-sm transition-smooth focus:ring-2 focus:ring-primary"
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

            <Button onClick={exportCanvas} size="sm" className="bg-gradient-primary">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Page Navigation */}
        {currentProject && (currentProject.pages?.length || 0) > 0 && (
          <div className="px-4 py-2 bg-muted flex items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              {(currentProject.pages || []).map((page, index) => (
                <Button
                  key={page.id}
                  variant={currentPageIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPageIndex(index)}
                  className="min-w-[100px] transition-smooth"
                >
                  {page.name}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addNewPage}
              className="transition-smooth"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {(currentProject.pages?.length || 0) > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteCurrentPage}
                className="transition-smooth text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <Card className="canvas-container p-6 h-full flex flex-col items-center justify-center">
              {currentPage && (
                <Canvas
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  theme={activeTheme}
                  format={canvasFormat}
                  page={currentPage}
                  onCanvasReady={setFabricCanvas}
                />
              )}
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