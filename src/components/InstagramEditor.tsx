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
export type Theme = "instagram" | "minimal" | "dark";

export interface Page {
  id: string;
  name: string;
  canvasData?: any;
  thumbnail?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  format: CanvasFormat;
  theme: Theme;
  pages: Page[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export const InstagramEditor = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>("instagram-projects", []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>("post");
  const [activeTheme, setActiveTheme] = useState<Theme>("instagram");
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);

  // Create new project
  const createNewProject = () => {
    const firstPage: Page = {
      id: Date.now().toString(),
      name: "Page 1",
      createdAt: new Date().toISOString(),
    };

    const newProject: Project = {
      id: (Date.now() + 1).toString(),
      name: `Project ${projects.length + 1}`,
      format: canvasFormat,
      theme: activeTheme,
      pages: [firstPage],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    setCurrentPage(firstPage);
    toast("New project created!");
  };

  // Add new page to current project
  const addNewPage = () => {
    if (!currentProject) return;
    
    const newPage: Page = {
      id: Date.now().toString(),
      name: `Page ${currentProject.pages.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    
    const updatedProject = {
      ...currentProject,
      pages: [...currentProject.pages, newPage],
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = projects.map(p => 
      p.id === currentProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    setCurrentPage(newPage);
    toast("New page added!");
  };

  // Delete page
  const deletePage = (pageId: string) => {
    if (!currentProject || currentProject.pages.length <= 1) {
      toast.error("Cannot delete the last page!");
      return;
    }
    
    const updatedPages = currentProject.pages.filter(p => p.id !== pageId);
    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = projects.map(p => 
      p.id === currentProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    
    // Switch to first page if current page was deleted
    if (currentPage?.id === pageId) {
      setCurrentPage(updatedPages[0]);
    }
    
    toast("Page deleted!");
  };

  // Switch to page
  const switchToPage = (page: Page) => {
    if (currentPage?.id === page.id) return;
    
    // Save current page before switching
    if (currentPage && fabricCanvas) {
      saveCurrentPage();
    }
    
    setCurrentPage(page);
    toast(`Switched to ${page.name}`);
  };

  // Save current page
  const saveCurrentPage = () => {
    if (!currentProject || !currentPage || !fabricCanvas) return;
    
    const canvasData = fabricCanvas.toJSON();
    const thumbnail = fabricCanvas.toDataURL({ 
      format: 'png', 
      quality: 0.8,
      multiplier: 0.2
    });
    
    const updatedPage = {
      ...currentPage,
      canvasData,
      thumbnail,
    };
    
    const updatedPages = currentProject.pages.map(p => 
      p.id === currentPage.id ? updatedPage : p
    );
    
    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      thumbnail: updatedPages[0].thumbnail || currentProject.thumbnail,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = projects.map(p => 
      p.id === currentProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    setCurrentPage(updatedPage);
  };

  // Save project (now saves current page)
  const saveProject = () => {
    saveCurrentPage();
    toast("Project saved!");
  };

  // Load project
  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentPage(project.pages[0] || null);
    setCanvasFormat(project.format);
    setActiveTheme(project.theme);
    toast(`Loaded ${project.name}`);
  };

  // Export single page
  const exportPage = (page: Page) => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: canvasFormat === "post" ? 2 : 1.5
    });
    
    const link = document.createElement('a');
    link.download = `${currentProject?.name || 'project'}-${page.name}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast(`${page.name} downloaded!`);
  };

  // Export all pages
  const exportAllPages = async () => {
    if (!currentProject || !fabricCanvas) return;
    
    const currentCanvasData = fabricCanvas.toJSON();
    let exportedCount = 0;
    
    for (const page of currentProject.pages) {
      if (page.canvasData) {
        // Load page data into canvas
        await new Promise<void>((resolve) => {
          fabricCanvas.loadFromJSON(page.canvasData, () => {
            fabricCanvas.renderAll();
            
            // Export this page
            const dataURL = fabricCanvas.toDataURL({
              format: 'png',
              quality: 1,
              multiplier: canvasFormat === "post" ? 2 : 1.5
            });
            
            const link = document.createElement('a');
            link.download = `${currentProject.name}-${page.name}.png`;
            link.href = dataURL;
            link.click();
            
            exportedCount++;
            resolve();
          });
        });
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Restore current canvas state
    fabricCanvas.loadFromJSON(currentCanvasData, () => {
      fabricCanvas.renderAll();
    });
    
    toast(`Exported ${exportedCount} pages!`);
  };

  useEffect(() => {
    if (projects.length === 0) {
      createNewProject();
    } else if (!currentProject) {
      const project = projects[0];
      setCurrentProject(project);
      setCurrentPage(project.pages[0] || null);
    }
  }, [projects]);

  // Auto-save when switching pages
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPage && fabricCanvas) {
        saveCurrentPage();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, fabricCanvas]);

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
            
            {/* Page Controls */}
            {currentProject && (
              <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentProject.pages.findIndex(p => p.id === currentPage?.id) + 1} of {currentProject.pages.length}
                </span>
                <Button onClick={addNewPage} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Page
                </Button>
              </div>
            )}
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
            <Button 
              onClick={() => currentPage && exportPage(currentPage)} 
              variant="outline" 
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Page
            </Button>
            {currentProject && currentProject.pages.length > 1 && (
              <Button onClick={exportAllPages} size="sm" className="bg-gradient-primary">
                <Download className="w-4 h-4 mr-1" />
                Export All ({currentProject.pages.length})
              </Button>
            )}
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
                page={currentPage}
                onCanvasReady={setFabricCanvas}
              />
            </Card>
          </div>
          
          {/* Toolbar */}
          <Toolbar 
            canvas={fabricCanvas}
            theme={activeTheme}
            format={canvasFormat}
            currentProject={currentProject}
            currentPage={currentPage}
            onPageSwitch={switchToPage}
            onPageDelete={deletePage}
          />
        </div>
      </div>
    </div>
  );
};