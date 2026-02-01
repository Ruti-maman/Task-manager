import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { apiUrl } from '../../config';
import { AddTaskDialogComponent } from './add-task-dialog/add-task-dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class Tasks implements OnInit {
  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];
  projectId: string = '';
  projectName: string = '';
  allProjects: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private dialog: MatDialog,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.loadTasks();
    this.loadProjects();
  }

  goBack() {
    this.location.back();
  }

  loadProjects() {
    this.http.get<any[]>(`${apiUrl}/projects`).subscribe({
      next: (projects) => {
        this.allProjects = projects;
        // Find current project name
        if (this.projectId) {
          const project = projects.find((p: any) => p.id == this.projectId);
          if (project) {
            this.projectName = project.name;
            this.cdr.detectChanges();
          }
        }
      },
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  loadTasks() {
    const url = this.projectId 
      ? `${apiUrl}/tasks?projectId=${this.projectId}` 
      : `${apiUrl}/tasks`;
      
    this.http.get<any[]>(url).subscribe({
      next: (tasks) => {
        this.todoTasks = tasks.filter(t => t.status === 'todo');
        this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        this.doneTasks = tasks.filter(t => t.status === 'done');
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId, projects: this.allProjects }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const taskProjectId = this.projectId || result.projectId;
        const newTask = { 
          title: result.title,
          description: result.description,
          priority: result.priority,
          status: result.status || 'todo',
          projectId: Number(taskProjectId)
        };
        this.http.post<any>(`${apiUrl}/tasks`, newTask).subscribe({
          next: (createdTask) => {
            // Add immediately to the correct list
            if (createdTask.status === 'todo') {
              this.todoTasks = [...this.todoTasks, createdTask];
            } else if (createdTask.status === 'in-progress') {
              this.inProgressTasks = [...this.inProgressTasks, createdTask];
            } else {
              this.doneTasks = [...this.doneTasks, createdTask];
            }
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error creating task:', err)
        });
      }
    });
  }

  updateTaskStatus(task: any, newStatus: string) {
    // Remove from current list immediately
    this.todoTasks = this.todoTasks.filter(t => t.id !== task.id);
    this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== task.id);
    this.doneTasks = this.doneTasks.filter(t => t.id !== task.id);
    
    // Add to new list
    const updatedTask = { ...task, status: newStatus };
    if (newStatus === 'todo') {
      this.todoTasks = [...this.todoTasks, updatedTask];
    } else if (newStatus === 'in-progress') {
      this.inProgressTasks = [...this.inProgressTasks, updatedTask];
    } else {
      this.doneTasks = [...this.doneTasks, updatedTask];
    }
    this.cdr.detectChanges();
    
    // Update on server
    this.http.patch(`${apiUrl}/tasks/${task.id}`, { status: newStatus }).subscribe({
      error: (err) => console.error('Error updating task:', err)
    });
  }

  deleteTask(taskId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { 
        title: 'Delete Task', 
        message: 'Are you sure you want to delete this task?' 
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${apiUrl}/tasks/${taskId}`).subscribe({
          next: () => {
            this.todoTasks = this.todoTasks.filter(t => t.id !== taskId);
            this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== taskId);
            this.doneTasks = this.doneTasks.filter(t => t.id !== taskId);
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error deleting task:', err)
        });
      }
    });
  }
}