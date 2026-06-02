"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Github, ExternalLink, FolderGit2, Calendar, Star, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { projects } from "@/data/projects"
import { PageHeader } from "@/components/layout/page-header"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up stagger-1">
      <PageHeader
        title="My Projects"
        description="Showcase your academic and personal projects."
        action={
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Project
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">All</Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex">Web</Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex">ML/AI</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brown-800/10 rounded-sm">
                    <FolderGit2 className="h-5 w-5 text-brown-800" />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="mt-4 text-lg">{project.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-1">
                {project.tech.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> <span className="tabular-nums">{project.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> <span className="tabular-nums">{project.stars}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 gap-2">
              {project.githubLink && (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> Code
                  </a>
                </Button>
              )}
              {project.liveLink && (
                <Button size="sm" className="flex-1" asChild>
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {/* Add New Placeholder */}
        <button className="group relative flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed p-8 text-center hover:bg-muted/50 transition-colors">
          <div className="rounded-full bg-muted group-hover:bg-background p-4 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Create New Project</h3>
            <p className="text-sm text-muted-foreground">
              Add a new project to your portfolio
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
