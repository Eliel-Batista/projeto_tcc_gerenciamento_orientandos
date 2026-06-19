// Auth Types
export interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  profile: 'ORIENTADOR' | 'ORIENTANDO';
  token: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  profile: 'ORIENTADOR' | 'ORIENTANDO';
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  profile: 'ORIENTADOR' | 'ORIENTANDO';
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  projectType: 'TCC' | 'INICIACAO_CIENTIFICA' | 'MESTRADO' | 'DOUTORADO' | 'ESTAGIO_SUPERVISIONADO';
  startDate: string;
  endDate: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  authorName?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  taskType: 'LEITURA' | 'REUNIAO' | 'ENTREGA' | 'EVENTO' | 'OUTRA';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  priority: 'CRITICAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
  assignedToUser?: User;
  createdBy?: User;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  activities?: TaskActivity[];
  comments?: TaskComment[];
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  taskType: Task['taskType'];
  status?: Task['status'];
  dueDate?: string;
  priority: Task['priority'];
  assignedToId?: string;
  activities?: string[];
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  taskType?: Task['taskType'];
  status?: Task['status'];
  dueDate?: string;
  priority?: Task['priority'];
  assignedToId?: string;
  activities?: { id?: string; taskId?: string; description: string; completed: boolean; createdAt?: string }[];
  comments?: { id?: string; taskId?: string; authorId?: string; content: string; createdAt?: string; authorName?: string }[];
}

export interface TaskFilterCriteria {
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  projectId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'REMINDER' | 'LINK_REQUEST';
  relatedEntity?: string;
  readAt?: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  taskId: string;
  submittedBy: string;
  filePath: string;
  feedback?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
  submissionDate?: string;
  feedbackDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
}
