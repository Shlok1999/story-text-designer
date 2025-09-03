import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Trash2, MoreVertical } from "lucide-react";
import { Project } from "./InstagramEditor";
import { formatDistanceToNow } from "date-fns";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  onLoadProject: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const Sidebar = ({ 
  projects, 
  currentProject, 
  onLoadProject, 
  onCreateNew,
  onDeleteProject
}: SidebarProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="sidebar-container w-80 flex flex-col bg-sidebar border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-sidebar-header">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-playfair font-semibold text-lg text-foreground">Projects</h2>
          <Button 
            onClick={onCreateNew}
            size="sm"
            className="bg-gradient-primary transition-smooth hover:shadow-glow"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
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
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-card group relative ${
                  currentProject?.id === project.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-accent/30'
                }`}
                onClick={() => onLoadProject(project)}
              >
                {/* Project menu (top right corner) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{project.name}" and all its contents.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project.id);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Thumbnail */}
                {project.thumbnail ? (
                  <div className="mb-3 rounded-md overflow-hidden bg-muted border border-border">
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 rounded-md overflow-hidden bg-muted border border-border h-24 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Project Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm truncate flex-1 pr-6">
                      {project.name}
                    </h3>
                  </div>
                  
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
                  
                  <div className="flex items-center text-xs text-muted-foreground pt-1">
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
      <div className="p-4 border-t border-border bg-sidebar-footer">
        {/* User info and logout button */}
        {user && (
          <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-medium">Instagram Post Editor</p>
          <p className="mt-1">Create stunning posts & stories</p>
        </div>
      </div>
    </div>
  );
};