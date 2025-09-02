import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar } from "lucide-react";
import { Project } from "./InstagramEditor";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  onLoadProject: (project: Project) => void;
  onCreateNew: () => void;
}

export const Sidebar = ({ 
  projects, 
  currentProject, 
  onLoadProject, 
  onCreateNew 
}: SidebarProps) => {
  return (
    <div className="sidebar-container w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair font-semibold text-lg">Projects</h2>
          <Button 
            onClick={onCreateNew}
            size="sm"
            className="bg-gradient-primary transition-smooth hover:shadow-glow"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>
      
      {/* Projects List */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No projects yet.</p>
              <p className="text-xs">Create your first project!</p>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.id}
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-card ${
                  currentProject?.id === project.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onLoadProject(project)}
              >
                {/* Thumbnail */}
                {project.thumbnail && (
                  <div className="mb-3 rounded-md overflow-hidden bg-muted">
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                )}
                
                {/* Project Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm truncate flex-1">
                      {project.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize"
                      >
                        {project.format}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="text-xs capitalize"
                      >
                        {project.theme}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Instagram Post Editor</p>
          <p className="mt-1">Create stunning posts & stories</p>
        </div>
      </div>
    </div>
  );
};